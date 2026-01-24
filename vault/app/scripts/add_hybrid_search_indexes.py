"""
Database migration: Add hybrid search indexes
Creates full-text search and optimized vector indexes for RAG
"""

import asyncio
import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

logger = logging.getLogger(__name__)


async def add_hybrid_search_indexes():
    """Add indexes for hybrid search (vector + full-text)."""

    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        logger.info("Adding hybrid search indexes...")

        # 1. Add tsvector column if it doesn't exist
        logger.info("Adding tsv column to kbchunks...")
        await conn.execute(text("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'kbchunks' AND column_name = 'tsv'
                ) THEN
                    ALTER TABLE kbchunks ADD COLUMN tsv tsvector;
                END IF;
            END $$;
        """))

        # 2. Create trigger function
        logger.info("Creating trigger function...")
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION kbchunks_tsv_trigger() RETURNS trigger AS $$
            BEGIN
                NEW.tsv := to_tsvector('english', COALESCE(NEW.content, ''));
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        """))

        # 3. Drop trigger if exists
        logger.info("Dropping old trigger if exists...")
        await conn.execute(text("DROP TRIGGER IF EXISTS kbchunks_tsv_update ON kbchunks;"))

        # 4. Create trigger
        logger.info("Creating trigger...")
        await conn.execute(text("""
            CREATE TRIGGER kbchunks_tsv_update
                BEFORE INSERT OR UPDATE ON kbchunks
                FOR EACH ROW
                EXECUTE FUNCTION kbchunks_tsv_trigger();
        """))

        # 5. Populate existing rows
        logger.info("Populating tsvector for existing rows...")
        await conn.execute(text("""
            UPDATE kbchunks 
            SET tsv = to_tsvector('english', COALESCE(content, ''))
            WHERE tsv IS NULL;
        """))

        # 6. Create GIN index for full-text search
        logger.info("Creating GIN index for full-text search...")
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_kbchunks_tsv 
            ON kbchunks USING GIN(tsv);
        """))

        # 7. Drop old vector index if exists
        logger.info("Dropping old vector index...")
        await conn.execute(text("DROP INDEX IF EXISTS idx_kbchunks_embedding;"))

        # 8. Create IVFFlat index (faster for large datasets)
        logger.info("Creating IVFFlat index for vector search...")
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_kbchunks_embedding_ivfflat 
            ON kbchunks USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """))

        # 9. Analyze table for query planner
        logger.info("Analyzing table...")
        await conn.execute(text("ANALYZE kbchunks;"))

        logger.info("✅ Hybrid search indexes created successfully!")

    await engine.dispose()


async def remove_hybrid_search_indexes():
    """Remove hybrid search indexes (rollback)."""

    engine = create_async_engine(settings.DATABASE_URL, echo=True)

    async with engine.begin() as conn:
        logger.info("Removing hybrid search indexes...")

        # Drop indexes
        await conn.execute(text("DROP INDEX IF EXISTS idx_kbchunks_tsv;"))
        await conn.execute(text("DROP INDEX IF EXISTS idx_kbchunks_embedding_ivfflat;"))

        # Drop trigger
        await conn.execute(text("DROP TRIGGER IF EXISTS kbchunks_tsv_update ON kbchunks;"))
        await conn.execute(text("DROP FUNCTION IF EXISTS kbchunks_tsv_trigger();"))

        # Remove column
        await conn.execute(text("""
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'kbchunks' AND column_name = 'tsv'
                ) THEN
                    ALTER TABLE kbchunks DROP COLUMN tsv;
                END IF;
            END $$;
        """))

        logger.info("✅ Hybrid search indexes removed!")

    await engine.dispose()


if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        asyncio.run(remove_hybrid_search_indexes())
    else:
        asyncio.run(add_hybrid_search_indexes())
