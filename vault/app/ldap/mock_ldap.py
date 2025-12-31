"""
Mock LDAP module for development on Windows systems.

This module provides stub implementations of the python-ldap library functions
to allow development and testing on Windows systems without requiring the
full OpenLDAP dependencies.
"""

# LDAP Options
OPT_PROTOCOL_VERSION = 0x0011
OPT_REFERRALS = 0x0008
OPT_X_TLS_DEMAND = 0x0600
OPT_X_TLS_NEVER = 0x0601
OPT_X_TLS_HARD = 0x0602
OPT_X_TLS_ALLOW = 0x0604
OPT_X_TLS_TRY = 0x0605
OPT_X_TLS = 0x6000
OPT_X_TLS_CACERTFILE = 0x8001
OPT_X_TLS_REQUIRE_CERT = 0x6002

# LDAP Scope
SCOPE_BASE = 0
SCOPE_ONELEVEL = 1
SCOPE_SUBTREE = 2

# LDAP Return Codes
RES_ANY = -1
RES_BIND = 0x61
RES_SEARCH_ENTRY = 0x64
RES_SEARCH_RESULT = 0x65
RES_MODIFY = 0x67
RES_ADD = 0x69
RES_DELETE = 0x6B
RES_MODRDN = 0x6D
RES_COMPARE = 0x6F
RES_SEARCH_REFERENCE = 0x73
RES_EXTENDED = 0x78
RES_EXTENDED_PARTIAL = 0x79

# LDAP Result Codes
REFERRAL = 10
SERVER_DOWN = 81
TIMEOUT = 85
UNAVAILABLE = 52

# LDAP TLS Options
LDAP_OPT_X_TLS_NEVER = 0
LDAP_OPT_X_TLS_HARD = 1
LDAP_OPT_X_TLS_DEMAND = 2
LDAP_OPT_X_TLS_ALLOW = 3
LDAP_OPT_X_TLS_TRY = 4


# Exceptions
class LDAPError(Exception):
    """Base exception for LDAP errors."""

    def __init__(self, desc="", info=""):
        self.args = (desc, info)
        self.desc = desc
        self.info = info

    def __str__(self):
        return f"LDAP Error: {self.desc} - {self.info}"


class SERVER_DOWN(LDAPError):
    """Server is down or unavailable."""

    pass


class INVALID_CREDENTIALS(LDAPError):
    """Invalid credentials."""

    pass


class TIMEOUT(LDAPError):
    """The operation timed out."""

    pass


class FILTER_ERROR(LDAPError):
    """Invalid filter."""

    pass


class MockConnection:
    """Mock LDAP connection object."""

    def __init__(self, uri):
        self.uri = uri
        self.bound = False
        self.options = {}
        print(f"[MOCK LDAP] Initializing connection to {uri}")

    def set_option(self, option, value):
        """Set LDAP option."""
        self.options[option] = value
        print(f"[MOCK LDAP] Setting option {option} to {value}")
        return None

    def simple_bind_s(self, who=None, cred=None):
        """Synchronous simple bind operation."""
        print(f"[MOCK LDAP] Binding with user: {who}")

        # Simulate authentication
        if who and "invalid" in str(who).lower():
            self.bound = False
            raise INVALID_CREDENTIALS(
                "Invalid credentials", {"desc": "Invalid username or password"}
            )

        self.bound = True
        return (97, [])

    def search_s(self, base, scope, filterstr="(objectClass=*)", attrlist=None, attrsonly=0):
        """Synchronous search operation."""
        print(f"[MOCK LDAP] Searching: base={base}, filter={filterstr}, scope={scope}")

        # Mock empty result
        if "empty" in str(base).lower() or "empty" in str(filterstr).lower():
            return []

        # Mock error
        if "error" in str(base).lower() or "error" in str(filterstr).lower():
            raise LDAPError("Search failed", {"desc": "Mock search error"})

        # Mock user results
        if "user" in str(filterstr).lower() or "person" in str(filterstr).lower():
            result = []
            # Add a few mock users
            for i in range(1, 4):
                dn = f"cn=user{i},{base}"
                attrs = {
                    "cn": [f"user{i}".encode()],
                    "sn": [f"User {i}".encode()],
                    "mail": [f"user{i}@example.com".encode()],
                    "givenName": [f"Test{i}".encode()],
                    "objectClass": [
                        b"top",
                        b"person",
                        b"organizationalPerson",
                        b"user",
                    ],
                }
                result.append((dn, attrs))
            return result

        # Mock group results
        if "group" in str(filterstr).lower():
            result = []
            # Add a few mock groups
            for i in range(1, 3):
                dn = f"cn=group{i},{base}"
                attrs = {
                    "cn": [f"group{i}".encode()],
                    "description": [f"Test Group {i}".encode()],
                    "member": [
                        f"cn=user1,{base}".encode(),
                        f"cn=user2,{base}".encode(),
                    ],
                    "objectClass": [b"top", b"group"],
                }
                result.append((dn, attrs))
            return result

        # Default return some basic entry
        return [
            (
                f"dc=example,{base}",
                {"dc": [b"example"], "objectClass": [b"top", b"domain"]},
            )
        ]

    def unbind_s(self):
        """Synchronous unbind operation."""
        print(f"[MOCK LDAP] Unbinding from {self.uri}")
        self.bound = False
        return None


def initialize(uri):
    """Initialize LDAP connection."""
    print(f"[MOCK LDAP] Creating new connection for: {uri}")
    return MockConnection(uri)


def get_option(option):
    """Get LDAP option."""
    print(f"[MOCK LDAP] Getting option {option}")
    return None


def set_option(option, value):
    """Set global LDAP option."""
    print(f"[MOCK LDAP] Setting global option {option} to {value}")
    return None
