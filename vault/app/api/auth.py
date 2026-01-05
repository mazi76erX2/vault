"""
Authentication API Routes and Service
Handles user authentication, registration, and JWT token management.

This version:
- Uses canonical ORM models from app.models (the ones Alembic sees).
- Uses the shared AsyncSession dependency from app.database (getasyncdb).
- Keeps refresh tokens stateless (JWT-only) to avoid requiring a refresh_tokens table.
"""

from __future__ import annotations

import logging
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Any

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.email_service import send_password_reset_email
from app.models.profile import Profile
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.auth import (PasswordChange, PasswordReset,
                              PasswordResetRequest, TokenResponse, UserCreate,
                              UserLogin, UserResponse)

# Shared DB dependency (matches usage elsewhere in your repo)
try:
    from app.database import getasyncdb as get_async_db  # type: ignore
except Exception:
    from app.database import get_async_db  # type: ignore


logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(tags=["Authentication"])


class AuthService:
    # -------------------------------------------------------------------------
    # Password utilities
    # -------------------------------------------------------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    # -------------------------------------------------------------------------
    # JWT helpers
    # -------------------------------------------------------------------------
    @staticmethod
    def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
        to_encode = dict(data)
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESSTOKENEXPIREMINUTES)
        )
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
        return jwt.encode(to_encode, settings.SECRETKEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESHTOKENEXPIREDAYS)
        to_encode = {"sub": user_id, "exp": expire, "iat": datetime.utcnow(), "type": "refresh"}
        return jwt.encode(to_encode, settings.SECRETKEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict[str, Any]:
        try:
            return jwt.decode(token, settings.SECRETKEY, algorithms=[settings.ALGORITHM])
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
        companyregno: str | None = None,
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
        if not full_name and (user_data.firstname or user_data.lastname):
            full_name = f"{user_data.firstname or ''} {user_data.lastname or ''}".strip() or None

        # Create auth user (auth.users)
        new_user = User(
            id=user_id,
            email=user_data.email,
            encryptedpassword=AuthService.hash_password(user_data.password),
            emailconfirmedat=now if user_data.emailconfirmed else None,
            confirmedat=now if user_data.emailconfirmed else None,
            createdat=now,
            updatedat=now,
            rawappmetadata={},
            rawusermetadata={"full_name": full_name} if full_name else {},
        )
        db.add(new_user)

        # IMPORTANT:
        # Your codebase historically assumed profile.id == auth user id in places.
        # To avoid surprises, set profile.id = user_id AND profile.userid = user_id.
        new_profile = Profile(
            id=user_id,
            userid=user_id,
            email=user_data.email,
            full_name=full_name,
            username=user_data.username,
            telephone=user_data.telephone,
            companyid=user_data.companyid,
            companyname=user_data.companyname,
            companyregno=companyregno or user_data.companyregno,
            department=user_data.department,
            fieldofexpertise=(
                user_data.fieldofexpertise if hasattr(user_data, "fieldofexpertise") else None
            ),
            yearsofexperience=(
                user_data.yearsofexperience if hasattr(user_data, "yearsofexperience") else None
            ),
            useraccess=_coerce_useraccess(user_data.useraccess),
            status="active",
            createdat=now,
            updatedat=now,
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
                return None

            # Deleted / banned checks (canonical model uses deletedat / banneduntil)
            if getattr(user, "deletedat", None) is not None:
                return None

            banned_until = getattr(user, "banneduntil", None)
            if banned_until and banned_until > datetime.utcnow():
                return None

            hashed = getattr(user, "encryptedpassword", None)
            if not hashed:
                return None

            if not AuthService.verify_password(password, hashed):
                return None

            # Get profile: try userid link first, then id fallback (for safety)
            prof_q = select(Profile).where(
                or_(
                    Profile.userid == user.id,
                    Profile.id == user.id,
                )
            )
            prof_res = await db.execute(prof_q)
            profile = prof_res.scalar_one_or_none()
            if not profile:
                return None

            if getattr(profile, "status", None) == "inactive":
                return None

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
        companyregno: str | None = None,
    ) -> list[str]:
        try:
            q = (
                select(Role.name)
                .join(UserRole, UserRole.roleid == Role.id)
                .where(UserRole.userid == profile_id)
            )
            if companyregno:
                q = q.where(UserRole.companyregno == companyregno)

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
        companyregno: str,
    ) -> bool:
        try:
            role_res = await db.execute(select(Role).where(Role.name == role_name))
            role = role_res.scalar_one_or_none()
            if not role:
                return False

            existing = await db.execute(
                select(UserRole).where(
                    (UserRole.userid == profile_id)
                    & (UserRole.roleid == role.id)
                    & (UserRole.companyregno == companyregno)
                )
            )
            if existing.scalar_one_or_none():
                return True

            db.add(UserRole(userid=profile_id, roleid=role.id, companyregno=companyregno))
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
        companyregno: str | None = None,
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
                select(Profile).where(or_(Profile.userid == user.id, Profile.id == user.id))
            )
            profile = prof_res.scalar_one_or_none()
            if not profile:
                return None

            effective_companyregno = companyregno or getattr(profile, "companyregno", None)
            roles = await AuthService.get_user_roles(db, str(profile.id), effective_companyregno)

            return {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "emailconfirmed": bool(
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
                    "companyid": getattr(profile, "companyid", None),
                    "companyname": getattr(profile, "companyname", None),
                    "companyregno": getattr(profile, "companyregno", None),
                    "department": getattr(profile, "department", None),
                    "useraccess": getattr(profile, "useraccess", None),
                    "status": getattr(profile, "status", None),
                },
                "roles": roles,
                "companyregno": getattr(profile, "companyregno", None),
            }
        except Exception:
            logger.exception("Error getting user with roles")
            return None


