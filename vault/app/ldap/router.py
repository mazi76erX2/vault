import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status

# Import supabase for database access
from app.database import supabase

from .models import LDAPConnector, LDAPSearchInputModel, LDAPSearchResult, LoginModel
from .service import (
    create_ldap_connector,
    delete_ldap_connector,
    get_ldap_connector,
    get_ldap_connectors,
    ldap_authenticate,
    ldap_search,
    sync_ldap_connector,
    test_ldap_connection,
    update_ldap_connector,
)

# Create router
router = APIRouter(
    prefix="/api/ldap",
    tags=["ldap"],
    responses={404: {"description": "Not found"}},
)


@router.post("/connectors", status_code=status.HTTP_201_CREATED, response_model=dict[str, Any])
async def create_connector(connector_data: dict[str, Any]):
    """
    Create a new LDAP connector
    """
    result = await create_ldap_connector(connector_data)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


@router.put("/connectors/{connector_id}", response_model=dict[str, Any])
async def update_connector(connector_id: str, connector_data: dict[str, Any]):
    """
    Update an existing LDAP connector
    """
    result = await update_ldap_connector(connector_id, connector_data)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


@router.delete("/connectors/{connector_id}", response_model=dict[str, Any])
async def delete_connector(connector_id: str):
    """
    Delete an LDAP connector
    """
    result = await delete_ldap_connector(connector_id)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


@router.get("/connectors/{connector_id}", response_model=LDAPConnector)
async def get_connector(connector_id: str):
    """
    Get an LDAP connector by ID
    """
    connector = await get_ldap_connector(connector_id)

    if not connector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"LDAP connector not found: {connector_id}",
        )

    return connector


@router.get("/connectors", response_model=list[LDAPConnector])
async def list_connectors(company_reg_no: str | None = None):
    """
    list all LDAP connectors, optionally filtered by company
    """
    connectors = await get_ldap_connectors(company_reg_no)
    return connectors


@router.post("/test-connection", response_model=dict[str, Any])
async def test_connection(connector_data: dict[str, Any]):
    """
    Test connection to an LDAP server
    """
    result = await test_ldap_connection(connector_data)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


@router.post("/search", response_model=list[LDAPSearchResult])
async def search(search_data: LDAPSearchInputModel):
    """
    Search LDAP directory
    """
    results = await ldap_search(search_data)
    return results


@router.post("/authenticate", response_model=dict[str, Any])
async def authenticate(connector_id: str, credentials: LoginModel):
    """
    Authenticate a user against LDAP
    """
    auth_result = await ldap_authenticate(connector_id, credentials)

    return {
        "authenticated": auth_result,
        "message": ("Authentication successful" if auth_result else "Authentication failed"),
    }


@router.post("/sync/{connector_id}", response_model=dict[str, Any])
async def sync_connector(connector_id: str):
    """
    Synchronize users and groups with LDAP directory
    """
    result = await sync_ldap_connector(connector_id)

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    return result


