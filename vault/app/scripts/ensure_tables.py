from app.core.database import sync_engine
from app.models.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.kb import KBDocument, KBChunk
from app.models.profile import Profile
from app.models.document import Document
from sqlalchemy import text

def run():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=sync_engine)
    
    with sync_engine.connect() as conn:
        print("Checking/Adding missing columns...")
        # Ensure tsv exists (in case table was already there but without it)
        try:
            conn.execute(text("ALTER TABLE kbdocuments ADD COLUMN IF NOT EXISTS tsv tsvector;"))
            conn.execute(text("ALTER TABLE kbchunks ADD COLUMN IF NOT EXISTS tsv tsvector;"))
            conn.commit()
            print("tsv columns checked.")
        except Exception as e:
            print(f"Adding columns error (might already exist): {e}")
            conn.rollback()

    print("Database schema ensured.")

if __name__ == "__main__":
    run()
