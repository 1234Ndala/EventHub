import psycopg2
from fastapi import FastAPI
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

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)
cursor = conn.cursor()

# ✅ Création de la table directement à l'import (fonctionne aussi avec TestClient)
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


# ✅ Helper : rollback automatique en cas d'erreur (évite InFailedSqlTransaction)
def safe_execute(query, params=None):
    try:
        cursor.execute(query, params)
    except Exception:
        conn.rollback()
        raise


class Participant(BaseModel):
    nom: str
    email: str
    telephone: str
    type: str


@app.get("/participants")
def lire_participants():
    safe_execute("SELECT id, nom, email, telephone, type FROM participants;")
    lignes = cursor.fetchall()
    return [{"id": l[0], "nom": l[1], "email": l[2], "telephone": l[3], "type": l[4]} for l in lignes]


@app.post("/participants")
def creer_participant(participant: Participant):
    safe_execute(
        "INSERT INTO participants (nom, email, telephone, type) VALUES (%s, %s, %s, %s) RETURNING id;",
        (participant.nom, participant.email, participant.telephone, participant.type)
    )
    nouvel_id = cursor.fetchone()[0]
    conn.commit()
    return {
        "id": nouvel_id,
        "nom": participant.nom,
        "email": participant.email,
        "telephone": participant.telephone,
        "type": participant.type
    }


@app.get("/participants/search/")
def rechercher_participant(nom: str = None, email: str = None):
    if nom:
        safe_execute(
            "SELECT id, nom, email, telephone, type FROM participants WHERE nom ILIKE %s;",
            (f"%{nom}%",)
        )
    elif email:
        safe_execute(
            "SELECT id, nom, email, telephone, type FROM participants WHERE email = %s;",
            (email,)
        )
    else:
        return {"message": "Veuillez fournir un nom ou un email"}
    lignes = cursor.fetchall()
    return [{"id": l[0], "nom": l[1], "email": l[2], "telephone": l[3], "type": l[4]} for l in lignes]


@app.get("/participants/{participant_id}")
def lire_participant(participant_id: int):
    safe_execute(
        "SELECT id, nom, email, telephone, type FROM participants WHERE id = %s;",
        (participant_id,)
    )
    ligne = cursor.fetchone()
    if ligne:
        return {"id": ligne[0], "nom": ligne[1], "email": ligne[2], "telephone": ligne[3], "type": ligne[4]}
    return {"message": "Participant non trouve"}


@app.put("/participants/{participant_id}")
def modifier_participant(participant_id: int, participant: Participant):
    safe_execute(
        "UPDATE participants SET nom = %s, email = %s, telephone = %s, type = %s WHERE id = %s RETURNING id;",
        (participant.nom, participant.email, participant.telephone, participant.type, participant_id)
    )
    ligne = cursor.fetchone()
    if ligne is None:
        conn.rollback()
        return {"message": "Participant non trouve"}
    conn.commit()
    return {
        "id": participant_id,
        "nom": participant.nom,
        "email": participant.email,
        "telephone": participant.telephone,
        "type": participant.type
    }


@app.delete("/participants/{participant_id}")
def supprimer_participant(participant_id: int):
    safe_execute(
        "DELETE FROM participants WHERE id = %s RETURNING id, nom, email, telephone, type;",
        (participant_id,)
    )
    ligne = cursor.fetchone()
    if ligne is None:
        conn.rollback()
        return {"message": "Participant non trouve"}
    conn.commit()
    return {"id": ligne[0], "nom": ligne[1], "email": ligne[2], "telephone": ligne[3], "type": ligne[4]}
