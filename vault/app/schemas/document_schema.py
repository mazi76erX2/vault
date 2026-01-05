from pydantic import BaseModel

from app.models.document_model import StatusEnum


# Base schema for a document (shared fields for all models)
class DocumentBase(BaseModel):
    summary: str | None = None
    tags: str | None = None
    employee_contact: str | None = None
    link: str | None = None
    title: str | None = None
    responsible: str | None = None
    level: int | None = None
    status: StatusEnum = StatusEnum.PENDING  # Default to "PENDING"
    reviewer: str | None = None
    comment: str | None = None
    company_id: str | None = None  # Add company_id for multi-tenancy

    class Config:
        orm_mode = True  # Tells Pydantic to treat ORM objects like dictionaries


# Schema for creating a new document
class DocumentCreate(DocumentBase):
    pass  # You can add validation or specific fields if needed


# Schema for updating an existing document
class DocumentUpdate(DocumentBase):
    # All fields are optional for partial updates
    summary: str | None = None
    tags: str | None = None
    employee_contact: str | None = None
    link: str | None = None
    title: str | None = None
    responsible: str | None = None
    level: int | None = None
    status: StatusEnum | None = None
    reviewer: str | None = None
    comment: str | None = None


# Schema for reading a document (including doc_id)
class DocumentResponse(DocumentBase):
    doc_id: int  # Document ID is returned in the response
    status: StatusEnum  # Ensure the status is included

    class DocumentResponseConfig:
        orm_mode = True  # Ensure ORM compatibility (i.e., SQLAlchemy models)
