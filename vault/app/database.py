"""
Database configuration and session management
PostgreSQL with asyncpg for async operations
"""

import logging

from sqlalchemy.ext.asyncio import (AsyncSession, async_sessionmaker,
                                    create_async_engine)
from sqlalchemy.orm import declarative_base

from app.config import settings

logger = logging.getLogger(__name__)

# Create async engine
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
)

# Create async session factory
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Single declarative base for all models
Base = declarative_base()


async def get_async_db():
    """Dependency to get async database session"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
