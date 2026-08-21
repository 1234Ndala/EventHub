from fastapi.testclient import TestClient
from main import app, conn  # adaptez selon le nom de votre connexion

# ✅ Créer la table + données de test avant les tests
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
# ✅ Remettre la séquence à zéro et insérer Awa Traore en id=1
cursor.execute("DELETE FROM participants;")
cursor.execute("ALTER SEQUENCE participants_id_seq RESTART WITH 1;")
cursor.execute("""
    INSERT INTO participants (nom, email, telephone, type)
    VALUES ('Awa Traore', 'awa@example.com', '70111111', 'consultante')
    ON CONFLICT (email) DO NOTHING;
""")
conn.commit()

client = TestClient(app)


def test_lire_participants():
    response = client.get("/participants")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_rechercher_participant_par_nom():
    response = client.get("/participants/search/", params={"nom": "Awa"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_lire_participant_par_id():
    response = client.get("/participants/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["nom"] == "Awa Traore"

def test_creer_participant():
    donnees = {
        "nom": "Test User",
        "email": "testuser@example.com",
        "telephone": "70000001",
        "type": "test"
    }
    response = client.post("/participants", json=donnees)
    assert response.status_code == 200
    assert response.json()["nom"] == "Test User"
    assert response.json()["email"] == "testuser@example.com"
    participant_id = response.json()["id"]
    client.delete(f"/participants/{participant_id}")

def test_modifier_participant():
    donnees = {
        "nom": "Awa Traore",
        "email": "awa@example.com",
        "telephone": "70111111",
        "type": "consultante"
    }
    response = client.put("/participants/1", json=donnees)
    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert response.json()["type"] == "consultante"

def test_supprimer_participant():
    donnees = {
        "nom": "Delete User",
        "email": "deleteuser@example.com",
        "telephone": "70000002",
        "type": "test"
    }
    response_post = client.post("/participants", json=donnees)
    assert response_post.status_code == 200
    participant_id = response_post.json()["id"]

    response_delete = client.delete(f"/participants/{participant_id}")
    assert response_delete.status_code == 200
    assert response_delete.json()["id"] == participant_id

    response_get = client.get(f"/participants/{participant_id}")
    assert response_get.json()["message"] == "Participant non trouve"
