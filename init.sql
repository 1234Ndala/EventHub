CREATE DATABASE registrationsdb;

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    lieu VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    event_id INT NOT NULL
);

CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    participant_id INT NOT NULL
);
