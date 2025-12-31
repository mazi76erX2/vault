import logging

import msal
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def send_email_graph(client_id, client_secret, tenant_id, sender, recipient_email, subject, body):

    # Authority URL
    authority_url = f"https://login.microsoftonline.com/{tenant_id}"

    # Create a confidential client app
    app = msal.ConfidentialClientApplication(
        client_id, authority=authority_url, client_credential=client_secret
    )

    # Acquire a token
    scopes = ["https://graph.microsoft.com/.default"]
    result = app.acquire_token_silent(scopes, account=None)

    if not result:
        result = app.acquire_token_for_client(scopes=scopes)

    if isinstance(result, dict):
        if "access_token" in result:
            # Set the endpoint
            endpoint = f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

            # Create the email message
            email_msg = {
                "Message": {
                    "Subject": subject,
                    "Body": {"ContentType": "Text", "Content": body},
                    "ToRecipients": [{"EmailAddress": {"Address": recipient_email}}],
                },
                "SaveToSentItems": "true",
            }

            # Send the email
            response = requests.post(
                endpoint,
                headers={"Authorization": "Bearer " + result["access_token"]},
                json=email_msg,
            )

            if response.status_code == 202:
                logger.info("Email sent successfully via Microsoft Graph API!")
            else:
                logger.error(
                    f"Failed to send email: {response.status_code} due to: {response.text}"
                )

        else:
            logger.error(f"Failed to acquire token due to: {result.get('error_description')}")
    else:
        logger.error("Failed to acquire token: result is not a dictionary.")
