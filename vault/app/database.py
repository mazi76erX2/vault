import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.baseclass import Base

try:
    from supabase import Client, create_client  # type: ignore
except Exception:  # pragma: no cover
    Client = object  # type: ignore
    create_client = None  # type: ignore


DATABASE_URL = os.getenv("DATABASE_URL", settings.database_url)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


# Supabase client (anon key) - for regular user operations with RLS
supabase: Client | None = None
if create_client and settings.supabase_key and settings.supabase_url:
    try:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_key,
        )
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")


# Supabase admin client (service role key) - for admin operations, bypasses RLS
supabase_admin: Client | None = None
if create_client and settings.supabase_service_key and settings.supabase_url:
    try:
        supabase_admin = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    except Exception as e:
        print(f"Warning: Could not initialize Supabase admin client: {e}")


# Fallback: if no anon key but service key exists, use service key for regular client
if supabase is None and supabase_admin is not None:
    supabase = supabase_admin


def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
