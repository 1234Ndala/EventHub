"""
Tests du registrations-service.

Ces tests nécessitent une base PostgreSQL "registrationsdb" accessible (via les
mêmes variables d'environnement DB_HOST / DB_NAME / DB_USER / DB_PASSWORD que
l'app). Les appels vers events-service et participants-service sont mockés
pour ne pas dépendre de leur disponibilité pendant les tests.
"""
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app, creer_table, get_db

# TestClient(app) sans "with" ne déclenche pas le lifespan de l'app (qui crée la
# table normalement au démarrage). On la crée nous-mêmes ici, une seule fois,
# avant que les tests ne s'exécutent.
creer_table()

# Les tests écrivent dans la vraie base locale, qui n'est jamais vidée entre deux
# runs de pytest. Sans ce nettoyage, des lignes "confirmee" laissées par un run
# précédent (ex: un test qui a échoué avant sa propre cleanup) s'accumulent et
# faussent les tests suivants (ex: "plus de places disponibles" à tort).
_conn = get_db()
_cursor = _conn.cursor()
_cursor.execute("DELETE FROM registrations WHERE event_id IN (1, 2)")
_conn.commit()
_cursor.close()
_conn.close()

client = TestClient(app)


def mock_response(status_code=200, json_data=None):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    return resp


@patch("main.requests.get")
def test_inscrire_avec_succes(mock_get):
    # 1er appel: events-service /events/{id} -> capacite_max
    # 2e appel: participants-service /participants/{id} -> existe
    mock_get.side_effect = [
        mock_response(200, {"id": 1, "capacite_max": 100}),
        mock_response(200, {"id": 1, "nom": "Test User"}),
    ]
    donnees = {"event_id": 1, "participant_id": 1}
    response = client.post("/registrations", json=donnees)

    assert response.status_code == 200
    assert response.json()["event_id"] == 1
    assert response.json()["participant_id"] == 1
    assert response.json()["statut"] == "confirmee"

    # Nettoyage
    reg_id = response.json()["id"]
    client.delete(f"/registrations/{reg_id}")


@patch("main.requests.get")
def test_inscrire_evenement_introuvable(mock_get):
    mock_get.return_value = mock_response(404)
    donnees = {"event_id": 9999, "participant_id": 1}
    response = client.post("/registrations", json=donnees)
    assert response.status_code == 404


@patch("main.requests.get")
def test_inscrire_participant_introuvable(mock_get):
    mock_get.side_effect = [
        mock_response(200, {"id": 1, "capacite_max": 100}),
        mock_response(200, {"message": "Participant non trouve"}),
    ]
    donnees = {"event_id": 1, "participant_id": 9999}
    response = client.post("/registrations", json=donnees)
    assert response.status_code == 404


def test_lister_registrations():
    response = client.get("/registrations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@patch("main.requests.get")
def test_annuler_registration(mock_get):
    mock_get.side_effect = [
        mock_response(200, {"id": 1, "capacite_max": 100}),
        mock_response(200, {"id": 1, "nom": "Test User"}),
    ]
    creation = client.post("/registrations", json={"event_id": 1, "participant_id": 2})
    reg_id = creation.json()["id"]

    response = client.delete(f"/registrations/{reg_id}")
    assert response.status_code == 200

    # Deuxième annulation -> doit échouer, déjà annulée
    response2 = client.delete(f"/registrations/{reg_id}")
    assert response2.status_code == 404


@patch("main.requests.get")
def test_stats_event(mock_get):
    mock_get.return_value = mock_response(200, {"id": 1, "capacite_max": 100})
    response = client.get("/registrations/stats/1")
    assert response.status_code == 200
    data = response.json()
    assert "places_restantes" in data
    assert "inscriptions_confirmees" in data