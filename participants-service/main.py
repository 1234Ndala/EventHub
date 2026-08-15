from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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
    nouveau_participant = participant.model_dump()
    nouveau_participant["id"] = len(participants) + 1

    participants.append(nouveau_participant)

    return nouveau_participant
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