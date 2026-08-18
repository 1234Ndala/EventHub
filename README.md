# EventHub — Plateforme de Gestion d'Événements

Projet réalisé dans le cadre de l'examen pratique DevOps, Master 1 Intelligence Artificielle, Dakar Institute of Technology (DIT), août 2026.

---

## Présentation

EventHub est une application web de gestion d'événements académiques et culturels développée pour le DIT Dakar. Elle remplace les outils dispersés (Google Forms, Excel, emails) par une plateforme centralisée permettant de créer des événements, gérer les inscriptions des participants et suivre les statistiques en temps réel.

---

## Architecture

L'application repose sur une architecture microservices composée de quatre composants indépendants qui communiquent via des API REST :

```
EventHub/
├── events-service/          # API de gestion des événements (port 8001)
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── test_main.py
├── participants-service/    # API de gestion des participants (port 8002)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── registrations-service/  # API de gestion des inscriptions (port 8003)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Interface React (port 3000)
│   ├── src/
│   │   └── App.js
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Technologies utilisées

| Composant | Technologie |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| Base de données | PostgreSQL (via Docker) |
| Frontend | React, Lucide React |
| Conteneurisation | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Tests | Pytest, HTTPX |

---

## Prérequis

- Python 3.11+
- Node.js 18+
- Docker Desktop
- Git

---

## Installation et lancement manuel

### 1. Cloner le repository

```bash
git clone https://github.com/1234Ndala/EventHub.git
cd EventHub
```

### 2. Lancer la base de données PostgreSQL via Docker

```bash
docker run --name eventhub-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=eventsdb \
  -p 5432:5432 \
  -d postgres
```

Créer la base pour le service des inscriptions :

```bash
docker exec -it eventhub-db psql -U postgres -c "CREATE DATABASE registrationsdb;"
```

### 3. Créer les fichiers de configuration

Dans `participants-service/`, créer un fichier `.env` :

```
DB_HOST=localhost
DB_NAME=eventsdb
DB_USER=postgres
DB_PASSWORD=password
```

Dans `registrations-service/`, créer un fichier `.env` :

```
DB_HOST=localhost
DB_NAME=registrationsdb
DB_USER=postgres
DB_PASSWORD=password
```

### 4. Lancer les services backend

Ouvrir quatre terminaux et lancer dans l'ordre :

```bash
# Terminal 1 — events-service
cd events-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Terminal 2 — participants-service
cd participants-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8002

# Terminal 3 — registrations-service
cd registrations-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8003
```

### 5. Lancer le frontend

```bash
cd frontend
npm install
npm start
```

L'application est accessible sur `http://localhost:3000`.

---

## Documentation des APIs

Chaque service expose une documentation interactive générée automatiquement par FastAPI :

- events-service : `http://localhost:8001/docs`
- participants-service : `http://localhost:8002/docs`
- registrations-service : `http://localhost:8003/docs`

---

## Lancement avec Docker Compose

```bash
docker-compose up --build
```

L'ensemble des services se lance automatiquement. L'application est accessible sur `http://localhost:3000`.

---

## Tests unitaires

```bash
cd events-service
pytest test_main.py -v
```

---

## Pipeline CI/CD

Le pipeline GitHub Actions se déclenche automatiquement à chaque push sur les branches `develop` et `main`. Il exécute les étapes suivantes :

1. Checkout du code
2. Installation des dépendances Python
3. Exécution des tests unitaires
4. Build des images Docker
5. Publication des images sur Docker Hub
6. Déploiement automatique

---

## Stratégie de branches

```
main          ← version stable finale
develop       ← intégration continue
feature/*     ← développement par service
```

---

## Fonctionnalités

**Tableau de bord**
- Statistiques globales : nombre d'événements, participants, inscriptions confirmées, places disponibles
- Liste des derniers événements

**Événements**
- Créer, modifier, supprimer un événement
- Filtrer par titre ou lieu
- Vérifier les places disponibles
- Exporter en CSV / Imprimer

**Participants**
- Créer, modifier, supprimer un participant
- Types : étudiant, professeur, externe
- Recherche par nom ou email
- Exporter en CSV / Imprimer

**Inscriptions**
- Inscrire un participant à un événement
- Annuler une inscription
- Statistiques par événement
- Exporter en CSV / Imprimer

---

## Équipe

| Membre | Rôle |
|---|---|
| William M.B. Ndala | Scrum Master · events-service · Frontend (tableau de bord, export CSV, impression, icônes, recherche) |
| LOURE Zakaria | participants-service |
| Mouhamed Diop | registrations-service |
| Boris Kateta Upemba | Frontend React — structure des pages, connexion aux APIs |
| OGANDAGA Shawn Marvin | Docker Compose · GitHub Actions · Rapport |

---

*Master 1 Intelligence Artificielle · Dakar Institute of Technology · Août 2026*
