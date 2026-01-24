"""
Authentication Middleware
JWT token verification and user context
"""

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """
    Verify JWT token and return user data
    Replaces: Supabase auth verification
    """
    try:
        token = credentials.credentials

        # Decode token
        payload = AuthService.decode_token(token)
        user_id = payload.get("sub")

        logger.info(f"Token decoded successfully. User ID: {user_id}")  # ADD THIS

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user with roles
        user_data = await AuthService.get_user_with_roles(db, user_id)

        logger.info(f"User data retrieved: {user_data.keys() if user_data else 'None'}")  # ADD THIS

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_data

    except ValueError as e:
        logger.error(f"ValueError in verify_token: {str(e)}")  # ADD THIS
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        logger.exception(e)  # ADD THIS to see full traceback
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


async def verify_token_with_tenant(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """
    Verify JWT token and enforce tenant isolation
    """
    user_data = await verify_token(credentials, db)

    if not user_data.get("company_reg_no"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User is not associated with any tenant"
        )

    return user_data


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """Dependency to get current authenticated user"""
    return await verify_token(credentials, db)


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Get current active user (checks status)"""
    if current_user["profile"]["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )
    return current_user


def require_roles(required_roles: list[str]):
    """
    Dependency to check if user has required roles
    Usage: dependencies=[Depends(require_roles(["Administrator"]))]
    """

    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_roles = current_user.get("roles", [])

        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient privileges. Required roles: {', '.join(required_roles)}",
            )

        return current_user

    return role_checker


async def get_user_company_id(current_user: dict = Depends(get_current_user)) -> int | None:
    """Get current user's company ID"""
    return current_user["profile"].get("company_id")
