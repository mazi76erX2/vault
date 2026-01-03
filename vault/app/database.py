from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

# Validate the DATABASE_URL
if not settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
    raise ValueError(
        f"DATABASE_URL must use asyncpg driver for async operations. "
        f"Current: {settings.DATABASE_URL}. "
        f"Expected format: postgresql+asyncpg://user:pass@host:port/dbname"
    )

# Async engine for runtime (asyncpg)
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True,
    pool_pre_ping=True,
)

# Async session maker
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# Dependency for FastAPI
async def get_async_db():
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
