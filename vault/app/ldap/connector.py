"""LDAP Connector module for integrating with directory services."""

import logging
import os
from typing import Any

import ldap

# Try to import ldap module, fall back to mock_ldap on Windows
try:
    import ldap

    USING_MOCK = False
except ImportError:
    try:
        # First try relative import from the app package
        import app.ldap.mock_ldap as ldap

        from .mock_ldap import *

        USING_MOCK = True
    except ImportError:
        # Fallback to direct import if the module is at the same level
        import mock_ldap as ldap
        from mock_ldap import *

        USING_MOCK = True
    logging.warning("Using mock LDAP module - limited functionality available")

from .models import LDAPConnector, LDAPGroup, LDAPSearchResult, LDAPUser

# Configure logger
logger = logging.getLogger(__name__)


def get_ldap_client(
    connector: LDAPConnector, bypass_cert_verification: bool = False
) -> ldap.ldapobject.LDAPObject:
    """
    Create an LDAP client based on connector configuration.

    Args:
        connector: The LDAP connector configuration
        bypass_cert_verification: Whether to bypass certificate verification

    Returns:
        An LDAP client object
    """
    # Format the host correctly
    host = connector.host.lower().replace("ldap://", "").replace("ldaps://", "")
    protocol = "ldaps" if connector.is_ssl else "ldap"
    url = f"{protocol}://{host}:{connector.port}"

    # Initialize LDAP connection
    ldap_client = ldap.initialize(url)

    # Set timeout for search operations
    if connector.search_timeout:
        ldap_client.set_option(ldap.OPT_TIMEOUT, connector.search_timeout)

    # Configure SSL/TLS options if needed
    if connector.is_ssl:
        # Get certificate file path
        cert_dir = os.path.dirname(os.path.abspath(__file__))
        cert_path = os.path.join(cert_dir, "CA-group.local.cer")

        # --- Added for testing: Bypass cert verification if requested ---
        # Note: This should only be used for testing/debugging, NOT production connections
        if bypass_cert_verification:
            logger.warning("Bypassing LDAP SSL certificate verification. ONLY for testing!")
            ldap_client.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)
            ldap_client.set_option(ldap.OPT_X_TLS_NEWCTX, 0)  # Set NEWCTX when bypassing
            ldap_client.set_option(
                ldap.OPT_REFERRALS, 0
            )  # Set REFERRALS when bypassing, matching test script
        # ---------------------------------------------------------------
        elif os.path.exists(cert_path):
            # Set up certificate
            ldap_client.set_option(ldap.OPT_X_TLS_CACERTFILE, cert_path)
            ldap_client.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_DEMAND)
            ldap_client.set_option(ldap.OPT_X_TLS_NEWCTX, 0)
        else:
            logger.warning(f"SSL certificate not found at {cert_path}")
            if not bypass_cert_verification:
                logger.error(
                    f"SSL certificate not found at {cert_path}. Connection may fail unless server requires no cert or trust is implicit."
                )
                pass  # Keep the existing logic as the bypass check comes first.

        # Ensure OPT_REFERRALS is set to 0 when is_ssl is true, matching test script more closely
        # This is outside the bypass/cert check so it applies if is_ssl is true and bypass is false but cert exists.
        # This might be redundant with the bypass block, but ensures consistency with test script.
        # Let's apply it unconditionally if is_ssl is true, as in the test script.
        # No, the test script applies OPT_REFERRALS=0 specifically inside the is_ssl block, not always.
        # The bypass block setting it seems correct.

    # Configure protocol version
    ldap_client.protocol_version = ldap.VERSION3

    return ldap_client


def format_user_ldap_entry(
    entry: tuple[str, dict[str, list[bytes]]], connector: LDAPConnector
) -> LDAPUser:
    """
    Format LDAP user entry to a standardized model

    Args:
        entry: LDAP entry tuple (dn, attrs)
        connector: LDAP connector configuration

    Returns:
        A user model formatted from the LDAP entry
    """
    dn, attrs = entry

    # Helper to get attribute safely
    def get_attr(attr_name: str) -> str:
        if attr_name in attrs and attrs[attr_name]:
            value = attrs[attr_name][0]
            if isinstance(value, bytes):
                return value.decode("utf-8")
            return str(value)
        return ""

    # Map attributes
    cn = get_attr("cn")
    sam_account_name = get_attr(connector.attribute_username)
    email = get_attr(connector.attribute_email)
    first_name = get_attr(connector.attribute_first_name)
    last_name = get_attr(connector.attribute_last_name)

    return LDAPUser(
        type="user",
        name=cn,
        directoryId=connector.id,
        username=f"{connector.domain}\\{sam_account_name}".lower(),
        email=email or "No email provided",
        firstName=first_name,
        lastName=last_name,
    )


