"""add_vector_indexes

Revision ID: 73d120954acd
Revises: 259ab818c55c
Create Date: 2026-01-03 20:14:28.018644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73d120954acd'
down_revision: Union[str, Sequence[str], None] = '259ab818c55c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create HNSW index for fast similarity search
    op.execute("""
        CREATE INDEX idx_documents_embedding_hnsw 
        ON documents 
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_documents_embedding_hnsw;")

