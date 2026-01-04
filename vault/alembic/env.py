from logging.config import fileConfig

from alembic import context
import pgvector.sqlalchemy

from sqlalchemy import engine_from_config, pool, text

# Import Base + import models so they register with Base.metadata
from app.db.base import Base
import app.models  # noqa: F401  (ensures model modules are imported)  [page:0]

config = context.config

# Configure logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Database URL from settings (convert asyncpg -> sync for Alembic)
from app.config import settings

database_url = settings.DATABASE_URL
if "postgresql+asyncpg://" in database_url:
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def include_name(name: str | None, type_: str, parent_names: dict) -> bool:
    """
    Limit autogenerate to only the schemas you manage.
    Include the default schema (None) + auth schema.
    """
    if type_ == "schema":
        return name in (None, "auth")
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,      # important for auth schema [page:0][page:1]
        include_name=include_name, # avoid diffing other schemas [page:0]
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Ensure auth schema exists before any tables in it are created
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,      # important for auth schema [page:0][page:1]
            include_name=include_name, # avoid diffing other schemas [page:0]
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
