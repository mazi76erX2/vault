# app/services/auth_service.py
"""
Authentication service - handles JWT tokens, password hashing, and user authentication
"""
import os
from datetime import datetime, timedelta
from typing import Any

from fastapi import Header, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# JWT settings from environment
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer security
security = HTTPBearer()


# ============================================================================
# PASSWORD HASHING
# ============================================================================


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)


# ============================================================================
# JWT TOKEN MANAGEMENT
# ============================================================================


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded payload dictionary or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def _extract_bearer_token(authorization: str | None = Header(None)) -> str:
    """
    Extract bearer token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        Token string

    Raises:
        HTTPException: If token is missing or invalid format
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme. Use Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token


# ============================================================================
# USER AUTHENTICATION
# ============================================================================


class CurrentUser:
    """
    Current authenticated user model.
    Contains user information extracted from JWT token.
    """

    def __init__(
        self,
        user_id: str,
        email: str,
        role: str | None = None,
        company_id: int | None = None,
        **kwargs,
    ):
        self.user_id = user_id
        self.id = user_id  # Alias for compatibility
        self.email = email
        self.role = role
        self.company_id = company_id
        # Store any additional claims
        for key, value in kwargs.items():
            setattr(self, key, value)

    def __repr__(self):
        return f"CurrentUser(user_id={self.user_id}, email={self.email}, role={self.role})"


async def get_current_user(authorization: str | None = Header(None)) -> CurrentUser:
    """
    Get current authenticated user from JWT token.

    This is a FastAPI dependency that extracts and validates the JWT token
    from the Authorization header, then returns the current user information.

    Args:
        authorization: Authorization header (automatically injected by FastAPI)

    Returns:
        CurrentUser object with user information

    Raises:
        HTTPException: If token is invalid, expired, or user not found
    """
    # Extract token from header
    token = _extract_bearer_token(authorization)

    # Decode token
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user information from token
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create CurrentUser object
    current_user = CurrentUser(
        user_id=user_id,
        email=email,
        role=payload.get("role"),
        company_id=payload.get("company_id"),
        # Include any other claims
        **{
            k: v
            for k, v in payload.items()
            if k not in ["sub", "email", "role", "company_id", "exp", "iat"]
        },
    )

    return current_user


# ============================================================================
# ROLE-BASED ACCESS CONTROL
# ============================================================================


def require_roles(*allowed_roles: str):
    """
    Create a dependency that requires user to have one of the specified roles.

    Usage:
        @router.post("/endpoint", dependencies=[Depends(require_roles("Admin", "Manager"))])
        async def my_endpoint():
            ...

    Args:
        *allowed_roles: One or more role names that are allowed to access the endpoint

    Returns:
        FastAPI dependency function
    """

    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        """
        Check if current user has required role.

        Args:
            current_user: Current authenticated user

        Returns:
            CurrentUser if authorized

        Raises:
            HTTPException: If user doesn't have required role
        """
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User has no role assigned"
            )

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {', '.join(allowed_roles)}. Your role: {current_user.role}",
            )

        return current_user

    return role_checker