def get_ldap_group_members(
    member_list: list[str], connector: LDAPConnector
) -> list[dict[str, Any]]:
    """
    Extract group members from LDAP member list

    Args:
        member_list: list of member DNs
        connector: LDAP connector configuration

    Returns:
        list of user dictionaries
    """
    if not member_list:
        return []

    members = []
    for member_dn in member_list:
        if isinstance(member_dn, bytes):
            member_dn = member_dn.decode("utf-8")

        # Parse DN parts
        parts = member_dn.split(",")
        parts_map = {}

        for part in parts:
            key_value = part.split("=")
            if len(key_value) == 2:
                parts_map[key_value[0]] = key_value[1]

        # Extract CN and split into name parts
        cn = parts_map.get("CN", "")
        name_parts = cn.split(" ")

        # Create user object
        user_obj = {
            "type": "LDAP",
            "company_id": connector.company_id,
            "lastName": name_parts[1] if len(name_parts) > 1 else "",
            "email": "",
            "id": "",
            "password": "",
            "directoryId": connector.id,
            "firstName": name_parts[0] if name_parts else "",
            "username": (f"{connector.domain}\\{name_parts[0]}".lower() if name_parts else ""),
            "colourBlind": False,
            "disabled": False,
        }

        members.append(user_obj)

    return members


def format_group_ldap_entry(
    entry: tuple[str, dict[str, list[bytes]]], connector: LDAPConnector
) -> LDAPGroup:
    """
    Format LDAP group entry to a standardized model

    Args:
        entry: LDAP entry tuple (dn, attrs)
        connector: LDAP connector configuration

    Returns:
        A group model formatted from the LDAP entry
    """
    dn, attrs = entry

    # Helper to get attribute safely
    def get_attr(attr_name: str) -> str:
        if attr_name in attrs and attrs[attr_name]:
            value = attrs[attr_name][0]
            if isinstance(value, bytes):
                return value.decode("utf-8")
            return str(value)
        return ""

    # Get members
    members_attr = connector.attribute_group_members
    member_list = attrs.get(members_attr, [])
    members = get_ldap_group_members(member_list, connector)

    # Get group name
    group_name = get_attr(connector.attribute_group_name) or get_attr("cn")

    return LDAPGroup(
        type="group",
        name=group_name,
        directoryId=connector.id,
        username=f"{len(members)} user{'s' if len(members) != 1 else ''}",
        email="",
        members=members,
    )


