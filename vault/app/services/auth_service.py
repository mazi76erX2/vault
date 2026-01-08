"""
Authentication Service
Handles user authentication, registration, and JWT token management
Works with Supabase auth.users schema
"""

import logging
import secrets
from datetime import datetime, timedelta
from uuid import uuid4

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_async_db
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.auth import UserCreate

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Password hashing context (compatible with Supabase bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def coerce_user_access(value):
    """
    DB stores Profile.user_access as BIGINT.
    UserCreate.user_access comes in as string like 'admin'/'employee'.
    """
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        m = {"admin": 3, "manager": 2, "employee": 1, "viewer": 0, "guest": 0}
        return m.get(value.lower(), 1)
    return 1


class AuthService:
    """Authentication service for user management"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        password_bytes = password.encode("utf-8")[:72]
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        password_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta
            if expires_delta
            else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow(), "type": "refresh"}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and verify a JWT token"""
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except jwt.DecodeError as e:
            raise ValueError(f"Invalid token: {str(e)}")
        except jwt.ExpiredSignatureError as e:
            raise ValueError(f"Token has expired: {str(e)}")
        except Exception as e:
            raise ValueError(f"Invalid token: {str(e)}")

    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate,
        company_reg_no: str | None = None,
        created_by: str | None = None,
    ) -> Profile:
        """
        Create a new user with profile
        """
        try:
            user_id = uuid4()

            # Check if email already exists
            result = await db.execute(select(User).where(User.email == user_data.email))
            if result.scalar_one_or_none():
                raise ValueError(f"Email '{user_data.email}' is already registered")

            # Check if username already exists (if provided)
            if user_data.username:
                result = await db.execute(
                    select(Profile).where(Profile.username == user_data.username)
                )
                if result.scalar_one_or_none():
                    raise ValueError(f"Username '{user_data.username}' is already taken")

            hashed_password = AuthService.hash_password(user_data.password)
            now = datetime.utcnow()

            # Derive full_name consistently with schema
            full_name = user_data.full_name
            if not full_name:
                first = getattr(user_data, "first_name", None) or ""
                last = getattr(user_data, "last_name", None) or ""
                full_name = (f"{first} {last}").strip() or None

            # Create user in auth.users
            # Note: User model uses camelCase Python attrs that map to snake_case DB columns
            new_user = User(
                id=user_id,
                email=user_data.email,
                encryptedpassword=hashed_password,
                emailconfirmedat=now if user_data.email_confirmed else None,
                confirmedat=now if user_data.email_confirmed else None,
                createdat=now,
                updatedat=now,
                rawappmetadata={},
                rawusermetadata={"full_name": full_name},
            )
            db.add(new_user)

            # Create profile in public.profiles
            # Note: Profile model uses snake_case Python attrs
            new_profile = Profile(
                id=user_id,
                user_id=user_id,
                email=user_data.email,
                full_name=full_name,
                username=user_data.username,
                telephone=getattr(user_data, "telephone", None),
                company_id=getattr(user_data, "company_id", None),
                company_name=getattr(user_data, "company_name", None),
                company_reg_no=company_reg_no or getattr(user_data, "company_reg_no", None),
                department=getattr(user_data, "department", None),
                user_access=coerce_user_access(getattr(user_data, "user_access", None)),
                status="active",
                created_at=now,
                updated_at=now,
            )
            db.add(new_profile)

            await db.commit()
            await db.refresh(new_profile)

            logger.info(f"Created user: {user_id} ({user_data.email})")
            return new_profile

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise

    @staticmethod
    async def authenticate_user(
        db: AsyncSession, email: str, password: str
    ) -> tuple[User, Profile] | None:
        """
        Authenticate a user by email and password
        """
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                logger.warning(f"Authentication failed: User not found - {email}")
                return None

            if not getattr(user, "encryptedpassword", None):
                logger.warning(f"Authentication failed: No password set - {email}")
                return None

            if not AuthService.verify_password(password, user.encryptedpassword):
                logger.warning(f"Authentication failed: Invalid password - {email}")
                return None

            if not user.isactive:
                logger.warning(f"Authentication failed: User inactive - {email}")
                return None

            # Profile.id is UUID and equals user.id
            result = await db.execute(select(Profile).where(Profile.id == user.id))
            profile = result.scalar_one_or_none()
            if not profile:
                logger.error(f"Profile not found for user: {user.id}")
                return None

            if getattr(profile, "status", None) == "inactive":
                logger.warning(f"Authentication failed: Profile inactive - {email}")
                return None

            logger.info(f"User authenticated successfully: {email}")
            return user, profile

        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return None

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        """
        Soft-delete a user (Supabase-style)
        """
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if user:
                user.deletedat = datetime.utcnow()
                await db.commit()
                logger.info(f"Soft deleted user: {user_id}")
                return True

            logger.warning(f"User not found for deletion: {user_id}")
            return False

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise

    @staticmethod
    async def deactivate_user(db: AsyncSession, user_id: str) -> bool:
        """
        Deactivate a user (ban + mark profile inactive)
        """
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if user:
                user.banneduntil = datetime.utcnow() + timedelta(days=36500)
                user.updatedat = datetime.utcnow()

                result = await db.execute(select(Profile).where(Profile.id == user.id))
                profile = result.scalar_one_or_none()
                if profile:
                    profile.status = "inactive"
                    profile.updated_at = datetime.utcnow()

                await db.commit()
                logger.info(f"Deactivated user: {user_id}")
                return True

            logger.warning(f"User not found for deactivation: {user_id}")
            return False

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deactivating user: {str(e)}")
            raise

    @staticmethod
    async def update_password(db: AsyncSession, user_id: str, new_password: str) -> bool:
        """Update user password"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if user:
                user.encryptedpassword = AuthService.hash_password(new_password)
                user.updatedat = datetime.utcnow()
                await db.commit()
                logger.info(f"Updated password for user: {user_id}")
                return True

            return False

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating password: {str(e)}")
            raise

    @staticmethod
    async def create_password_reset_token(db: AsyncSession, email: str) -> str | None:
        """Create a password reset token"""
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return None

            reset_token = secrets.token_urlsafe(32)
            user.recoverytoken = reset_token
            user.recoverysentat = datetime.utcnow()
            await db.commit()

            logger.info(f"Created password reset token for user: {user.id}")
            return reset_token

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating password reset token: {str(e)}")
            return None

    @staticmethod
    async def verify_password_reset_token(db: AsyncSession, email: str, token: str) -> User | None:
        """Verify password reset token (1 hour expiry)"""
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user or not getattr(user, "recoverytoken", None):
                logger.warning(f"Invalid password reset token for: {email}")
                return None

            if user.recoverytoken != token:
                logger.warning(f"Password reset token mismatch for: {email}")
                return None

            sent_at = getattr(user, "recoverysentat", None)
            if sent_at and datetime.utcnow() > (sent_at + timedelta(hours=1)):
                logger.warning(f"Password reset token expired for: {email}")
                return None

            return user

        except Exception as e:
            logger.error(f"Error verifying password reset token: {str(e)}")
            return None

    @staticmethod
    async def reset_password_with_token(
        db: AsyncSession, email: str, token: str, new_password: str
    ) -> bool:
        """Reset password using token"""
        try:
            user = await AuthService.verify_password_reset_token(db, email, token)
            if not user:
                return False

            user.encryptedpassword = AuthService.hash_password(new_password)
            user.recoverytoken = None
            user.recoverysentat = None
            user.updatedat = datetime.utcnow()

            await db.commit()
            logger.info(f"Password reset successful for user: {user.id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error resetting password: {str(e)}")
            return False

    @staticmethod
    async def get_user_with_roles(
        db: AsyncSession,
        user_id: str,
        company_reg_no: str | None = None,
    ) -> dict | None:
        """Get user with roles and profile"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user or not user.isactive:
                return None

            result = await db.execute(select(Profile).where(Profile.id == user.id))
            profile = result.scalar_one_or_none()
            if not profile:
                return None

            stmt = (
                select(Role.name)
                .join(UserRole, UserRole.role_id == Role.id)
                .where(UserRole.user_id == profile.id)
            )
            if company_reg_no:
                stmt = stmt.where(UserRole.company_reg_no == company_reg_no)

            rows = (await db.execute(stmt)).all()
            roles = [r[0] for r in rows]

            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "is_active": user.isactive,
                    "email_confirmed": user.emailconfirmed,
                },
                "profile": {
                    "id": str(profile.id),
                    "full_name": getattr(profile, "full_name", None),
                    "email": profile.email,
                    "username": getattr(profile, "username", None),
                    "telephone": getattr(profile, "telephone", None),
                    "company_id": getattr(profile, "company_id", None),
                    "company_name": getattr(profile, "company_name", None),
                    "company_reg_no": getattr(profile, "company_reg_no", None),
                    "department": getattr(profile, "department", None),
                    "user_access": getattr(profile, "user_access", None),
                    "status": getattr(profile, "status", None),
                },
                "roles": roles,
                "company_reg_no": getattr(profile, "company_reg_no", None),
            }

        except Exception as e:
            logger.error(f"Error getting user with roles: {str(e)}")
            return None


async def get_current_user(token: str, db: AsyncSession) -> dict:
    """Dependency to get current user from JWT token"""
    payload = AuthService.decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise ValueError("Invalid token payload")

    user_data = await AuthService.get_user_with_roles(db, user_id)
    if not user_data:
        raise ValueError("User not found")

    return user_data


async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db),
) -> dict:
    """FastAPI dependency to get current user from JWT token"""
    token = credentials.credentials
    payload = AuthService.decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    user_data = await AuthService.get_user_with_roles(db, user_id)
    if not user_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user_data


def require_roles(*required_roles: str):
    async def role_checker(current_user: dict = Depends(get_current_user_dependency)):
        user_roles = current_user.get("roles", [])
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}",
            )
        return current_user

    return role_checker


def require_access_level(min_level: int):
    async def access_checker(current_user: dict = Depends(get_current_user_dependency)):
        user_access = current_user.get("profile", {}).get("user_access", 0) or 0
        if int(user_access) < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient access level"
            )
        return current_user

    return access_checker
