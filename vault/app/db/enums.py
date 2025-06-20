import enum


class SecurityLevelEnum(str, enum.Enum):
    PUBLIC = "Public"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class StatusEnum(str, enum.Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    ON_REVIEW = "On Review"
    REJECTED = "Rejected"
    VALIDATED_STORED = "Validated - Stored"
    VALIDATED_AWAITING_APPROVAL = "Validated - Awaiting Approval"


class SessionStatusEnum(str, enum.Enum):
    NOT_STARTED = "Not Started"
    STARTED = "Started"
    COMPLETED = "Completed"


class DocumentStatusEnum(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class UserAccessLevelsEnum(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    GUEST = "guest"


class DepartmentEnum(str, enum.Enum):
    AI_CC = "AI CC"
    PLANNING = "Planning"
    ANALYTICS = "Analytics"
    HR = "HR"
    DATA_CLOUD = "Data & Cloud"
    SALES = "Sales"
    MARKETING = "Marketing"


class LdapConnectorStatusEnum(str, enum.Enum):
    INACTIVE = "inactive"
    ACTIVE = "active"
    SYNCING = "syncing"
    FAILED = "failed"
    COMPLETE = "complete"
