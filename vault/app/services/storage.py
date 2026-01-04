"""
Storage service using Cloudinary
Handles file uploads for company logos, bot profile pictures, etc.
"""

import logging
from typing import Optional

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

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
    async def upload_company_logo(
        file: UploadFile, company_reg_no: str
    ) -> dict[str, str]:
        """
        Upload company logo to Cloudinary
        
        Args:
            file: The uploaded file
            company_reg_no: Company registration number for organizing files
            
        Returns:
            dict with 'url' and 'public_id'
        """
        try:
            # Read file content
            contents = await file.read()
            
            # Upload to Cloudinary with organized folder structure
            result = cloudinary.uploader.upload(
                contents,
                folder=f"vault/companies/{company_reg_no}/logos",
                public_id=f"logo_{company_reg_no}",
                overwrite=True,  # Replace if exists
                resource_type="image",
                format="png",  # Convert to PNG
                transformation=[
                    {"width": 500, "height": 500, "crop": "limit"},  # Max dimensions
                    {"quality": "auto"},  # Auto quality
                ],
            )
            
            logger.info(f"Uploaded logo for company {company_reg_no}: {result['secure_url']}")
            
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
            }
            
        except Exception as e:
            logger.error(f"Error uploading logo for {company_reg_no}: {e}")
            raise

    @staticmethod
    async def upload_bot_profile_picture(
        file: UploadFile, company_reg_no: str
    ) -> dict[str, str]:
        """
        Upload bot profile picture to Cloudinary
        
        Args:
            file: The uploaded file
            company_reg_no: Company registration number
            
        Returns:
            dict with 'url' and 'public_id'
        """
        try:
            contents = await file.read()
            
            result = cloudinary.uploader.upload(
                contents,
                folder=f"vault/companies/{company_reg_no}/bot",
                public_id=f"bot_profile_{company_reg_no}",
                overwrite=True,
                resource_type="image",
                format="png",
                transformation=[
                    {"width": 200, "height": 200, "crop": "fill", "gravity": "face"},  # Square crop
                    {"quality": "auto"},
                ],
            )
            
            logger.info(f"Uploaded bot profile for company {company_reg_no}: {result['secure_url']}")
            
            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
            }
            
        except Exception as e:
            logger.error(f"Error uploading bot profile for {company_reg_no}: {e}")
            raise

    @staticmethod
    async def delete_file(public_id: str) -> bool:
        """
        Delete a file from Cloudinary
        
        Args:
            public_id: The Cloudinary public ID of the file
            
        Returns:
            True if successful
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            logger.info(f"Deleted file {public_id}: {result}")
            return result.get("result") == "ok"
        except Exception as e:
            logger.error(f"Error deleting file {public_id}: {e}")
            raise

    @staticmethod
    def get_public_url(public_id: str, transformation: Optional[dict] = None) -> str:
        """
        Get public URL for a Cloudinary asset
        
        Args:
            public_id: The Cloudinary public ID
            transformation: Optional transformation parameters
            
        Returns:
            Public URL
        """
        if transformation:
            return cloudinary.CloudinaryImage(public_id).build_url(**transformation)
        return cloudinary.CloudinaryImage(public_id).build_url()
