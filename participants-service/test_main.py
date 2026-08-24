from fastapi.testclient import TestClient
from main import app, get_db

def creer_table():
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

creer_table()

client = TestClient(app)

def test_lire_participants():
    response = client.get("/participants")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_rechercher_participant_par_nom():
    response = client.get("/participants/search/", params={"nom": "Test"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_creer_participant():
    donnees = {
        "nom": "Test User",
        "email": "testuser_ci@example.com",
        "telephone": "70000001",
        "type": "etudiant"
    }
    response = client.post("/participants", json=donnees)
    assert response.status_code == 200
    assert response.json()["nom"] == "Test User"
    participant_id = response.json()["id"]
    client.delete(f"/participants/{participant_id}")

def test_lire_participant_inexistant():
    response = client.get("/participants/9999")
    assert response.json()["message"] == "Participant non trouve"

def test_supprimer_participant():
    donnees = {
        "nom": "Delete User",
        "email": "deleteuser_ci@example.com",
        "telephone": "70000002",
        "type": "etudiant"
    }
    response_post = client.post("/participants", json=donnees)
    assert response_post.status_code == 200
    participant_id = response_post.json()["id"]
    response_delete = client.delete(f"/participants/{participant_id}")
    assert response_delete.status_code == 200
    assert response_delete.json()["id"] == participant_id