# Directory-specific endpoints
@router.post("/directory/config", response_model=dict[str, Any])
async def create_directory_config(directory_data: dict[str, Any]):
    """
    Create or update LDAP directory configuration
    """
    try:
        # Get the user's company_id from their profile
        user_id = directory_data.get("user_id")

        # Convert frontend form data to backend model
        connector_data = {
            # Server Settings
            "name": directory_data.get("name"),
            "directory_type": directory_data.get("directoryType"),
            "domain": directory_data.get("domain"),
            "host": directory_data.get("host"),
            "port": directory_data.get("port"),
            "username": directory_data.get("username"),
            "password": directory_data.get("password"),
            "sync_interval": int(directory_data.get("syncInterval", 60)),
            "search_timeout": int(directory_data.get("searchTimeout", 60)),
            "base_dn": directory_data.get("baseDN"),
            "user_dn": directory_data.get("userDN"),
            "group_dn": directory_data.get("groupDN"),
            "is_ssl": directory_data.get("sslConnection", False),
            # User Schema
            "user_object": directory_data.get("userObject"),
            "user_object_filter": directory_data.get("userFilter"),
            "attribute_username": directory_data.get("userName"),
            "attribute_username_rdn": directory_data.get("userObjectRDN"),
            "attribute_first_name": directory_data.get("firstName"),
            "attribute_last_name": directory_data.get("lastName"),
            "attribute_display_name": directory_data.get("displayName"),
            "attribute_principal_name": directory_data.get("principalName"),
            "attribute_email": directory_data.get("email"),
            "attribute_user_guid": directory_data.get("uniqueId"),
            "attribute_user_groups": directory_data.get("userGroups"),
            # Group Schema
            "group_object": directory_data.get("groupObject"),
            "group_object_filter": directory_data.get("groupFilter"),
            "group_recursive": directory_data.get("fetchRecursively", True),
            "attribute_group_guid": directory_data.get("groupUniqueId"),
            "attribute_group_name": directory_data.get("groupName"),
            "attribute_group_description": directory_data.get("groupDescription"),
            "attribute_group_members": directory_data.get("groupMembers"),
            # Get company_id from profiles table
            "company_id": None,  # Will be set from profile
        }

        # Get the user's company_id
        if user_id:
            profile_response = (
                supabase.table("profiles").select("company_id").eq("id", user_id).execute()
            )

            if profile_response.data and profile_response.data[0].get("company_id"):
                connector_data["company_id"] = profile_response.data[0]["company_id"]
            else:
                raise HTTPException(
                    status_code=400,
                    detail="User does not have a company associated with their profile",
                )

        # Check if a connector already exists for this company
        existing_connector = (
            supabase.table("ldap_connectors")
            .select("id")
            .eq("company_id", connector_data["company_id"])
            .execute()
        )

        if existing_connector.data:
            # Update existing connector
            connector_id = existing_connector.data[0]["id"]
            result = await update_ldap_connector(connector_id, connector_data)
        else:
            # Create new connector
            result = await create_ldap_connector(connector_data)

        return result

    except Exception as e:
        logging.error(f"Error configuring LDAP directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error configuring LDAP directory: {str(e)}")


@router.get("/directory/config/{company_id}", response_model=dict[str, Any])
async def get_directory_config(company_id: int):
    """
    Get LDAP directory configuration for a company
    """
    try:
        # Fetch the connector configuration
        response = (
            supabase.table("ldap_connectors").select("*").eq("company_id", company_id).execute()
        )

        if not response.data:
            return {"exists": False}

        connector = response.data[0]

        # Transform to frontend format
        result = {
            "exists": True,
            "directoryType": connector.get("directory_type"),
            "name": connector.get("name"),
            "domain": connector.get("domain"),
            "host": connector.get("host"),
            "port": connector.get("port"),
            "username": connector.get("username"),
            "password": connector.get("password"),
            "syncInterval": str(connector.get("sync_interval")),
            "searchTimeout": str(connector.get("search_timeout")),
            "baseDN": connector.get("base_dn"),
            "userDN": connector.get("user_dn"),
            "groupDN": connector.get("group_dn"),
            "sslConnection": connector.get("is_ssl"),
            "userObject": connector.get("user_object"),
            "userFilter": connector.get("user_object_filter"),
            "userName": connector.get("attribute_username"),
            "userObjectRDN": connector.get("attribute_username_rdn"),
            "firstName": connector.get("attribute_first_name"),
            "lastName": connector.get("attribute_last_name"),
            "displayName": connector.get("attribute_display_name"),
            "principalName": connector.get("attribute_principal_name"),
            "email": connector.get("attribute_email"),
            "uniqueId": connector.get("attribute_user_guid"),
            "userGroups": connector.get("attribute_user_groups"),
            "groupObject": connector.get("group_object"),
            "groupFilter": connector.get("group_object_filter"),
            "fetchRecursively": connector.get("group_recursive"),
            "groupUniqueId": connector.get("attribute_group_guid"),
            "groupName": connector.get("attribute_group_name"),
            "groupDescription": connector.get("attribute_group_description"),
            "groupMembers": connector.get("attribute_group_members"),
            "status": connector.get("status"),
            "lastSync": connector.get("last_sync"),
        }

        return result

    except Exception as e:
        logging.error(f"Error fetching LDAP directory config: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching LDAP directory config: {str(e)}"
        )


