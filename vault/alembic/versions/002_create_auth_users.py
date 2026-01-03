"""create auth users table

Revision ID: 002
Revises: 001
Create Date: 2026-01-03 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Create auth schema if it doesn't exist
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")
    
    # Create auth.users table (Supabase compatible)
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('encrypted_password', sa.Text(), nullable=True),
        sa.Column('email_confirmed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('invited_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('confirmation_token', sa.Text(), nullable=True),
        sa.Column('confirmation_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('recovery_token', sa.Text(), nullable=True),
        sa.Column('recovery_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('email_change_token_new', sa.Text(), nullable=True),
        sa.Column('email_change', sa.Text(), nullable=True),
        sa.Column('email_change_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('last_sign_in_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('raw_app_meta_data', postgresql.JSONB(), nullable=True),
        sa.Column('raw_user_meta_data', postgresql.JSONB(), nullable=True),
        sa.Column('is_super_admin', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('phone_confirmed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('phone_change', sa.Text(), nullable=True),
        sa.Column('phone_change_token', sa.Text(), nullable=True),
        sa.Column('phone_change_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('confirmed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('email_change_token_current', sa.Text(), nullable=True),
        sa.Column('email_change_confirm_status', sa.Integer(), nullable=True),
        sa.Column('banned_until', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('reauthentication_token', sa.Text(), nullable=True),
        sa.Column('reauthentication_sent_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('is_sso_user', sa.Boolean(), default=False),
        sa.Column('deleted_at', sa.TIMESTAMP(timezone=True), nullable=True),
        schema='auth'
    )
    
    # Create indexes
    op.create_index('ix_auth_users_email', 'users', ['email'], unique=True, schema='auth')
    op.create_index('ix_auth_users_recovery_token', 'users', ['recovery_token'], schema='auth')


def downgrade():
    op.drop_index('ix_auth_users_recovery_token', table_name='users', schema='auth')
    op.drop_index('ix_auth_users_email', table_name='users', schema='auth')
    op.drop_table('users', schema='auth')
