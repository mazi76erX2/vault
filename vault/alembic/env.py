"""
Alembic environment configuration for database migrations
Using synchronous engine for migrations
"""

from logging.config import fileConfig

import pgvector.sqlalchemy
from sqlalchemy import engine_from_config, pool

from alembic import context
from app.config import settings
from app.database import Base
# Import ALL models - This is critical for autogenerate!
from app.models import (ChatMessage, ChatMessageCollector, Company, Document,
                        Profile, Role, Session, User, UserRole)

# Alembic Config object
config = context.config

# Convert async URL to sync URL for Alembic
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql+asyncpg://"):
    sync_url = database_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
else:
    sync_url = database_url

config.set_main_option("sqlalchemy.url", sync_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata - This tells Alembic what tables to track
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # ... existing code ...
    
    with connectable.connect() as connection:
        # Create necessary schemas before migrations
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))
        connection.commit()
        
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