@router.post("/directory/test-connection", response_model=dict[str, Any])
async def test_directory_connection(directory_data: dict[str, Any]):
    """
    Test connection to an LDAP directory
    """
    try:
        # Convert frontend form data to test format
        connection_data = {
            "name": directory_data.get("name"),
            "domain": directory_data.get("domain"),
            "host": directory_data.get("host"),
            "port": directory_data.get("port"),
            "username": directory_data.get("username"),
            "password": directory_data.get("password"),
            "company_id": directory_data.get("company_id"),
            "base_dn": directory_data.get("base_dn"),
            "user_dn": directory_data.get("user_dn"),
            "group_dn": directory_data.get("group_dn"),
            "is_ssl": directory_data.get("is_ssl", False),
            "sync_interval": int(directory_data.get("sync_interval", 60)),
            "search_timeout": int(directory_data.get("search_timeout", 30)),
            "user_object": directory_data.get("user_object"),
            "user_object_filter": directory_data.get("user_object_filter"),
            "attribute_username": directory_data.get("attribute_username"),
            "attribute_username_rdn": directory_data.get("attribute_username_rdn"),
            "attribute_first_name": directory_data.get("attribute_first_name"),
            "attribute_last_name": directory_data.get("attribute_last_name"),
            "attribute_display_name": directory_data.get("attribute_display_name"),
            "attribute_principal_name": directory_data.get("attribute_principal_name"),
            "attribute_email": directory_data.get("attribute_email"),
            "attribute_user_guid": directory_data.get("attribute_user_guid"),
            "attribute_user_groups": directory_data.get("attribute_user_groups"),
            "group_object": directory_data.get("group_object"),
            "group_object_filter": directory_data.get("group_object_filter"),
            "attribute_group_guid": directory_data.get("attribute_group_guid"),
            "attribute_group_name": directory_data.get("attribute_group_name"),
            "attribute_group_description": directory_data.get("attribute_group_description"),
            "attribute_group_members": directory_data.get("attribute_group_members"),
            "group_recursive": directory_data.get("group_recursive", False),
            "active": directory_data.get("active", False),
            "directory_type": directory_data.get("directory_type", "active_directory"),
            "status": directory_data.get("status", "inactive"),
            "bypass_cert_verification": True,  # Add flag to bypass cert verification for testing
        }

        # Test connection
        result = await test_ldap_connection(connection_data)
        return result

    except Exception as e:
        logging.error(f"Error testing LDAP connection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error testing LDAP connection: {str(e)}")


