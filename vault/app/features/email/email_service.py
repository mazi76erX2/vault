"""
Email Service
Sends emails for password reset, welcome messages, etc.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str, subject: str, html_content: str, text_content: str | None = None
):
    """Send an email"""
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        # Add text and HTML parts
        if text_content:
            part1 = MIMEText(text_content, "plain")
            msg.attach(part1)

        part2 = MIMEText(html_content, "html")
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent to: {to_email}")
        return True

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        return False


async def send_welcome_email(email: str, password: str, username: str):
    """Send welcome email to new user"""
    subject = "Welcome to Vault - Your Account is Ready"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #e66334; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .credentials {{ background-color: white; padding: 15px; border-left: 4px solid #e66334; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Vault</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Your Vault account has been created successfully. Here are your login credentials:</p>

                <div class="credentials">
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Temporary Password:</strong> {password}</p>
                </div>

                <p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>

                <p>You can access Vault at: <a href="{settings.FRONTEND_URL or 'http://localhost:3000'}">{settings.FRONTEND_URL or 'http://localhost:3000'}</a></p>

                <p>If you have any questions, please don't hesitate to contact support.</p>

                <p>Best regards,<br>The Vault Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Welcome to Vault

    Your account has been created successfully.

    Username: {username}
    Email: {email}
    Temporary Password: {password}

    Important: Please change your password after your first login.

    Best regards,
    The Vault Team
    """

    await send_email(email, subject, html_content, text_content)


async def send_password_reset_email(email: str, token: str):
    """Send password reset email"""
    reset_url = f"{settings.FRONTEND_URL or 'http://localhost:3000'}/password-reset?email={email}&key={token}"

    subject = "Password Reset Request - Vault"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #e66334; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .button {{ display: inline-block; padding: 12px 30px; background-color: #e66334; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your Vault account.</p>

                <p>Click the button below to reset your password:</p>

                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>

                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">{reset_url}</p>

                <p><strong>This link will expire in 1 hour.</strong></p>

                <p>If you didn't request a password reset, you can safely ignore this email.</p>

                <p>Best regards,<br>The Vault Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Password Reset Request

    We received a request to reset your password for your Vault account.

    Click the link below to reset your password:
    {reset_url}

    This link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.

    Best regards,
    The Vault Team
    """

    await send_email(email, subject, html_content, text_content)
