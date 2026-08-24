from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import psycopg2
import os

app = FastAPI(title="Events Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "eventsdb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password"),
        port=os.getenv("DB_PORT", "5432")
    )
    return conn

# ✅ Création de la table à l'import (fonctionne avec TestClient en CI)
_conn = get_db()
_cursor = _conn.cursor()
_cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(50),
        lieu VARCHAR(255),
        capacite_max INTEGER,
        inscrits INTEGER DEFAULT 0
    )
""")
_conn.commit()
_cursor.close()
_conn.close()


class Event(BaseModel):
    titre: str
    description: str
    date: str
    lieu: str
    capacite_max: int

class EventUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    lieu: Optional[str] = None
    capacite_max: Optional[int] = None

@app.post("/events")
def creer_event(event: Event):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO events (titre, description, date, lieu, capacite_max)
        VALUES (%s, %s, %s, %s, %s) RETURNING *
    """, (event.titre, event.description, event.date, event.lieu, event.capacite_max))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": row[0], "titre": row[1], "description": row[2], "date": row[3], "lieu": row[4], "capacite_max": row[5], "inscrits": row[6]}

@app.get("/events")
def lister_events(date: Optional[str] = None, lieu: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM events WHERE 1=1"
    params = []
    if date:
        query += " AND date = %s"
        params.append(date)
    if lieu:
        query += " AND LOWER(lieu) = LOWER(%s)"
        params.append(lieu)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"id": r[0], "titre": r[1], "description": r[2], "date": r[3], "lieu": r[4], "capacite_max": r[5], "inscrits": r[6]} for r in rows]

@app.get("/events/{id}")
def get_event(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = %s", (id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return {"id": row[0], "titre": row[1], "description": row[2], "date": row[3], "lieu": row[4], "capacite_max": row[5], "inscrits": row[6]}

@app.put("/events/{id}")
def modifier_event(id: int, update: EventUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events WHERE id = %s", (id,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    cursor.execute("""
        UPDATE events SET
            titre = COALESCE(%s, titre),
            description = COALESCE(%s, description),
            date = COALESCE(%s, date),
            lieu = COALESCE(%s, lieu),
            capacite_max = COALESCE(%s, capacite_max)
        WHERE id = %s RETURNING *
    """, (update.titre, update.description, update.date, update.lieu, update.capacite_max, id))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": row[0], "titre": row[1], "description": row[2], "date": row[3], "lieu": row[4], "capacite_max": row[5], "inscrits": row[6]}

@app.delete("/events/{id}")
def supprimer_event(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = %s RETURNING id", (id,))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    return {"message": "Événement supprimé"}

@app.get("/events/{id}/disponibilite")
def disponibilite(id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT capacite_max, inscrits FROM events WHERE id = %s", (id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    places_restantes = row[0] - row[1]
    return {"event_id": id, "capacite_max": row[0], "inscrits": row[1], "places_restantes": places_restantes, "disponible": places_restantes > 0}