@router.post("/directory/sync/{company_id}", response_model=dict[str, Any])
async def sync_directory(company_id: int):
    """
    Synchronize users and groups from LDAP directory
    """
    try:
        # Get the connector for this company
        response = (
            supabase.table("ldap_connectors").select("id").eq("company_id", company_id).execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        connector_id = response.data[0]["id"]

        # Start sync process
        result = await sync_ldap_connector(connector_id)
        return result

    except Exception as e:
        logging.error(f"Error syncing LDAP directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error syncing LDAP directory: {str(e)}")


@router.get("/directory/users/{company_id}", response_model=list[dict[str, Any]])
async def get_directory_users(company_id: int, query: str | None = None):
    """
    Get users from LDAP directory, optionally filtered by search query
    """
    try:
        # Get the connector for this company
        response = (
            supabase.table("ldap_connectors").select("*").eq("company_id", company_id).execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="No LDAP connector found for this company")

        # Convert company_id to string for LDAPConnector model
        connector_data = response.data[0].copy()
        connector_data["company_id"] = str(connector_data["company_id"])
        connector = LDAPConnector(**connector_data)

        # Search LDAP for users
        search_input = LDAPSearchInputModel(query=query or "*", connectorId=connector.id)

        results = await ldap_search(search_input)

        # Filter only user results (not groups)
        users = [result.dict() for result in results if result.type == "user"]

        return users

    except Exception as e:
        logging.error(f"Error fetching LDAP users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching LDAP users: {str(e)}")


@router.post("/directory/import-user", response_model=dict[str, Any])
async def import_user_from_directory(data: dict[str, Any]):
    """
    Import a user from LDAP directory to Vault
    """
    try:
        user_data = data.get("userData")
        ldap_data = data.get("ldapData")

        if not user_data or not ldap_data:
            raise HTTPException(status_code=400, detail="Missing user data or LDAP data")

        # Format the data for organization API
        org_data = {
            "firstName": ldap_data.get("firstName", ""),
            "lastName": ldap_data.get("lastName", ""),
            "email": ldap_data.get("email", ""),
            "telephone": user_data.get("telephone", ""),
            "company": user_data.get("company", ""),
        }

        # Create user using organization API
        # Using supabase directly instead of a separate API call
        try:
            # Find the company by name
            company_response = (
                supabase.from_("companies").select("id").eq("name", org_data["company"]).execute()
            )

            if not company_response.data:
                # Try using company_id if provided
                company_id = user_data.get("company_id")
                if company_id:
                    # Verify company exists
                    company_check = (
                        supabase.from_("companies")
                        .select("id, name")
                        .eq("id", company_id)
                        .execute()
                    )

                    if company_check.data:
                        company_id = company_check.data[0]["id"]
                        org_data["company"] = company_check.data[0]["name"]
                    else:
                        raise HTTPException(
                            status_code=404,
                            detail=f"Company with ID '{company_id}' not found",
                        )
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Company with name '{org_data['company']}' not found",
                    )
            else:
                company_id = company_response.data[0]["id"]

            # Create the user profile
            profile_data = {
                "full_name": f"{org_data['firstName']} {org_data['lastName']}",
                "email": org_data["email"],
                "telephone": org_data["telephone"],
                "company_id": company_id,
                "company_name": org_data["company"],
                "department": user_data.get("department", ""),
                "field_of_expertise": user_data.get("field_of_expertise", ""),
                "years_of_experience": user_data.get("years_of_experience", ""),
                "CV_text": user_data.get("CV_text", ""),
                "user_type": user_data.get("user_type", 2),  # Default to user_directory type (2)
            }

            # Check if user exists by email
            existing_user = (
                supabase.from_("profiles").select("id").eq("email", profile_data["email"]).execute()
            )

            if existing_user.data:
                # Update existing user
                user_id = existing_user.data[0]["id"]
                profile_response = (
                    supabase.from_("profiles").update(profile_data).eq("id", user_id).execute()
                )
                message = "User updated successfully"
            else:
                # Create new user with random password
                import random
                import string

                from app.email_service import send_welcome_email

                password = "".join(random.choices(string.ascii_letters + string.digits, k=12))
                username = f"{org_data['firstName'].lower()[0]}{org_data['lastName'].lower()}{random.randint(1000, 9999)}"

                # Create user in Supabase Auth
                auth_response = supabase.auth.admin.create_user(
                    {
                        "email": profile_data["email"],
                        "password": password,
                        "username": username,
                        "email_confirm": True,
                    }
                )

                user_id = auth_response.user.id
                profile_data["id"] = user_id
                profile_data["username"] = username

                profile_response = supabase.from_("profiles").insert(profile_data).execute()

                # Send welcome email with temporary password
                await send_welcome_email(profile_data["email"], password, username)
                message = "User imported successfully"

            return {"message": message, "data": profile_response.data}

        except Exception as e:
            logging.error(f"Error in user import processing: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating/updating user: {str(e)}")

    except Exception as e:
        logging.error(f"Error importing LDAP user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error importing LDAP user: {str(e)}")
