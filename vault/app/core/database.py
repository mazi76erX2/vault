"""
Database configuration and session management
PostgreSQL with asyncpg for async operations + sync for blocking operations (embeddings)
"""

import logging
from collections.abc import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# ASYNC ENGINE (for FastAPI endpoints)
# ============================================================================

async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get async database session"""
    async with async_session_maker() as session:
        yield session


# ============================================================================
# SYNC ENGINE (for blocking operations: embeddings, pgvector, migrations)
# ============================================================================

# Convert async URL to sync URL
SYNC_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql+psycopg2://"
)

sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Session:
    """Get sync database session for blocking operations"""
    db = SessionLocal()
    try:
        return db
    finally:
        pass  # Caller must close


# ============================================================================
# Utility Functions
# ============================================================================


async def check_db_connection() -> bool:
    """Check if database connection is working (async)"""
    try:
        async with async_engine.connect() as conn:
            await conn.execute("SELECT 1")
        logger.info("Async database connection successful")
        return True
    except Exception as e:
        logger.error(f"Async database connection failed: {e}")
        return False


def check_sync_db_connection() -> bool:
    """Check if sync database connection is working"""
    try:
        with sync_engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("Sync database connection successful")
        return True
    except Exception as e:
        logger.error(f"Sync database connection failed: {e}")
        return False
