"""
Tenant Service
Multi-tenancy operations for profiles and company isolation
"""

import logging
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile

logger = logging.getLogger(__name__)


class TenantService:
    """Service for managing tenant-scoped operations."""

    @staticmethod
    async def get_tenant_profiles(db: AsyncSession, company_regno: str) -> list[dict[str, Any]]:
        """
        Get all profiles for a specific tenant (company).

        Args:
            db: Database session
            company_regno: Company registration number

        Returns:
            List of profile dictionaries
        """
        try:
            stmt = select(Profile).where(Profile.company_regno == company_regno)
            result = await db.execute(stmt)
            profiles = result.scalars().all()

            # Convert to dictionaries
            return [
                {
                    "id": str(profile.id),
                    "email": profile.email,
                    "full_name": profile.full_name,
                    "username": profile.username,
                    "telephone": profile.telephone,
                    "company_name": profile.company_name,
                    "company_regno": profile.company_regno,
                    "department": profile.department,
                    "user_access": profile.user_access,
                    "status": profile.status,
                    "created_at": profile.created_at,
                }
                for profile in profiles
            ]

        except Exception as e:
            logger.error(f"Error getting tenant profiles: {str(e)}")
            raise

    @staticmethod
    async def get_tenant_profile(
        db: AsyncSession, user_id: str, company_regno: str
    ) -> dict[str, Any] | None:
        """
        Get a specific profile within a tenant.

        Args:
            db: Database session
            user_id: User ID
            company_regno: Company registration number

        Returns:
            Profile dictionary or None
        """
        try:
            stmt = select(Profile).where(
                Profile.id == user_id, Profile.company_regno == company_regno
            )
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()

            if not profile:
                return None

            return {
                "id": str(profile.id),
                "email": profile.email,
                "full_name": profile.full_name,
                "username": profile.username,
                "telephone": profile.telephone,
                "company_name": profile.company_name,
                "company_regno": profile.company_regno,
                "department": profile.department,
                "user_access": profile.user_access,
                "status": profile.status,
                "created_at": profile.created_at,
            }

        except Exception as e:
            logger.error(f"Error getting tenant profile: {str(e)}")
            raise

    @staticmethod
    async def create_tenant_profile(
        db: AsyncSession, profile_data: dict[str, Any], company_regno: str
    ) -> Profile:
        """
        Create a new profile within a tenant.

        Args:
            db: Database session
            profile_data: Profile data dictionary
            company_regno: Company registration number

        Returns:
            Created profile
        """
        try:
            # Ensure company_regno is set
            profile_data["company_regno"] = company_regno

            profile = Profile(**profile_data)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)

            logger.info(f"Created profile {profile.id} in tenant {company_regno}")
            return profile

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating tenant profile: {str(e)}")
            raise

    @staticmethod
    async def update_tenant_profile(
        db: AsyncSession,
        user_id: str,
        profile_data: dict[str, Any],
        company_regno: str,
    ) -> Profile | None:
        """
        Update a profile within a tenant.

        Args:
            db: Database session
            user_id: User ID
            profile_data: Profile data dictionary
            company_regno: Company registration number

        Returns:
            Updated profile or None
        """
        try:
            stmt = select(Profile).where(
                Profile.id == user_id, Profile.company_regno == company_regno
            )
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()

            if not profile:
                return None

            # Update fields
            for key, value in profile_data.items():
                if hasattr(profile, key) and value is not None:
                    setattr(profile, key, value)

            await db.commit()
            await db.refresh(profile)

            logger.info(f"Updated profile {user_id} in tenant {company_regno}")
            return profile

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating tenant profile: {str(e)}")
            raise

    @staticmethod
    async def delete_tenant_profile(db: AsyncSession, user_id: str, company_regno: str) -> bool:
        """
        Delete a profile within a tenant (soft delete).

        Args:
            db: Database session
            user_id: User ID
            company_regno: Company registration number

        Returns:
            True if deleted, False if not found
        """
        try:
            stmt = select(Profile).where(
                Profile.id == user_id, Profile.company_regno == company_regno
            )
            result = await db.execute(stmt)
            profile = result.scalar_one_or_none()

            if not profile:
                return False

            # Soft delete
            profile.status = "inactive"
            await db.commit()

            logger.info(f"Deleted profile {user_id} in tenant {company_regno}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting tenant profile: {str(e)}")
            raise
