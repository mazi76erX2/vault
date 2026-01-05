from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool, text

from app.config import settings
from app.db.base import Base

import app.models  # noqa: F401  (ensures models register in Base.metadata)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

database_url = getattr(settings, "DATABASE_URL", None) or getattr(settings, "DATABASEURL", None)
if not database_url:
    raise RuntimeError("No DATABASE URL configured")

# Convert asyncpg URL to sync URL for Alembic
if database_url.startswith("postgresql+asyncpg://"):
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def include_name(name: str | None, type_: str, parent_names: dict) -> bool:
    # Ensure Alembic "sees" both your custom auth schema and the default public schema
    if type_ == "schema":
        return name in (None, "public", "auth")
    return True


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        include_name=include_name,
        compare_type=True,
        # Keep Alembic's version table in public (explicit)
        version_table_schema="public",
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(database_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        # prerequisites (do outside Alembic's migration transaction, then commit)
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            include_name=include_name,
            compare_type=True,
            # Keep Alembic's version table in public (explicit)
            version_table_schema="public",
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
