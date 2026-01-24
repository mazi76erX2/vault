"""
Utility endpoints.
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

import app.features.email.email_service as email_service
from app.schemas.auth import EmailTestRequest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/download-logs", response_class=FileResponse)
def download_logs():
    """Download backend log file."""
    return FileResponse("backend_logs.log", media_type="text/plain", filename="backend_logs.log")


@router.post("/test-email")
async def test_email(request: EmailTestRequest):
    """Test email sending functionality."""
    try:
        email_content = request.content if request.content is not None else ""

        success = await email_service.send_test_email(
            email=request.recipient_email,
            subject=(request.subject if request.subject is not None else "Test Email from Vault"),
            content=email_content,
            username=request.username,
        )

        if success:
            logger.info(f"Test email sent successfully to {request.recipient_email}")
            return {
                "status": "success",
                "message": f"Test email sent successfully to {request.recipient_email}",
                "details": {
                    "recipient": request.recipient_email,
                    "subject": (
                        request.subject if request.subject is not None else "Test Email from Vault"
                    ),
                    "content": (
                        email_content[:50] + "..." if len(email_content) > 50 else email_content
                    ),
                },
            }
        else:
            error_detail = email_service.LAST_EMAIL_ERROR or "unknown error"
            logger.error(f"Failed to send test email to {request.recipient_email}: {error_detail}")
            return {
                "status": "error",
                "message": f"Failed to send test email to {request.recipient_email}",
                "error": error_detail,
            }

    except Exception as e:
        logger.error(f"Error in test-email endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}") from e
