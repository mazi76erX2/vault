import os
from typing import Generator, Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.db.baseclass import Base

try:
    from supabase import create_client, Client  # type: ignore
except Exception:  # pragma: no cover
    Client = object  # type: ignore
    create_client = None  # type: ignore

DATABASE_URL = os.getenv("DATABASE_URL", settings.database_url)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

supabase: Optional["Client"] = None
if (
    create_client
    and (settings.supabase_service_key or settings.supabase_key)
    and settings.supabase_url
):
    supabase = create_client(
        settings.supabase_url,
        settings.supabase_service_key or settings.supabase_key,
    )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models so metadata is registered
    from app.models.kb import KBChunk  # noqa: F401

    Base.metadata.create_all(bind=engine)
