import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from typing import Optional
import os

load_dotenv()

def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn

@asynccontextmanager
async def lifespan(app: FastAPI):
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
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Event(BaseModel):
    titre: str
    description: str
    date: str
    lieu: str
    capacite_max: int

# ... (gardez tous vos endpoints existants tels quels ci-dessous)