def _coerce_useraccess(value: Any) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        # Keep backward compatibility with earlier mapping you used
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
        useraccess = current_user.get("profile", {}).get("useraccess", 0) or 0
        if int(useraccess) < min_level:
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
            db, str(profile.id), getattr(profile, "companyregno", None)
        )

        return UserResponse(
            id=str(profile.id),
            email=profile.email,
            full_name=getattr(profile, "full_name", None),
            username=getattr(profile, "username", None),
            companyregno=getattr(profile, "companyregno", None),
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


@router.post("/login", response_model=TokenResponse)
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

        # Update last login
        user.lastsigninat = datetime.utcnow()
        await db.commit()

        access_token = AuthService.create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "companyregno": getattr(profile, "companyregno", None),
            }
        )
        refresh_token = AuthService.create_refresh_token(str(user.id))

        return TokenResponse(
            accesstoken=access_token,
            refreshtoken=refresh_token,
            tokentype="bearer",
            expiresin=settings.ACCESSTOKENEXPIREMINUTES * 60,
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
async def refresh_token_endpoint(refreshtoken: str, db: AsyncSession = Depends(get_async_db)):
    try:
        payload = AuthService.decode_token(refreshtoken)
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
                "companyregno": user_data.get("companyregno"),
            }
        )
        new_refresh = AuthService.create_refresh_token(user_id)

        return TokenResponse(
            accesstoken=new_access,
            refreshtoken=new_refresh,
            tokentype="bearer",
            expiresin=settings.ACCESSTOKENEXPIREMINUTES * 60,
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

    # Verify old password
    result = await AuthService.authenticate_user(db, email, password_data.oldpassword)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password"
        )

    ok = await AuthService.update_password(db, user_id, password_data.newpassword)
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
        companyregno=current_user.get("companyregno"),
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
        "userid": current_user["profile"]["id"],
        "email": current_user["user"]["email"],
        "companyregno": current_user.get("companyregno"),
        "roles": current_user.get("roles", []),
    }
