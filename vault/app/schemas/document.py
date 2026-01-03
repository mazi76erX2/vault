from datetime import datetime

from pydantic import UUID4, BaseModel


class DocumentBase(BaseModel):
    title: str
    content: str
    severity_levels: str | None = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    summary: str | None = None
    status: str | None = None
    severity_levels: str | None = None

class DocumentResponse(DocumentBase):
    doc_id: UUID4
    status: str | None = None
    summary: str | None = None
    reviewer: UUID4 | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}

class DocumentWithSimilarity(DocumentResponse):
    """Document with similarity score from vector search"""
    similarity_score: float
    distance: float
