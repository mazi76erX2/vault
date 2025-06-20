from typing import Optional, Union

from pydantic import BaseModel


class RejectDocumentRequest(BaseModel):
    doc_id: int
    comment: str
    summary: str
    reviewer: Optional[str]
    severity_levels: Optional[str] = None


class AcceptDocumentRequest(BaseModel):
    doc_id: int
    comment: Optional[str] = None
    summary: Optional[str] = None
    status: Optional[str] = None
    severity_levels: Optional[str] = None


class DelegateRequest(BaseModel):
    doc_id: int
    comment: str
    summary: str
    delegator_id: str
    severity_level: str | None = None


class DocumentFetchRequest(BaseModel):
    document_id: Union[int, str]
