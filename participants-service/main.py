import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "eventsdb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password"),
        port=os.getenv("DB_PORT", "5432")
    )

@app.on_event("startup")
def startup():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS participants (
            id SERIAL PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            telephone VARCHAR(50),
            type VARCHAR(100)
        );
    """)
    conn.commit()
    cursor.close()
    conn.close()

class Participant(BaseModel):
    nom: str
    email: str
    telephone: str
    type: str

@app.get("/participants")
def lire_participants():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom, email, telephone, type FROM participants;")
    lignes = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"id": l[0], "nom": l[1], "email": l[2], "telephone": l[3], "type": l[4]} for l in lignes]

@app.post("/participants")
def creer_participant(participant: Participant):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO participants (nom, email, telephone, type) VALUES (%s, %s, %s, %s) RETURNING id;",
        (participant.nom, participant.email, participant.telephone, participant.type)
    )
    nouvel_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": nouvel_id, "nom": participant.nom, "email": participant.email, "telephone": participant.telephone, "type": participant.type}

@app.get("/participants/search/")
def rechercher_participant(nom: str = None, email: str = None):
    conn = get_db()
    cursor = conn.cursor()
    if nom:
        cursor.execute("SELECT id, nom, email, telephone, type FROM participants WHERE nom ILIKE %s;", (f"%{nom}%",))
    elif email:
        cursor.execute("SELECT id, nom, email, telephone, type FROM participants WHERE email = %s;", (email,))
    else:
        return {"message": "Veuillez fournir un nom ou un email"}
    lignes = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"id": l[0], "nom": l[1], "email": l[2], "telephone": l[3], "type": l[4]} for l in lignes]

@app.get("/participants/{participant_id}")
def lire_participant(participant_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nom, email, telephone, type FROM participants WHERE id = %s;", (participant_id,))
    ligne = cursor.fetchone()
    cursor.close()
    conn.close()
    if ligne:
        return {"id": ligne[0], "nom": ligne[1], "email": ligne[2], "telephone": ligne[3], "type": ligne[4]}
    return {"message": "Participant non trouve"}

@app.put("/participants/{participant_id}")
def modifier_participant(participant_id: int, participant: Participant):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE participants SET nom = %s, email = %s, telephone = %s, type = %s WHERE id = %s RETURNING id;",
        (participant.nom, participant.email, participant.telephone, participant.type, participant_id)
    )
    ligne = cursor.fetchone()
    if ligne is None:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"message": "Participant non trouve"}
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": participant_id, "nom": participant.nom, "email": participant.email, "telephone": participant.telephone, "type": participant.type}

@app.delete("/participants/{participant_id}")
def supprimer_participant(participant_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM participants WHERE id = %s RETURNING id, nom, email, telephone, type;", (participant_id,))
    ligne = cursor.fetchone()
    if ligne is None:
        conn.rollback()
        cursor.close()
        conn.close()
        return {"message": "Participant non trouve"}
    conn.commit()
    cursor.close()
    conn.close()
    return {"id": ligne[0], "nom": ligne[1], "email": ligne[2], "telephone": ligne[3], "type": ligne[4]}
