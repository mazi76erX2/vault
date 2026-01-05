"""
Storage service using Cloudinary
Replaces Supabase Storage for company logos and bot profile pictures
"""

import base64
import logging

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


class StorageService:
    """Service for handling file uploads to Cloudinary"""

    @staticmethod
    def upload_logo(logo_data: str, company_name: str) -> str:
        """
        Upload company logo to Cloudinary from base64 data

        Args:
            logo_data: Base64 encoded image (data:image/png;base64,...)
            company_name: Company name for folder organization

        Returns:
            Public URL of uploaded logo
        """
        try:
            # Parse base64 data
            if not logo_data.startswith("data:image"):
                raise ValueError("Invalid image data format")

            _, logo_base64 = logo_data.split(";base64,")
            logo_binary = base64.b64decode(logo_base64)

            # Clean company name for folder
            company_folder = company_name.lower().replace(" ", "-")

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                logo_binary,
                folder=f"vault/companies/{company_folder}",
                public_id="logo",
                overwrite=True,
                resource_type="image",
                format="png",
                transformation=[
                    {"width": 500, "height": 500, "crop": "limit"},
                    {"quality": "auto"},
                ],
            )

            logger.info(f"Logo uploaded for company {company_name}: {result['secure_url']}")
            return result["secure_url"]

        except Exception as e:
            logger.error(f"Error uploading logo for {company_name}: {e}")
            raise HTTPException(status_code=500, detail=f"Error uploading logo: {str(e)}") from e

    @staticmethod
    def upload_bot_profile(bot_pic_data: str, company_name: str) -> str:
        """
        Upload bot profile picture to Cloudinary from base64 data

        Args:
            bot_pic_data: Base64 encoded image
            company_name: Company name for folder organization

        Returns:
            Public URL of uploaded bot profile picture
        """
        try:
            if not bot_pic_data.startswith("data:image"):
                raise ValueError("Invalid image data format")

            _, bot_pic_base64 = bot_pic_data.split(";base64,")
            bot_pic_binary = base64.b64decode(bot_pic_base64)

            company_folder = company_name.lower().replace(" ", "-")

            result = cloudinary.uploader.upload(
                bot_pic_binary,
                folder=f"vault/companies/{company_folder}",
                public_id="bot_profile",
                overwrite=True,
                resource_type="image",
                format="png",
                transformation=[
                    {"width": 200, "height": 200, "crop": "fill", "gravity": "face"},
                    {"quality": "auto"},
                ],
            )

            logger.info(f"Bot profile uploaded for {company_name}: {result['secure_url']}")
            return result["secure_url"]

        except Exception as e:
            logger.error(f"Error uploading bot profile for {company_name}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error uploading bot profile picture: {str(e)}"
            ) from e

    @staticmethod
    def get_logo_url(company_name: str) -> str | None:
        """
        Get logo URL for a company (for backward compatibility)

        Args:
            company_name: Company name

        Returns:
            Public URL or None
        """
        try:
            company_folder = company_name.lower().replace(" ", "-")
            public_id = f"vault/companies/{company_folder}/logo"

            return cloudinary.CloudinaryImage(public_id).build_url(
                format="png",
                transformation=[
                    {"width": 500, "height": 500, "crop": "limit"},
                    {"quality": "auto"},
                ],
            )
        except Exception as e:
            logger.warning(f"Error generating logo URL for {company_name}: {e}")
            return None

    @staticmethod
    def get_bot_profile_url(company_name: str) -> str | None:
        """
        Get bot profile URL for a company (for backward compatibility)

        Args:
            company_name: Company name

        Returns:
            Public URL or None
        """
        try:
            company_folder = company_name.lower().replace(" ", "-")
            public_id = f"vault/companies/{company_folder}/bot_profile"

            return cloudinary.CloudinaryImage(public_id).build_url(
                format="png",
                transformation=[
                    {"width": 200, "height": 200, "crop": "fill"},
                    {"quality": "auto"},
                ],
            )
        except Exception as e:
            logger.warning(f"Error generating bot profile URL for {company_name}: {e}")
            return None
