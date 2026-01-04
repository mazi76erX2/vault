"""initial schema with auth users

Revision ID: 8fb698c314e7
Revises:
Create Date: 2026-01-04 01:20:07.404459

"""

from collections.abc import Sequence
from typing import Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8fb698c314e7"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create auth schema
    op.execute("CREATE SCHEMA IF NOT EXISTS auth")

    # Create auth.users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("encrypted_password", sa.Text(), nullable=True),
        sa.Column("email_confirmed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("invited_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("confirmation_token", sa.Text(), nullable=True),
        sa.Column("confirmation_sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("recovery_token", sa.Text(), nullable=True),
        sa.Column("recovery_sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("email_change_token_new", sa.Text(), nullable=True),
        sa.Column("email_change", sa.Text(), nullable=True),
        sa.Column("email_change_sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("last_sign_in_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("raw_app_meta_data", postgresql.JSONB(), nullable=True),
        sa.Column("raw_user_meta_data", postgresql.JSONB(), nullable=True),
        sa.Column("is_super_admin", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("phone_confirmed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("phone_change", sa.Text(), nullable=True),
        sa.Column("phone_change_token", sa.Text(), nullable=True),
        sa.Column("phone_change_sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("confirmed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("email_change_token_current", sa.Text(), nullable=True),
        sa.Column("email_change_confirm_status", sa.Integer(), nullable=True),
        sa.Column("banned_until", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("reauthentication_token", sa.Text(), nullable=True),
        sa.Column("reauthentication_sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("is_sso_user", sa.Boolean(), default=False),
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True), nullable=True),
        schema="auth",
    )

    op.create_index("ix_auth_users_email", "users", ["email"], unique=True, schema="auth")
    op.create_index("ix_auth_users_recovery_token", "users", ["recovery_token"], schema="auth")


def downgrade():
    op.drop_index("ix_auth_users_recovery_token", table_name="users", schema="auth")
    op.drop_index("ix_auth_users_email", table_name="users", schema="auth")
    op.drop_table("users", schema="auth")
    op.execute("DROP SCHEMA IF EXISTS auth CASCADE")
