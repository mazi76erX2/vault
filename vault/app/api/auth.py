"""
Authentication API Routes and Service
Handles user authentication, registration, and JWT token management.

This version:
- Uses canonical ORM models from app.models (the ones Alembic sees).
- Uses the shared AsyncSession dependency from app.core.database (get_async_db).
- Keeps refresh tokens stateless (JWT-only) to avoid requiring a refresh_tokens table.
"""

from __future__ import annotations

import logging
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Any

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

# Shared DB dependency
from app.core.database import get_async_db
from app.features.email.email_service import send_password_reset_email
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.auth import (
    LoginResponse,
    PasswordChange,
    PasswordReset,
    PasswordResetRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(tags=["Authentication"])


class AuthService:
    # -------------------------------------------------------------------------
    # Password utilities (using bcrypt directly to avoid passlib compatibility issues)
    # -------------------------------------------------------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt, truncating to 72 bytes as required."""
        password_bytes = password.encode("utf-8")[:72]
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash, truncating to 72 bytes as required."""
        try:
            password_bytes = plain_password.encode("utf-8")[:72]
            hashed_bytes = hashed_password.encode("utf-8")
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception as e:
            logger.warning(f"Password verification error: {e}")
            return False

    # -------------------------------------------------------------------------
    # JWT helpers
    # -------------------------------------------------------------------------
    @staticmethod
    def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
        to_encode = dict(data)
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow(), "type": "refresh"}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict[str, Any]:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired") from None
        except jwt.PyJWTError as e:
            raise ValueError(f"Invalid token: {str(e)}") from e

    # -------------------------------------------------------------------------
    # User + profile creation
    # -------------------------------------------------------------------------
    @staticmethod
    async def create_user(
        db: AsyncSession,
        user_data: UserCreate,
        company_reg_no: str | None = None,
    ) -> Profile:
        # Check if email exists
        existing = await db.execute(select(User).where(User.email == user_data.email))
        if existing.scalar_one_or_none():
            raise ValueError(f"Email '{user_data.email}' is already registered")

        # Check if username exists
        if user_data.username:
            existing_u = await db.execute(
                select(Profile).where(Profile.username == user_data.username)
            )
            if existing_u.scalar_one_or_none():
                raise ValueError(f"Username '{user_data.username}' is already taken")

        now = datetime.utcnow()
        user_id = uuid.uuid4()

        # Build full name
        full_name = user_data.full_name
        first_name = getattr(user_data, "first_name", None) or getattr(user_data, "firstname", None)
        last_name = getattr(user_data, "last_name", None) or getattr(user_data, "lastname", None)
        if not full_name and (first_name or last_name):
            full_name = f"{first_name or ''} {last_name or ''}".strip() or None

        # Get email_confirmed attribute (handle both snake_case and camelCase)
        email_confirmed = getattr(user_data, "email_confirmed", None)
        if email_confirmed is None:
            email_confirmed = getattr(user_data, "emailconfirmed", False)

        # Create auth user (auth.users)
        new_user = User(
            id=user_id,
            email=user_data.email,
            encryptedpassword=AuthService.hash_password(user_data.password),
            emailconfirmedat=now if email_confirmed else None,
            confirmedat=now if email_confirmed else None,
            createdat=now,
            updatedat=now,
            rawappmetadata={},
            rawusermetadata={"full_name": full_name} if full_name else {},
        )
        db.add(new_user)

        # Get profile fields (handle both snake_case and camelCase)
        telephone = getattr(user_data, "telephone", None)
        company_id = getattr(user_data, "company_id", None) or getattr(user_data, "companyid", None)
        company_name = getattr(user_data, "company_name", None) or getattr(
            user_data, "companyname", None
        )
        user_company_reg_no = getattr(user_data, "company_reg_no", None) or getattr(
            user_data, "companyregno", None
        )
        department = getattr(user_data, "department", None)
        field_of_expertise = getattr(user_data, "field_of_expertise", None) or getattr(
            user_data, "fieldofexpertise", None
        )
        years_of_experience = getattr(user_data, "years_of_experience", None) or getattr(
            user_data, "yearsofexperience", None
        )
        user_access = getattr(user_data, "user_access", None) or getattr(
            user_data, "useraccess", None
        )

        # Create profile
        new_profile = Profile(
            id=user_id,
            user_id=user_id,
            email=user_data.email,
            full_name=full_name,
            username=user_data.username,
            telephone=telephone,
            company_id=company_id,
            company_name=company_name,
            company_reg_no=company_reg_no or user_company_reg_no,
            department=department,
            field_of_expertise=field_of_expertise,
            years_of_experience=years_of_experience,
            user_access=_coerce_user_access(user_access),
            status="active",
            created_at=now,
            updated_at=now,
        )
        db.add(new_profile)

        await db.commit()
        await db.refresh(new_profile)
        return new_profile

    # -------------------------------------------------------------------------
    # Authentication
    # -------------------------------------------------------------------------
    @staticmethod
    async def authenticate_user(
        db: AsyncSession, email: str, password: str
    ) -> tuple[User, Profile] | None:
        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                logger.warning(f"Authentication failed: User not found - {email}")
                return None

            # Deleted / banned checks
            if getattr(user, "deletedat", None) is not None:
                logger.warning(f"Authentication failed: User deleted - {email}")
                return None

            banned_until = getattr(user, "banneduntil", None)
            if banned_until and banned_until > datetime.utcnow():
                logger.warning(f"Authentication failed: User banned - {email}")
                return None

            hashed = getattr(user, "encryptedpassword", None)
            if not hashed:
                logger.warning(f"Authentication failed: No password set - {email}")
                return None

            if not AuthService.verify_password(password, hashed):
                logger.warning(f"Authentication failed: Invalid password - {email}")
                return None

            # Get profile: try user_id link first, then id fallback
            prof_q = select(Profile).where(
                or_(
                    Profile.user_id == user.id,
                    Profile.id == user.id,
                )
            )
            prof_res = await db.execute(prof_q)
            profile = prof_res.scalar_one_or_none()
            if not profile:
                logger.error(f"Profile not found for user: {user.id}")
                return None

            if getattr(profile, "status", None) == "inactive":
                logger.warning(f"Authentication failed: Profile inactive - {email}")
                return None

            logger.info(f"User authenticated successfully: {email}")
            return user, profile

        except Exception:
            logger.exception("Error authenticating user")
            return None

    # -------------------------------------------------------------------------
    # Roles
    # -------------------------------------------------------------------------
    @staticmethod
    async def get_user_roles(
        db: AsyncSession,
        profile_id: str,
        company_reg_no: str | None = None,
    ) -> list[str]:
        try:
            q = (
                select(Role.name)
                .join(UserRole, UserRole.role_id == Role.id)
                .where(UserRole.user_id == profile_id)
            )
            if company_reg_no:
                q = q.where(UserRole.company_reg_no == company_reg_no)

            rows = (await db.execute(q)).all()
            return [r[0] for r in rows]
        except Exception:
            logger.exception("Error getting user roles")
            return []

    @staticmethod
    async def assign_role(
        db: AsyncSession,
        profile_id: str,
        role_name: str,
        company_reg_no: str,
    ) -> bool:
        try:
            role_res = await db.execute(select(Role).where(Role.name == role_name))
            role = role_res.scalar_one_or_none()
            if not role:
                return False

            existing = await db.execute(
                select(UserRole).where(
                    (UserRole.user_id == profile_id)
                    & (UserRole.role_id == role.id)
                    & (UserRole.company_reg_no == company_reg_no)
                )
            )
            if existing.scalar_one_or_none():
                return True

            db.add(UserRole(user_id=profile_id, role_id=role.id, company_reg_no=company_reg_no))
            await db.commit()
            return True
        except Exception:
            await db.rollback()
            logger.exception("Error assigning role")
            return False

    # -------------------------------------------------------------------------
    # Password reset
    # -------------------------------------------------------------------------
    @staticmethod
    async def create_password_reset_token(db: AsyncSession, email: str) -> str | None:
        try:
            res = await db.execute(select(User).where(User.email == email))
            user = res.scalar_one_or_none()
            if not user:
                return None

            reset_token = secrets.token_urlsafe(32)
            user.recoverytoken = reset_token
            user.recoverysentat = datetime.utcnow()
            await db.commit()
            return reset_token
        except Exception:
            await db.rollback()
            logger.exception("Error creating password reset token")
            return None

    @staticmethod
    async def verify_password_reset_token(
        db: AsyncSession,
        email: str,
        token: str,
        expiry_hours: int = 1,
    ) -> User | None:
        try:
            res = await db.execute(select(User).where(User.email == email))
            user = res.scalar_one_or_none()
            if not user or not getattr(user, "recoverytoken", None):
                return None

            if user.recoverytoken != token:
                return None

            sent_at = getattr(user, "recoverysentat", None)
            if sent_at:
                if datetime.utcnow() > sent_at + timedelta(hours=expiry_hours):
                    return None

            return user
        except Exception:
            logger.exception("Error verifying password reset token")
            return None

    @staticmethod
    async def reset_password_with_token(
        db: AsyncSession,
        email: str,
        token: str,
        new_password: str,
    ) -> bool:
        try:
            user = await AuthService.verify_password_reset_token(db, email, token)
            if not user:
                return False

            user.encryptedpassword = AuthService.hash_password(new_password)
            user.recoverytoken = None
            user.recoverysentat = None
            user.updatedat = datetime.utcnow()
            await db.commit()
            return True
        except Exception:
            await db.rollback()
            logger.exception("Error resetting password")
            return False

    @staticmethod
    async def update_password(db: AsyncSession, user_id: str, new_password: str) -> bool:
        try:
            res = await db.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            if not user:
                return False

            user.encryptedpassword = AuthService.hash_password(new_password)
            user.updatedat = datetime.utcnow()
            await db.commit()
            return True
        except Exception:
            await db.rollback()
            logger.exception("Error updating password")
            return False

    # -------------------------------------------------------------------------
    # User aggregation for token contexts
    # -------------------------------------------------------------------------
    @staticmethod
    async def get_user_with_roles(
        db: AsyncSession,
        auth_user_id: str,
        company_reg_no: str | None = None,
    ) -> dict[str, Any] | None:
        try:
            res = await db.execute(select(User).where(User.id == auth_user_id))
            user = res.scalar_one_or_none()
            if not user:
                return None

            if getattr(user, "deletedat", None) is not None:
                return None

            banned_until = getattr(user, "banneduntil", None)
            if banned_until and banned_until > datetime.utcnow():
                return None

            prof_res = await db.execute(
                select(Profile).where(or_(Profile.user_id == user.id, Profile.id == user.id))
            )
            profile = prof_res.scalar_one_or_none()
            if not profile:
                return None

            effective_company_reg_no = company_reg_no or getattr(profile, "company_reg_no", None)
            roles = await AuthService.get_user_roles(db, str(profile.id), effective_company_reg_no)

            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "email_confirmed": bool(
                        getattr(user, "emailconfirmedat", None)
                        or getattr(user, "confirmedat", None)
                    ),
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
        except Exception:
            logger.exception("Error getting user with roles")
            return None


def _coerce_user_access(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        access_map = {"admin": 3, "manager": 2, "employee": 1, "viewer": 0, "guest": 0}
        return access_map.get(value.lower(), 1)
    return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = AuthService.decode_token(token)
        if payload.get("type") != "access":
            raise credentials_exception

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        user_data = await AuthService.get_user_with_roles(db, user_id)
        if not user_data:
            raise credentials_exception

        return user_data
    except ValueError:
        raise credentials_exception from None
    except Exception:
        raise credentials_exception from None


def require_roles(*required_roles: str):
    async def role_checker(current_user: dict[str, Any] = Depends(get_current_user)):
        roles = current_user.get("roles", [])
        if not any(r in roles for r in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker


def require_access_level(min_level: int):
    async def access_checker(current_user: dict[str, Any] = Depends(get_current_user)):
        user_access = current_user.get("profile", {}).get("user_access", 0) or 0
        if int(user_access) < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient access level",
            )
        return current_user

    return access_checker


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_async_db)):
    try:
        profile = await AuthService.create_user(db, user_data)

        roles = await AuthService.get_user_roles(
            db, str(profile.id), getattr(profile, "company_reg_no", None)
        )

        return UserResponse(
            id=str(profile.id),
            email=profile.email,
            full_name=getattr(profile, "full_name", None),
            username=getattr(profile, "username", None),
            company_reg_no=getattr(profile, "company_reg_no", None),
            roles=roles,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        logger.exception("Error registering user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account",
        ) from e


@router.post("/login", response_model=LoginResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_async_db)):
    try:
        result = await AuthService.authenticate_user(db, credentials.email, credentials.password)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user, profile = result

        user.lastsigninat = datetime.utcnow()
        await db.commit()

        access_token = AuthService.create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "company_reg_no": getattr(profile, "company_reg_no", None),
            }
        )
        refresh_token = AuthService.create_refresh_token(str(user.id))

        current_user = await AuthService.get_user_with_roles(db, str(user.id))

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=current_user,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during login")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during authentication",
        ) from e


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str, db: AsyncSession = Depends(get_async_db)):
    try:
        payload = AuthService.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )

        user_data = await AuthService.get_user_with_roles(db, user_id)
        if not user_data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        new_access = AuthService.create_access_token(
            data={
                "sub": user_id,
                "email": user_data["user"]["email"],
                "company_reg_no": user_data.get("company_reg_no"),
            }
        )
        new_refresh = AuthService.create_refresh_token(user_id)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    except Exception as e:
        logger.exception("Error refreshing token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refreshing token",
        ) from e


@router.post("/password-reset-request")
async def request_password_reset(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_async_db),
):
    # Always return success to prevent email enumeration
    token = await AuthService.create_password_reset_token(db, request.email)
    if token:
        try:
            await send_password_reset_email(request.email, token)
        except Exception:
            logger.exception("Failed to send password reset email")

    return {
        "status": "success",
        "message": "If the email exists, a password reset link has been sent",
    }


@router.post("/password-reset")
async def reset_password(reset_data: PasswordReset, db: AsyncSession = Depends(get_async_db)):
    ok = await AuthService.reset_password_with_token(
        db, reset_data.email, reset_data.token, reset_data.password
    )
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    return {"status": "success", "message": "Password has been reset successfully"}


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    user_id = current_user["user"]["id"]
    email = current_user["user"]["email"]

    # Get old_password (handle both snake_case and camelCase)
    old_password = getattr(password_data, "old_password", None) or getattr(
        password_data, "oldpassword", None
    )
    new_password = getattr(password_data, "new_password", None) or getattr(
        password_data, "newpassword", None
    )

    # Verify old password
    result = await AuthService.authenticate_user(db, email, old_password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password"
        )

    ok = await AuthService.update_password(db, user_id, new_password)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating password"
        )

    return {"status": "success", "message": "Password changed successfully"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict[str, Any] = Depends(get_current_user)):
    return UserResponse(
        id=current_user["profile"]["id"],
        email=current_user["user"]["email"],
        full_name=current_user["profile"]["full_name"],
        username=current_user["profile"]["username"],
        company_reg_no=current_user.get("company_reg_no"),
        roles=current_user.get("roles", []),
    )


@router.post("/logout")
async def logout():
    # Stateless tokens: nothing server-side to revoke.
    return {"status": "success", "message": "Logged out successfully"}


@router.post("/logout-all")
async def logout_all_devices():
    # Stateless tokens: nothing server-side to revoke.
    return {"status": "success", "message": "Logged out from all devices"}


@router.get("/verify")
async def verify(current_user: dict[str, Any] = Depends(get_current_user)):
    return {
        "status": "valid",
        "user_id": current_user["profile"]["id"],
        "email": current_user["user"]["email"],
        "company_reg_no": current_user.get("company_reg_no"),
        "roles": current_user.get("roles", []),
    }
