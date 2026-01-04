"""
User management endpoints.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.db.enums import DepartmentEnum
from app.middleware.auth import verify_token_with_tenant
from app.models import Company, Document, Profile
from app.schemas.user import (GetUserCompanyResponse, UserCompanyRequest,
                              UserInfo, UserProfileRequest,
                              UserProfileResponse)
from app.services.tenant_service import TenantService

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/departments")
async def get_departments():
    """Get all department enum values."""
    departments = [dept.value for dept in DepartmentEnum]
    logger.info(f"departments: {departments}")
    return departments


@router.get("/info/{user_id}", response_model=UserInfo)
async def get_user_info(user_id: str, db: AsyncSession = Depends(get_async_db)):
    """Get user validation and expert status."""
    try:
        # Check if user is validator
        stmt = select(Profile.is_validator).where(Profile.id == user_id)
        result = await db.execute(stmt)
        is_validator = result.scalar_one_or_none() or False

        # Check if user is expert (has reviewed documents)
        stmt = select(Document.doc_id).where(Document.reviewer == user_id).limit(1)
        result = await db.execute(stmt)
        is_expert = result.scalar_one_or_none() is not None

        return UserInfo(user_id=user_id, is_validator=is_validator, is_expert=is_expert)
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user info: {str(e)}")


@router.post("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    request: UserProfileRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get user profile."""
    try:
        user_id = request.user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        profile_data = await TenantService.get_tenant_profile(db, user_id, company_reg_no)

        if not profile_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        safe_profile_data = {
            "id": profile_data.get("id"),
            "full_name": profile_data.get("full_name"),
            "email": profile_data.get("email"),
            "telephone": profile_data.get("telephone"),
            "company_name": profile_data.get("company_name"),
        }

        return UserProfileResponse(profile=safe_profile_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}") from e


@router.post("/company", response_model=GetUserCompanyResponse)
async def get_user_company(
    request: UserCompanyRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get company details for a user."""
    user_id = request.user_id
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        profile = await TenantService.get_tenant_profile(db, user_id, company_reg_no)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User has no associated company or access denied",
            )

        company_id = profile.get("company_id")
        if not company_id:
            raise HTTPException(status_code=404, detail="User has no associated company")

        stmt = select(Company).where(
            Company.id == company_id, Company.company_reg_no == company_reg_no
        )
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        name = profile.get("company_name") or company.name

        if not profile.get("company_name"):
            try:
                await TenantService.update_tenant_profile(
                    db,
                    user_id,
                    {"company_name": name, "updated_at": datetime.utcnow()},
                    company_reg_no,
                )
                logger.info(f"Updated profile for user {user_id} with company name {name}")
            except Exception as err:
                logger.warning(f"Failed to update profile for user {user_id}: {err}")

        return GetUserCompanyResponse(
            company={
                "id": str(company.id),
                "name": name,
                "registered_since": (
                    company.registered_since.isoformat() if company.registered_since else ""
                ),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user company: {e}")
        raise HTTPException(status_code=500, detail="Error fetching user company") from e


@router.get("/departments")
async def get_departments():
    """Get all department enum values."""
    departments = [dept.value for dept in DepartmentEnum]
    logger.info(f"departments: {departments}")
    return departments


@router.get("/info/{user_id}", response_model=UserInfo)
async def get_user_info(user_id: str, db: AsyncSession = Depends(get_async_db)):
    """Get user validation and expert status."""
    try:
        # Check if user is validator
        stmt = select(Profile.is_validator).where(Profile.id == user_id)
        result = await db.execute(stmt)
        is_validator = result.scalar_one_or_none() or False

        # Check if user is expert (has reviewed documents)
        stmt = select(Document.doc_id).where(Document.reviewer == user_id).limit(1)
        result = await db.execute(stmt)
        is_expert = result.scalar_one_or_none() is not None

        return UserInfo(user_id=user_id, is_validator=is_validator, is_expert=is_expert)
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching user info: {str(e)}")


@router.post("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    request: UserProfileRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get user profile."""
    try:
        user_id = request.user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        profile_data = await TenantService.get_tenant_profile(db, user_id, company_reg_no)

        if not profile_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        safe_profile_data = {
            "id": profile_data.get("id"),
            "full_name": profile_data.get("full_name"),
            "email": profile_data.get("email"),
            "telephone": profile_data.get("telephone"),
            "company_name": profile_data.get("company_name"),
        }

        return UserProfileResponse(profile=safe_profile_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user profile: {str(e)}") from e


@router.post("/company", response_model=GetUserCompanyResponse)
async def get_user_company(
    request: UserCompanyRequest,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
):
    """Get company details for a user."""
    user_id = request.user_id
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        company_reg_no = current_user.get("company_reg_no")
        if not company_reg_no:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User company association not found",
            )

        profile = await TenantService.get_tenant_profile(db, user_id, company_reg_no)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User has no associated company or access denied",
            )

        company_id = profile.get("company_id")
        if not company_id:
            raise HTTPException(status_code=404, detail="User has no associated company")

        stmt = select(Company).where(
            Company.id == company_id, Company.company_reg_no == company_reg_no
        )
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        name = profile.get("company_name") or company.name

        if not profile.get("company_name"):
            try:
                await TenantService.update_tenant_profile(
                    db,
                    user_id,
                    {"company_name": name, "updated_at": datetime.utcnow()},
                    company_reg_no,
                )
                logger.info(f"Updated profile for user {user_id} with company name {name}")
            except Exception as err:
                logger.warning(f"Failed to update profile for user {user_id}: {err}")

        return GetUserCompanyResponse(
            company={
                "id": str(company.id),
                "name": name,
                "registered_since": (
                    company.registered_since.isoformat() if company.registered_since else ""
                ),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user company: {e}")
        raise HTTPException(status_code=500, detail="Error fetching user company") from e
