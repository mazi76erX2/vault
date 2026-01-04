"""
Authentication API Routes
Handles login, registration, password reset
Replaces Supabase Auth endpoints
"""

import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_async_db
from app.email_service import send_password_reset_email
from app.schemas.auth import (
    PasswordChange,
    PasswordReset,
    PasswordResetRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth_service import AuthService, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_async_db)):
    """
    Register a new user
    Replaces: Supabase sign up
    """
    try:
        profile = await AuthService.create_user(db, user_data)

        return UserResponse(
            id=str(profile.id),
            email=profile.email,
            full_name=profile.full_name,
            username=profile.username,
            company_reg_no=profile.company_reg_no,
            roles=[],
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating user account"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_async_db)):
    """
    User login
    Replaces: supabase.auth.sign_in_with_password()
    """
    try:
        result = await AuthService.authenticate_user(db, credentials.email, credentials.password)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user, profile = result

        # Update last login
        from datetime import datetime

        user.last_sign_in_at = datetime.utcnow()
        await db.commit()

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "company_reg_no": profile.company_reg_no,
            },
            expires_delta=access_token_expires,
        )

        # Create refresh token
        refresh_token = AuthService.create_refresh_token(str(user.id))

        logger.info(f"User logged in: {user.email}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error during authentication"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_async_db)):
    """Refresh access token using refresh token"""
    try:
        payload = AuthService.decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )

        user_id = payload.get("sub")
        user_data = await AuthService.get_user_with_roles(db, user_id)

        if not user_data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        # Create new tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={
                "sub": user_id,
                "email": user_data["user"]["email"],
                "company_reg_no": user_data["company_reg_no"],
            },
            expires_delta=access_token_expires,
        )

        new_refresh_token = AuthService.create_refresh_token(user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/password-reset-request")
async def request_password_reset(
    request: PasswordResetRequest, db: AsyncSession = Depends(get_async_db)
):
    """
    Request password reset
    Sends email with reset token
    """
    try:
        token = await AuthService.create_password_reset_token(db, request.email)

        if token:
            # Send email with reset link
            await send_password_reset_email(request.email, token)
            logger.info(f"Password reset email sent to: {request.email}")
        else:
            # Don't reveal if email exists
            logger.warning(f"Password reset requested for unknown email: {request.email}")

        # Always return success to prevent email enumeration
        return {
            "status": "success",
            "message": "If the email exists, a password reset link has been sent",
        }

    except Exception as e:
        logger.error(f"Error processing password reset request: {str(e)}")
        # Still return success to prevent information leakage
        return {
            "status": "success",
            "message": "If the email exists, a password reset link has been sent",
        }


@router.post("/password-reset")
async def reset_password(reset_data: PasswordReset, db: AsyncSession = Depends(get_async_db)):
    """
    Reset password using token
    """
    try:
        success = await AuthService.reset_password_with_token(
            db, reset_data.email, reset_data.token, reset_data.password
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token"
            )

        return {"status": "success", "message": "Password has been reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error resetting password"
        )


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Change password for logged-in user
    """
    try:
        user_id = current_user["user"]["id"]

        # Verify old password
        result = await AuthService.authenticate_user(
            db, current_user["user"]["email"], password_data.old_password
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password"
            )

        # Update password
        success = await AuthService.update_password(db, user_id, password_data.new_password)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating password"
            )

        logger.info(f"Password changed for user: {user_id}")

        return {"status": "success", "message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error changing password"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["user"]["id"],
        email=current_user["user"]["email"],
        full_name=current_user["profile"]["full_name"],
        username=current_user["profile"]["username"],
        company_reg_no=current_user["company_reg_no"],
        roles=current_user["roles"],
    )


@router.post("/logout")
async def logout():
    """
    Logout user
    Since we use JWT, logout is handled client-side by removing the token
    """
    return {"status": "success", "message": "Logged out successfully"}
