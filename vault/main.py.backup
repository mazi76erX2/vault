# vaultmain.py
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import initdb
from app.chat import wsrouter

from app.api.auth import router as authrouter
from app.api.collector import router as collectorrouter
from app.api.helper import router as helperrouter
from app.ldap.router import router as ldaprouter
from app.api.validator import router as validatorrouter
from app.api.expert import router as expertrouter

LOGLEVEL = os.getenv("LOGLEVEL", "INFO").upper()
logging.basicConfig(
    level=LOGLEVEL,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)
logger = logging.getLogger("vault-backend")

app = FastAPI(title="Vault Backend Local", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authrouter)
app.include_router(collectorrouter)
app.include_router(helperrouter)
app.include_router(ldaprouter)
app.include_router(validatorrouter)
# app.include_router(expertrouter)

app.include_router(wsrouter)


@app.on_event("startup")
def startup() -> None:
    initdb()
    logger.info("Backend started")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
