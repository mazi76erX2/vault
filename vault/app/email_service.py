import logging
import os
from dotenv import load_dotenv
from typing import Optional
from pathlib import Path

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)
# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Get email settings from environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@example.com")
COMPANY_NAME = os.getenv("COMPANY_NAME", "Vault")
VAULT_URL = os.getenv("VAULT_URL", "https://vault.example.com")

# Global to store the last email error for debugging
LAST_EMAIL_ERROR: Optional[str] = None


async def send_email(
    to_email: str, subject: str, html_content: str, text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML body content
        text_content: Plain text body content (optional)

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    global LAST_EMAIL_ERROR

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{COMPANY_NAME} <{EMAIL_FROM}>"
        msg["To"] = to_email

        logger.info("Sending email to %s", to_email)
        logger.info("Email from %s", EMAIL_FROM)
        logger.info("SMTP server %s", SMTP_SERVER)
        logger.info("SMTP port %s", SMTP_PORT)
        logger.info("SMTP username %s", SMTP_USERNAME)
        logger.info("SMTP password %s", SMTP_PASSWORD)

        # Add plain text part
        if text_content:
            msg.attach(MIMEText(text_content, "plain"))

        # Add HTML part
        msg.attach(MIMEText(html_content, "html"))

        # Connect to SMTP server and send
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            # Log connection info for debugging
            logging.info("Connecting to SMTP server: %s:%s" % (SMTP_SERVER, SMTP_PORT))

            # Start TLS for security
            server.starttls()

            # Login with credentials
            logging.info("Authenticating with username: %s" % SMTP_USERNAME)
            server.login(SMTP_USERNAME, SMTP_PASSWORD)

            # Send email
            logging.info("Sending email from %s to %s" % (EMAIL_FROM, to_email))
            server.sendmail(EMAIL_FROM, to_email, msg.as_string())

        logging.info("Email sent successfully to %s: %s" % (to_email, subject))
        LAST_EMAIL_ERROR = None
        return True

    except Exception as e:
        # Store the error detail for diagnostics
        LAST_EMAIL_ERROR = str(e)
        logging.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_welcome_email(to_email: str, password: str, username: str) -> bool:
    """
    Send welcome email with temporary password

    Args:
        to_email: Recipient email address
        password: Temporary password
        username: User's username

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = f"Welcome to {COMPANY_NAME} Vault"

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4a69bd; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .footer {{ font-size: 12px; color: #777; text-align: center; margin-top: 20px; }}
            .button {{ display: inline-block; background-color: #4a69bd; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to {COMPANY_NAME} Vault</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Your account has been created in the {COMPANY_NAME} Vault system.</p>
                <p>Here are your login credentials:</p>
                <ul>
                    <li><strong>Username:</strong> {username}</li>
                    <li><strong>Temporary Password:</strong> {password}</li>
                </ul>
                <p>You will be prompted to change your password upon first login.</p>
                <p>
                    <a href="{VAULT_URL}" class="button">Login to Vault</a>
                </p>
                <p>If you have any questions, please contact your administrator.</p>
                <p>Thank you,<br>The {COMPANY_NAME} Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; {COMPANY_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Welcome to {COMPANY_NAME} Vault
    
    Hello,
    
    Your account has been created in the {COMPANY_NAME} Vault system.
    
    Here are your login credentials:
    Username: {username}
    Temporary Password: {password}
    
    You will be prompted to change your password upon first login.
    
    Login at: {VAULT_URL}
    
    If you have any questions, please contact your administrator.
    
    Thank you,
    The {COMPANY_NAME} Team
    
    This is an automated message. Please do not reply to this email.
    © {COMPANY_NAME}. All rights reserved.
    """

    return await send_email(to_email, subject, html_content, text_content)


async def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send password reset email

    Args:
        to_email: Recipient email address
        reset_link: Password reset link

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = f"Reset Your {COMPANY_NAME} Vault Password"

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4a69bd; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .footer {{ font-size: 12px; color: #777; text-align: center; margin-top: 20px; }}
            .button {{ display: inline-block; background-color: #4a69bd; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reset Your Password</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your {COMPANY_NAME} Vault account.</p>
                <p>Click the button below to reset your password:</p>
                <p>
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email or contact your administrator if you have concerns.</p>
                <p>This link will expire in 24 hours.</p>
                <p>Thank you,<br>The {COMPANY_NAME} Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; {COMPANY_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Reset Your {COMPANY_NAME} Vault Password
    
    Hello,
    
    We received a request to reset your password for your {COMPANY_NAME} Vault account.
    
    To reset your password, please visit the following link:
    {reset_link}
    
    If you did not request a password reset, please ignore this email or contact your administrator if you have concerns.
    
    This link will expire in 24 hours.
    
    Thank you,
    The {COMPANY_NAME} Team
    
    This is an automated message. Please do not reply to this email.
    © {COMPANY_NAME}. All rights reserved.
    """

    return await send_email(to_email, subject, html_content, text_content)


async def send_test_email(
    email: str, subject: str, content: str, username: Optional[str] = None
) -> bool:
    """
    Send a test email to verify email service functionality

    Args:
        email: Recipient email address
        subject: Email subject
        content: Email content text
        username: Optional username to personalize the email

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    greeting = f"Hello {username}," if username else "Hello,"

    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #4a69bd; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 20px; }}
            .footer {{ font-size: 12px; color: #777; text-align: center; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Test Email from {COMPANY_NAME}</h1>
            </div>
            <div class="content">
                <p>{greeting}</p>
                <p>{content}</p>
                <p>This is a test email sent from the {COMPANY_NAME} Vault application to verify email functionality.</p>
                <p>If you received this email, the email service is working correctly.</p>
                <p>Thank you,<br>The {COMPANY_NAME} Team</p>
            </div>
            <div class="footer">
                <p>This is an automated test message. Please do not reply to this email.</p>
                <p>&copy; {COMPANY_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Test Email from {COMPANY_NAME}
    
    {greeting}
    
    {content}
    
    This is a test email sent from the {COMPANY_NAME} Vault application to verify email functionality.
    
    If you received this email, the email service is working correctly.
    
    Thank you,
    The {COMPANY_NAME} Team
    
    This is an automated test message. Please do not reply to this email.
    © {COMPANY_NAME}. All rights reserved.
    """

    return await send_email(email, subject, html_content, text_content)
