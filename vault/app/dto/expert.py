from typing import Optional

from pydantic import BaseModel


class Document(BaseModel):
    id: int
    title: str
    author: str
    status: str

class DocumentRow(BaseModel):
    id: int
    title: str
    reviewer: str
    status: str

class AcceptDocumentRequest(BaseModel):
    doc_id: int
    severity_levels: str | None = None
    summary: str
    comment: str

class RejectRequest(BaseModel):
    doc_id: int
    comment: str
    summary: str
    reviewer: Optional[str] = None
    severity_levels: Optional[str] = None