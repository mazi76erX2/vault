from enum import Enum

import ldap


class LDAPStatusText(str, Enum):
    """Enumeration of LDAP error codes"""

    ENOTFOUND = "ENOTFOUND"
    ETIMEDOUT = "ETIMEDOUT"
    ECONNRESET = "ECONNRESET"
    ECONNREFUSED = "ECONNREFUSED"
    ERRADDRINUSE = "ERRADDRINUSE"
    EADDRNOTAVAIL = "EADDRNOTAVAIL"
    ECONNABORTED = "ECONNABORTED"
    EHOSTUNREACH = "EHOSTUNREACH"
    EACCES = "EACCES"
    EAI_AGAIN = "EAI_AGAIN"
    EEXIST = "EEXIST"
    EISDIR = "EISDIR"
    EPERM = "EPERM"
    ENOENT = "ENOENT"
    ENOTDIR = "ENOTDIR"


class LDAPError(Exception):
    """Custom LDAP error with additional info"""

    def __init__(self, errno: int, code: str, syscall: str, hostname: str, message: str = None):
        self.errno = errno
        self.code = code
        self.syscall = syscall
        self.hostname = hostname
        self.message = message or f"LDAP Error {code}: {syscall} failed for {hostname}"
        super().__init__(self.message)


def map_ldap_error(error: ldap.LDAPError) -> str:
    """
    Map LDAP errors to human-readable messages

    Args:
        error: The LDAP error

    Returns:
        A human-readable error message
    """
    # Handle common LDAP errors
    if isinstance(error, ldap.SERVER_DOWN):
        return "Failed to connect to LDAP server: Server is down or unreachable."
    elif isinstance(error, ldap.TIMEOUT):
        return "Connection timed out."
    elif isinstance(error, ldap.INVALID_CREDENTIALS):
        return "Invalid credentials provided."
    elif isinstance(error, ldap.INSUFFICIENT_ACCESS):
        return "Insufficient access rights."
    elif isinstance(error, ldap.ALREADY_EXISTS):
        return "Entry already exists."
    elif isinstance(error, ldap.NO_SUCH_OBJECT):
        return "Entry does not exist."
    elif isinstance(error, ldap.BUSY):
        return "Server is busy."
    elif isinstance(error, ldap.UNAVAILABLE):
        return "Service is unavailable."
    elif isinstance(error, ldap.OPERATIONS_ERROR):
        return "Operations error occurred."
    elif isinstance(error, ldap.FILTER_ERROR):
        return "Invalid filter syntax."
    elif isinstance(error, ldap.CONNECT_ERROR):
        return "Connection error occurred."
    elif isinstance(error, ldap.STRONG_AUTH_REQUIRED):
        return "Strong authentication required."

    # Extract error details for network errors
    try:
        error_dict = error.args[0]
        if isinstance(error_dict, dict):
            error_dict.get("errno", 0)
            code = error_dict.get("desc", "Unknown")
            hostname = error_dict.get("info", "Unknown hostname")

            # Generic error mapper based on error code
            if code == "Connect error":
                return f"Failed to connect to {hostname}."
            elif code == "Timed out":
                return "Connection timed out."
            else:
                return f"LDAP error: {code} ({hostname})"
    except (IndexError, AttributeError, TypeError):
        pass

    # Fallback error message
    return f"LDAP error: {str(error)}"


# Map of LDAP status text to error messages
LDAP_STATUS_MAPPER = {
    LDAPStatusText.ENOTFOUND: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.ETIMEDOUT: lambda: "Connection timed out.",
    LDAPStatusText.ECONNRESET: lambda: "Connection aborted.",
    LDAPStatusText.ECONNREFUSED: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.ERRADDRINUSE: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EADDRNOTAVAIL: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.ECONNABORTED: lambda: "Connection aborted.",
    LDAPStatusText.EHOSTUNREACH: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EACCES: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EAI_AGAIN: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EEXIST: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EISDIR: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.EPERM: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.ENOENT: lambda hostname: f"Failed to connect to {hostname}.",
    LDAPStatusText.ENOTDIR: lambda hostname: f"Failed to connect to {hostname}.",
}
