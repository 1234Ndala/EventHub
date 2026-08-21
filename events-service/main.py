import psycopg2
import os
from fastapi.testclient import TestClient
from main import app

# ✅ CRÉATION DE LA TABLE AVANT LES TESTS (indépendant de FastAPI)
conn = psycopg2.connect(
    host=os.getenv("DB_HOST", "localhost"),
    database=os.getenv("DB_NAME", "eventsdb"),
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "password"),
    port=os.getenv("DB_PORT", "5432")
)
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
    assert response.status_code in (200, 404)

def test_supprimer_event_inexistant():
    response = client.delete("/events/9999")
    assert response.status_code in (200, 404)
