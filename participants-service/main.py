import psycopg2
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

cursor = conn.cursor()
class Participant(BaseModel):
    nom: str
    email: str
    telephone: str
    type: str

participants = []

@app.get("/participants")
def lire_participants():
    cursor.execute(
        "SELECT id, nom, email, telephone, type FROM participants;"
    )

    lignes = cursor.fetchall()

    participants_db = []

    for ligne in lignes:
        participants_db.append({
            "id": ligne[0],
            "nom": ligne[1],
            "email": ligne[2],
            "telephone": ligne[3],
            "type": ligne[4]
        })

    return participants_db

@app.post("/participants")
def creer_participant(participant: Participant):
    cursor.execute(
        """
        INSERT INTO participants (nom, email, telephone, type)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
        """,
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
        cursor.execute(
            "SELECT id, nom, email, telephone, type FROM participants WHERE nom ILIKE %s;",
            (f"%{nom}%",)
        )

    elif email:
        cursor.execute(
            "SELECT id, nom, email, telephone, type FROM participants WHERE email = %s;",
            (email,)
        )

    else:
        return {"message": "Veuillez fournir un nom ou un email"}

    lignes = cursor.fetchall()

    resultats = []

    for ligne in lignes:
        resultats.append({
            "id": ligne[0],
            "nom": ligne[1],
            "email": ligne[2],
            "telephone": ligne[3],
            "type": ligne[4]
        })

    return resultats
@app.get("/participants/{participant_id}")
def lire_participant(participant_id: int):
    cursor.execute(
        "SELECT id, nom, email, telephone, type FROM participants WHERE id = %s;",
        (participant_id,)
    )

    ligne = cursor.fetchone()

    if ligne:
        return {
            "id": ligne[0],
            "nom": ligne[1],
            "email": ligne[2],
            "telephone": ligne[3],
            "type": ligne[4]
        }

    return {"message": "Participant non trouve"}

@app.put("/participants/{participant_id}")
def modifier_participant(participant_id: int, participant: Participant):
    for index, participant_existant in enumerate(participants):
        if participant_existant["id"] == participant_id:
            participant_modifie = participant.model_dump()
            participant_modifie["id"] = participant_id

            participants[index] = participant_modifie

            return participant_modifie

    return {"message": "Participant non trouve"}
@app.delete("/participants/{participant_id}")
def supprimer_participant(participant_id: int):
    for index, participant in enumerate(participants):
        if participant["id"] == participant_id:
            participant_supprime = participants.pop(index)
            return participant_supprime

    return {"message": "Participant non trouve"}