from fastapi.testclient import TestClient
from main import app, get_db

def creer_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
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
    conn.commit()
    cursor.close()
    conn.close()

creer_table()

client = TestClient(app)

def test_creer_event():
    response = client.post("/events", json={
        "titre": "Test événement",
        "description": "Description test",
        "date": "2026-09-15",
        "lieu": "Amphi A",
        "capacite_max": 50
    })
    assert response.status_code == 200
    assert response.json()["titre"] == "Test événement"

def test_lister_events():
    response = client.get("/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_event_inexistant():
    response = client.get("/events/9999")
    assert response.status_code == 404

def test_supprimer_event_inexistant():
    response = client.delete("/events/9999")
    assert response.status_code == 404
