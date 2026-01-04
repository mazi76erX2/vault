"""
Password management endpoints.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import app.email_service as email_service
from app.database import get_async_db
from app.models import Profile, Session
from app.schemas.auth import (
    ChangePasswordModel,
    CheckFirstLoginModel,
    PasswordResetRequestModel,
    PasswordResetResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/reset-password-request", response_model=PasswordResetResponse)
async def request_password_reset(
    request: PasswordResetRequestModel, db: AsyncSession = Depends(get_async_db)
):
    """Request password reset."""
    try:
        # Check if user exists
        stmt = select(Profile.id).where(Profile.email == request.email)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if not profile:
            # Don't reveal if email exists
            return PasswordResetResponse(
                status="success",
                message="If the email exists, a password reset link has been sent.",
            )

        # Generate reset token
        reset_token = AuthService.create_password_reset_token(request.email)

        # Send email
        await email_service.send_password_reset_email(request.email, reset_token)
        logger.info(f"Sent password reset link to {request.email}")

        return PasswordResetResponse(
            status="success",
            message="Password reset instructions have been sent to your email",
        )

    except Exception as e:
        logger.error(f"Error in password reset request: {e}")
        raise HTTPException(
            status_code=500, detail="Error processing password reset request"
        ) from e


@router.post("/change-password")
async def change_password(request: ChangePasswordModel, db: AsyncSession = Depends(get_async_db)):
    """Change user password (requires current password)."""
    try:
        # Get user
        user, profile = await AuthService.get_user_with_roles(db, request.user_id)

        if not user or not profile:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify current password
        if not AuthService.verify_password(request.current_password, user.encrypted_password):
            raise HTTPException(status_code=401, detail="Current password is incorrect")

        # Update password
        user.encrypted_password = AuthService.hash_password(request.new_password)

        # Update session
        stmt = select(Session).where(Session.user_id == request.user_id)
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()

        if session:
            session.password_changed = True
            session.updated_at = datetime.utcnow()

        await db.commit()
        logger.info(f"Password changed successfully for {request.user_id}")

        return {"status": "success", "message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail="Error changing password") from e


@router.post("/check-first-login")
async def check_first_login(
    request: CheckFirstLoginModel, db: AsyncSession = Depends(get_async_db)
):
    """Check if user needs to change password on first login."""
    try:
        stmt = (
            select(Session.password_changed)
            .where(Session.user_id == request.user_id)
            .order_by(Session.created_at.desc())
            .limit(1)
        )
        result = await db.execute(stmt)
        password_changed = result.scalar_one_or_none()

        if password_changed is None or not password_changed:
            # Create session if doesn't exist
            if password_changed is None:
                new_session = Session(
                    user_id=request.user_id,
                    status="Started",
                    password_changed=False,
                )
                db.add(new_session)
                await db.commit()

            return {
                "status": "success",
                "first_login": True,
                "require_password_change": True,
            }

        return {
            "status": "success",
            "first_login": False,
            "require_password_change": False,
        }

    except Exception as e:
        logger.error(f"Error checking first login status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking login status: {str(e)}") from e
