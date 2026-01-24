from sqlalchemy import text
from app.core.database import sync_engine

def run():
    with sync_engine.connect() as conn:
        print("Checking/Adding tsv columns...")
        # Add tsv to kbdocuments if not exists
        conn.execute(text("ALTER TABLE kbdocuments ADD COLUMN IF NOT EXISTS tsv tsvector;"))
        # Add tsv to kbchunks if not exists
        conn.execute(text("ALTER TABLE kbchunks ADD COLUMN IF NOT EXISTS tsv tsvector;"))
        conn.commit()
        print("Schema updated successfully.")

if __name__ == "__main__":
    run()
