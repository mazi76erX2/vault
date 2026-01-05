"""
Company and theme settings endpoints.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_db
from app.middleware.auth import verify_token
from app.models import Company, Profile, Role, UserRole
from app.schemas.company import (CompanyContactDetails,
                                 GetCompanyContactDetailsRequest,
                                 GetCompanyThemeSettingsRequest,
                                 UpdateCompanyContactDetailsRequest,
                                 UpdateCompanyThemeSettingsRequest)
from app.services.storage import StorageService

router = APIRouter()
logger = logging.getLogger(__name__)


def ensure_color_has_hash(color_value: str) -> str:
    """Ensure color value has # prefix."""
    if not color_value:
        return color_value
    if color_value.startswith("#"):
        return color_value
    if len(color_value) in [3, 6] and all(c in "0123456789ABCDEFabcdef" for c in color_value):
        return f"#{color_value}"
    return color_value


@router.post("/theme/get")
async def get_company_theme_settings(
    request: GetCompanyThemeSettingsRequest, db: AsyncSession = Depends(get_async_db)
):
    """Get company theme settings."""
    try:
        user_id = request.user_id
        logger.info(f"Fetching theme settings for user ID: {user_id}")

        default_settings = {
            "status": "success",
            "theme_settings": {
                "id": "default",
                "name": "Default Company",
                "userChatBubbleColor": "#007bff",
                "botChatBubbleColor": "#e5e5ea",
                "sendButtonAndBox": "#ffffff",
                "font": "Tahoma",
                "userChatFontColor": "#000000",
                "botChatFontColor": "#000000",
                "logo": None,
                "botProfilePicture": None,
            },
        }

        # Get company_id from profile
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            logger.warning(f"No company found for user {user_id}")
            return default_settings

        # Get company data
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            logger.warning(f"No company found for ID {company_id}")
            return default_settings

        # Transform to response format
        transformed_data = {
            "id": str(company.id),
            "name": company.name,
            "userChatBubbleColor": ensure_color_has_hash(
                company.user_chat_bubble_colour or "#007bff"
            ),
            "botChatBubbleColor": ensure_color_has_hash(
                company.bot_chat_bubble_colour or "#e5e5ea"
            ),
            "sendButtonAndBox": ensure_color_has_hash(company.send_button_and_box or "#ffffff"),
            "font": company.font or "Tahoma",
            "userChatFontColor": ensure_color_has_hash(company.user_chat_font_colour or "#000000"),
            "botChatFontColor": ensure_color_has_hash(company.bot_chat_font_colour or "#000000"),
            "logo": company.logo,  # Already Cloudinary URL
            "botProfilePicture": company.bot_profile_picture,  # Already Cloudinary URL
        }

        return {"status": "success", "theme_settings": transformed_data}

    except Exception as e:
        logger.error(f"Error in get_company_theme_settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/theme/update")
