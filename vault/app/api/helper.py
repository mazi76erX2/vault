"""
Helper endpoints - migrated from Supabase to SQLAlchemy.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.middleware.auth import verify_token_with_tenant
from app.models import ChatMessageHelper
from app.services.authservice import require_roles

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/helper", tags=["helper"])


@router.post("/healthcheck", dependencies=[Depends(require_roles(["Helper"]))])
async def helper_healthcheck() -> dict[str, str]:
    """Check if the helper API is up and running."""
    return {"status": "ok", "message": "Helper API is running"}


@router.post("/add_new_chat_session")
async def add_new_chat_session(
    data: dict[str, Any],
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Create a new chat session for helper.
    """
    user_id = data.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user_id",
        )

    if str(user_id) != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="user_id does not match token user",
        )

    try:
        # Create new chat session
        chat_session = ChatMessageHelper(user_id=user_id)
        db.add(chat_session)
        await db.commit()
        await db.refresh(chat_session)

        return {
            "chatmessagesid": str(chat_session.id),
            "userid": str(user_id),
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating chat session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating chat session: {str(e)}",
        ) from e
