from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool, text
from alembic import context
import pgvector.sqlalchemy

# Import your models
from app.models.base import Base
from app.models import *  # Import all models
from app.config import settings

# Alembic Config object
config = context.config

# Override sqlalchemy.url from settings
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL_SYNC)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

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

def create_vector_extension(connection):
    """Create pgvector extension before migrations"""
    try:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        connection.commit()
    except Exception as e:
        print(f"Extensions may already exist: {e}")

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Register pgvector type
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # Ensure pgvector extension exists
        create_vector_extension(connection)
        
        # Register vector type for Alembic
        connection.dialect.ischema_names["vector"] = pgvector.sqlalchemy.Vector
        
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