async def update_company_theme_settings(
    request_data: UpdateCompanyThemeSettingsRequest, db: AsyncSession = Depends(get_async_db)
):
    """Update company theme settings with Cloudinary support."""
    try:
        user_id = request_data.user_id
        theme_settings = request_data.theme_settings

        logger.info(f"Updating theme settings for user ID: {user_id}")

        if not user_id or not theme_settings:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: user_id or theme_settings",
            )

        # Get company_id from profile
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            raise HTTPException(
                status_code=404, detail="User profile or company association not found"
            )

        # Get company
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        company_name = company.name
        if not company_name:
            raise HTTPException(status_code=500, detail="Company name not found")

        # Update text-based settings
        text_settings_map = {
            "user_chat_bubble_colour": theme_settings.user_chat_bubble_colour,
            "bot_chat_bubble_colour": theme_settings.bot_chat_bubble_colour,
            "send_button_and_box": theme_settings.send_button_and_box,
            "font": theme_settings.font,
            "user_chat_font_colour": theme_settings.user_chat_font_colour,
            "bot_chat_font_colour": theme_settings.bot_chat_font_colour,
        }

        for key, value in text_settings_map.items():
            if key in theme_settings.model_fields_set:
                setattr(company, key, value)

        # Handle Logo - CLOUDINARY
        if "logo" in theme_settings.model_fields_set:
            logo_data = theme_settings.logo
            if logo_data and logo_data.startswith("data:image"):
                try:
                    logo_url = StorageService.upload_logo(logo_data, company_name)
                    company.logo = logo_url
                    logger.info(f"Logo uploaded successfully for company {company_name}")
                except Exception as upload_error:
                    logger.error(f"Error uploading logo: {upload_error}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error uploading logo: {str(upload_error)}",
                    ) from upload_error
            elif logo_data is None:
                company.logo = None

        # Handle Bot Profile Picture - CLOUDINARY
        if "bot_profile_picture" in theme_settings.model_fields_set:
            bot_pic_data = theme_settings.bot_profile_picture
            if bot_pic_data and bot_pic_data.startswith("data:image"):
                try:
                    bot_profile_url = StorageService.upload_bot_profile(bot_pic_data, company_name)
                    company.bot_profile_picture = bot_profile_url
                    logger.info(f"Bot profile uploaded successfully for company {company_name}")
                except Exception as upload_error:
                    logger.error(f"Error uploading bot profile: {upload_error}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error uploading bot profile: {str(upload_error)}",
                    ) from upload_error
            elif bot_pic_data is None:
                company.bot_profile_picture = None

        await db.commit()
        await db.refresh(company)
        logger.info(f"Theme settings updated successfully for company {company_name}")

        return {
            "status": "success",
            "message": "Company theme settings updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating company theme settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/contact/get", response_model=CompanyContactDetails)
async def get_company_contact_details(
    request: GetCompanyContactDetailsRequest,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_async_db),
):
    """Get company contact details."""
    try:
        user_id = request.user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        # Get company_id from profile
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            raise HTTPException(status_code=404, detail="User has no associated company")

        # Get company
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        return CompanyContactDetails(
            firstName=company.contact_first_name or "",
            lastName=company.contact_last_name or "",
            email=company.contact_email or "",
            telephone=company.contact_telephone or "",
            company=company.name or "",
            registeredSince=(
                company.registered_since.isoformat() if company.registered_since else ""
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching company contact details: {e}")
        raise HTTPException(status_code=500, detail="Error fetching company contact details") from e


@router.post("/contact/update", response_model=CompanyContactDetails)
async def update_company_contact_details(
    request: UpdateCompanyContactDetailsRequest,
    current_user: dict = Depends(verify_token),
    db: AsyncSession = Depends(get_async_db),
):
    """Update company contact details (Administrator only)."""
    try:
        # Admin check
        current_user_id = current_user.get("user_id")
        stmt = (
            select(UserRole.role_id)
            .join(Role)
            .where(UserRole.user_id == current_user_id, Role.name == "Administrator")
        )
        result = await db.execute(stmt)
        is_admin = result.scalar_one_or_none() is not None

        if not is_admin:
            logger.warning(
                f"User {current_user_id} attempted to update company contact details "
                f"without Administrator role."
            )
            raise HTTPException(
                status_code=403,
                detail="User does not have permission to perform this action. Administrator role required.",
            )

        user_id = request.user_id
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")

        # Get company_id from profile
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        company_id = result.scalar_one_or_none()

        if not company_id:
            raise HTTPException(status_code=404, detail="User has no associated company")

        # Get company
        stmt = select(Company).where(Company.id == company_id)
        result = await db.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Update contact details
        company.contact_first_name = request.firstName
        company.contact_last_name = request.lastName
        company.contact_email = request.email
        company.contact_telephone = request.telephone

        await db.commit()
        await db.refresh(company)

        logger.info(f"Company contact details updated for company ID: {company_id}")

        return CompanyContactDetails(
            firstName=company.contact_first_name or "",
            lastName=company.contact_last_name or "",
            email=company.contact_email or "",
            telephone=company.contact_telephone or "",
            company=company.name or "",
            registeredSince=(
                company.registered_since.isoformat() if company.registered_since else ""
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating company contact details: {e}")
        raise HTTPException(status_code=500, detail="Error updating company contact details") from e
