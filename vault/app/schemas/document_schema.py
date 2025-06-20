from pydantic import BaseModel
from typing import Optional
from enum import Enum

from app.models.document_model import StatusEnum


# Base schema for a document (shared fields for all models)
class DocumentBase(BaseModel):
    summary: Optional[str] = None
    tags: Optional[str] = None
    employee_contact: Optional[str] = None
    link: Optional[str] = None
    title: Optional[str] = None
    responsible: Optional[str] = None
    level: Optional[int] = None
    status: StatusEnum = StatusEnum.PENDING  # Default to "PENDING"
    reviewer: Optional[str] = None
    comment: Optional[str] = None
    company_id: Optional[str] = None  # Add company_id for multi-tenancy

    class Config:
        orm_mode = True  # Tells Pydantic to treat ORM objects like dictionaries


# Schema for creating a new document
class DocumentCreate(DocumentBase):
    pass  # You can add validation or specific fields if needed


# Schema for updating an existing document
class DocumentUpdate(DocumentBase):
    # All fields are optional for partial updates
    summary: Optional[str] = None
    tags: Optional[str] = None
    employee_contact: Optional[str] = None
    link: Optional[str] = None
    title: Optional[str] = None
    responsible: Optional[str] = None
    level: Optional[int] = None
    status: Optional[StatusEnum] = None
    reviewer: Optional[str] = None
    comment: Optional[str] = None


# Schema for reading a document (including doc_id)
class DocumentResponse(DocumentBase):
    doc_id: int  # Document ID is returned in the response
    status: StatusEnum  # Ensure the status is included

    class DocumentResponseConfig:
        orm_mode = True  # Ensure ORM compatibility (i.e., SQLAlchemy models)
