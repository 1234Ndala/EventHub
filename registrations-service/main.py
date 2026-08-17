from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import requests
import os

EVENTS_SERVICE_URL = os.getenv("EVENTS_SERVICE_URL", "http://localhost:8001")
PARTICIPANTS_SERVICE_URL = os.getenv("PARTICIPANTS_SERVICE_URL", "http://localhost:8002")

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "registrationsdb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password"),
        port=os.getenv("DB_PORT", "5432"),
    )

def creer_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS registrations (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL,
            participant_id INTEGER NOT NULL,
            date_inscription TIMESTAMP DEFAULT NOW(),
            statut VARCHAR(20) DEFAULT 'confirmee',
            UNIQUE(event_id, participant_id, statut)
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    creer_table()
    yield

app = FastAPI(title="Registrations Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Registration(BaseModel):
    event_id: int
    participant_id: int

def to_dict(row):
    return {"id": row[0], "event_id": row[1], "participant_id": row[2], "date_inscription": row[3].isoformat() if row[3] else None, "statut": row[4]}

def compter_inscriptions_confirmees(event_id: int) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM registrations WHERE event_id = %s AND statut = 'confirmee'", (event_id,))
    total = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return total

def verifier_event_disponible(event_id: int):
    try:
        resp = requests.get(f"{EVENTS_SERVICE_URL}/events/{event_id}", timeout=5)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="events-service injoignable")
    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Erreur events-service")
    event = resp.json()
    capacite_max = event["capacite_max"]
    inscrits = compter_inscriptions_confirmees(event_id)
    places_restantes = capacite_max - inscrits
    if places_restantes <= 0:
        raise HTTPException(status_code=409, detail="Plus de places disponibles")
    return event

def verifier_participant_existe(participant_id: int):
    try:
        resp = requests.get(f"{PARTICIPANTS_SERVICE_URL}/participants/{participant_id}", timeout=5)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="participants-service injoignable")
    if resp.status_code == 404 or (resp.status_code == 200 and resp.json().get("message") == "Participant non trouve"):
        raise HTTPException(status_code=404, detail="Participant introuvable")
    return resp.json()

@app.post("/registrations")
def inscrire(registration: Registration):
    verifier_event_disponible(registration.event_id)
    verifier_participant_existe(registration.participant_id)
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO registrations (event_id, participant_id, statut)
            VALUES (%s, %s, 'confirmee')
            RETURNING id, event_id, participant_id, date_inscription, statut
        """, (registration.event_id, registration.participant_id))
        row = cursor.fetchone()
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Ce participant est déjà inscrit")
    finally:
        cursor.close()
        conn.close()
    return to_dict(row)

@app.get("/registrations")
def lister_registrations(event_id: Optional[int] = None, participant_id: Optional[int] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT id, event_id, participant_id, date_inscription, statut FROM registrations WHERE 1=1"
    params = []
    if event_id is not None:
        query += " AND event_id = %s"
        params.append(event_id)
    if participant_id is not None:
        query += " AND participant_id = %s"
        params.append(participant_id)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [to_dict(r) for r in rows]

@app.get("/registrations/{registration_id}")
def get_registration(registration_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, event_id, participant_id, date_inscription, statut FROM registrations WHERE id = %s", (registration_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Inscription introuvable")
    return to_dict(row)

@app.delete("/registrations/{registration_id}")
def annuler(registration_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE registrations SET statut = 'annulee' WHERE id = %s AND statut = 'confirmee' RETURNING id", (registration_id,))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Inscription introuvable ou déjà annulée")
    return {"message": "Inscription annulée", "id": registration_id}

@app.get("/registrations/stats/{event_id}")
def stats_event(event_id: int):
    try:
        resp = requests.get(f"{EVENTS_SERVICE_URL}/events/{event_id}", timeout=5)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="events-service injoignable")
    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="Événement introuvable")
    capacite_max = resp.json()["capacite_max"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM registrations WHERE event_id = %s AND statut = 'confirmee'", (event_id,))
    total_confirmees = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM registrations WHERE event_id = %s AND statut = 'annulee'", (event_id,))
    total_annulees = cursor.fetchone()[0]
    cursor.close()
    conn.close()
    return {"event_id": event_id, "capacite_max": capacite_max, "inscriptions_confirmees": total_confirmees, "inscriptions_annulees": total_annulees, "places_restantes": capacite_max - total_confirmees}
