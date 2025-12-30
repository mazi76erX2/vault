import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.chat import wsrouter
from app.api.auth import router as auth_router

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)
logger = logging.getLogger("vault-backend")

app = FastAPI(title="Vault Backend (Local)", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(wsrouter)


@app.on_event("startup")
def _startup() -> None:
    init_db()
    logger.info("Backend started")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/")
def root() -> dict:
    return {
        "name": "vault-backend",
        "mode": "local",
        "kb": "postgres+pgvector",
        "llm": "ollama",
        "auth": "supabase-local + jwt-verified",
    }