async def get_ldap_search_results(query: str, connector: LDAPConnector) -> list[LDAPSearchResult]:
    """
    Search LDAP directory for users and groups matching the query

    Args:
        query: Search query string
        connector: LDAP connector configuration

    Returns:
        list of search results (users and groups)
    """
    try:
        # Get LDAP client
        client = get_ldap_client(connector)

        # Parse query
        name_parts = query.split("\\")
        account_name = name_parts[-1]

        try:
            # Bind with service account
            client.simple_bind_s(connector.username, connector.password)

            # User search configuration
            user_dn = f"{connector.user_dn + ',' if connector.user_dn else ''}{connector.base_dn}"

            # Build user filter
            if account_name == "*":
                user_filter = f"(&(objectClass={connector.user_object}))"
            else:
                user_filter = f"(&(objectClass={connector.user_object})({connector.attribute_username}=*{account_name}*))"

            if connector.user_object_filter:
                user_filter = connector.user_object_filter.replace("*", account_name)

            # Filter attributes
            user_attrs = [
                connector.attribute_username,
                connector.attribute_first_name,
                connector.attribute_last_name,
                connector.attribute_display_name,
                connector.attribute_username_rdn,
                connector.attribute_principal_name,
                connector.attribute_email,
                connector.attribute_user_guid,
                "cn",
            ]
            user_attrs = [attr for attr in user_attrs if attr]

            # Search for users
            logger.info(f"Searching for users with filter: {user_filter}")
            user_results = client.search_s(user_dn, ldap.SCOPE_SUBTREE, user_filter, user_attrs)

            # Group search configuration
            group_dn = (
                f"{connector.group_dn + ',' if connector.group_dn else ''}{connector.base_dn}"
            )

            # Build group filter
            if account_name == "*":
                group_filter = f"(&(objectClass={connector.group_object}))"
            else:
                group_filter = f"(&(objectClass={connector.group_object})({connector.attribute_group_name}=*{account_name}*))"

            if connector.group_object_filter:
                group_filter = connector.group_object_filter.replace("*", account_name)

            # Filter attributes
            group_attrs = [
                connector.attribute_group_name,
                connector.attribute_group_description,
                connector.attribute_group_members,
                connector.attribute_group_guid,
                "cn",
            ]
            group_attrs = [attr for attr in group_attrs if attr]

            # Search for groups
            logger.info(f"Searching for groups with filter: {group_filter}")
            group_results = client.search_s(group_dn, ldap.SCOPE_SUBTREE, group_filter, group_attrs)

            # Format results
            users = [
                format_user_ldap_entry(entry, connector)
                for entry in user_results
                if entry[0]  # Filter out None entries
            ]
            groups = [
                format_group_ldap_entry(entry, connector)
                for entry in group_results
                if entry[0]  # Filter out None entries
            ]

            # Combine results
            combined_results = users + groups

            return combined_results

        except ldap.LDAPError as e:
            error_msg = str(e)
            logger.error(f"LDAP search error: {error_msg}")
            return []

        finally:
            # Always unbind
            try:
                client.unbind_s()
            except:
                pass

    except Exception as e:
        logger.error(f"Error in LDAP search: {str(e)}")
        return []


async def authenticate_ldap(connector: LDAPConnector, credentials: dict[str, str]) -> bool:
    """
    Authenticate a user against LDAP

    Args:
        connector: LDAP connector configuration
        credentials: User credentials (email and password)

    Returns:
        True if authentication successful, False otherwise
    """
    try:
        # Get credentials
        email = credentials.get("email", "")
        password = credentials.get("password", "")

        if not email or not password:
            logger.error("Missing email or password for LDAP authentication")
            return False

        # Determine username from email
        user_components = email.split("@")
        username = user_components[0] if user_components else email

        # Get LDAP client
        client = get_ldap_client(connector)

        try:
            # Search for user
            search_dn = f"{connector.user_dn + ',' if connector.user_dn else ''}{connector.base_dn}"
            search_filter = (
                f"(&(objectClass={connector.user_object})({connector.attribute_email}={email}))"
            )

            # Bind with service account to search
            client.simple_bind_s(connector.username, connector.password)

            # Get user's DN
            results = client.search_s(search_dn, ldap.SCOPE_SUBTREE, search_filter, ["dn"])

            if not results:
                # Try with username instead
                search_filter = f"(&(objectClass={connector.user_object})({connector.attribute_username}={username}))"
                results = client.search_s(search_dn, ldap.SCOPE_SUBTREE, search_filter, ["dn"])

            if not results or not results[0][0]:
                logger.warning(f"User not found in LDAP: {email}")
                return False

            user_dn = results[0][0]

            # Unbind service account
            client.unbind_s()

            # Create new client and try to authenticate with user credentials
            client = get_ldap_client(connector)
            client.simple_bind_s(user_dn, password)

            logger.info(f"LDAP authentication successful for user: {email}")
            return True

        except ldap.INVALID_CREDENTIALS:
            logger.warning(f"Invalid LDAP credentials for user: {email}")
            return False

        except ldap.LDAPError as e:
            error_msg = str(e)
            logger.error(f"LDAP authentication error: {error_msg}")
            return False

        finally:
            # Always unbind
            try:
                client.unbind_s()
            except:
                pass

    except Exception as e:
        logger.error(f"Error in LDAP authentication: {str(e)}")
        return False
