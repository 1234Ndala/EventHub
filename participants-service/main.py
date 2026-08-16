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
    return participants

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
    resultats = []

    for participant in participants:
        if nom and nom.lower() in participant["nom"].lower():
            resultats.append(participant)

        if email and email.lower() == participant["email"].lower():
            resultats.append(participant)

    return resultats
@app.get("/participants/{participant_id}")
def lire_participant(participant_id: int):
    for participant in participants:
        if participant["id"] == participant_id:
            return participant

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