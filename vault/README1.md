# LDAP Integration Module

This module provides LDAP integration for the Vault application, allowing authentication and synchronization with LDAP directories.

## Installation

The LDAP module requires the `python-ldap` package, which depends on OpenLDAP development libraries.

### Installing Dependencies

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y python3-dev libldap2-dev libsasl2-dev
```

#### CentOS/RHEL
```bash
sudo yum install -y python-devel openldap-devel
```

#### Windows
On Windows, the easiest approach is to use a pre-built binary:
```bash
pip install python-ldap
```

### Installing the Package
After installing the dependencies, install python-ldap:
```bash
pip install python-ldap==3.4.3
```

## Configuration

The LDAP module uses Supabase to store connector configurations. You'll need to run the schema creation script:

```sql
-- See schema.sql for the complete database schema
```

## Usage Examples

### Creating an LDAP Connector

```python
from app.ldap import service as ldap_service

# Create an LDAP connector
connector_data = {
    "name": "Company LDAP",
    "companyRegNo": "12345",
    "domain": "company.local",
    "host": "ldap.company.local",
    "port": "389",
    "username": "ldap_service_account",
    "password": "password123",
    "baseDN": "dc=company,dc=local",
    "userDN": "ou=Users",
    "groupDN": "ou=Groups",
    "userObject": "person",
    "userObjectFilter": "(&(objectClass=person)(sAMAccountName=*))",
    "attributeUsername": "sAMAccountName",
    "attributeUsernameRDN": "cn",
    "attributeFirstName": "givenName",
    "attributeLastName": "sn",
    "attributeDisplayName": "displayName",
    "attributePrincipalName": "userPrincipalName",
    "attributeEmail": "mail",
    "attributeUserGUID": "objectGUID",
    "attributeUserGroups": "memberOf",
    "groupObject": "group",
    "groupObjectFilter": "(&(objectClass=group)(cn=*))",
    "attributeGroupGUID": "objectGUID",
    "attributeGroupName": "cn",
    "attributeGroupDescription": "description",
    "attributeGroupMembers": "member",
    "groupRecursive": True,
    "active": True,
    "isSSL": False
}

result = await ldap_service.create_ldap_connector(connector_data)
```

### Authenticating a User

```python
from app.ldap import service as ldap_service
from app.ldap.models import LoginModel

# Authenticate user
credentials = LoginModel(
    email="user@company.local",
    password="user_password"
)

is_authenticated = await ldap_service.ldap_authenticate("connector_id", credentials)
```

### Searching LDAP Directory

```python
from app.ldap import service as ldap_service
from app.ldap.models import LDAPSearchInputModel

# Search for users
search_data = LDAPSearchInputModel(
    query="john",
    connectorId="connector_id"
)

search_results = await ldap_service.ldap_search(search_data)
```

### Synchronizing LDAP Users and Groups

```python
from app.ldap import service as ldap_service

# Trigger LDAP synchronization
sync_result = await ldap_service.sync_ldap_connector("connector_id")
```

## API Endpoints

The LDAP module exposes the following API endpoints:

- `POST /api/ldap/connectors` - Create a new LDAP connector
- `PUT /api/ldap/connectors/{connector_id}` - Update an LDAP connector
- `DELETE /api/ldap/connectors/{connector_id}` - Delete an LDAP connector
- `GET /api/ldap/connectors/{connector_id}` - Get an LDAP connector
- `GET /api/ldap/connectors` - List all LDAP connectors
- `POST /api/ldap/test-connection` - Test connection to an LDAP server
- `POST /api/ldap/search` - Search LDAP directory
- `POST /api/ldap/authenticate` - Authenticate a user against LDAP
- `POST /api/ldap/sync/{connector_id}` - Synchronize LDAP users and groups 