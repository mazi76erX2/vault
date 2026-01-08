"""added project model

Revision ID: 37bcd40aa0a0
Revises: 857920179707
Create Date: 2026-01-08 03:42:26.912479

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import pgvector.sqlalchemy
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '37bcd40aa0a0'
down_revision: Union[str, Sequence[str], None] = '857920179707'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


"""add_projects_table

Revision ID: xxxx
Revises: yyyy
Create Date: 2026-01-08 03:36:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'xxxx'
down_revision = 'yyyy'  # Previous migration ID
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('manager_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_id', sa.BigInteger(), nullable=False),
        sa.Column('company_regno', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['manager_id'], ['profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
    )
    
    # Create indexes
    op.create_index('idx_projects_manager_id', 'projects', ['manager_id'])
    op.create_index('idx_projects_company_id', 'projects', ['company_id'])
    op.create_index('idx_projects_status', 'projects', ['status'])
    
    # Add project_id to chatmessagescollector table
    op.add_column('chatmessagescollector', sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        'chatmessagescollector_project_id_fkey',
        'chatmessagescollector',
        'projects',
        ['project_id'],
        ['id'],
        ondelete='SET NULL'
    )
    op.create_index('idx_chatmessagescollector_project_id', 'chatmessagescollector', ['project_id'])


def downgrade() -> None:
    # Remove project_id from chatmessagescollector
    op.drop_index('idx_chatmessagescollector_project_id', table_name='chatmessagescollector')
    op.drop_constraint('chatmessagescollector_project_id_fkey', 'chatmessagescollector', type_='foreignkey')
    op.drop_column('chatmessagescollector', 'project_id')
    
    # Drop indexes
    op.drop_index('idx_projects_status', table_name='projects')
    op.drop_index('idx_projects_company_id', table_name='projects')
    op.drop_index('idx_projects_manager_id', table_name='projects')
    
    # Drop projects table
    op.drop_table('projects')
