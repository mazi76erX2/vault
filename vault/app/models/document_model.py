from enum import Enum


class StatusEnum(str, Enum):
    DRAFT = "Draft"
    PENDING = "Pending"
    ON_REVIEW = "On Review"
    REJECTED = "Rejected"
    VALIDATED_STORED = "Validated - Stored"
    VALIDATED_AWAITING_APPROVAL = "Validated - Awaiting Approval"
