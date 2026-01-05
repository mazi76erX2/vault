from __future__ import annotations

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
    docid: int
    severitylevels: str | None = None
    summary: str
    comment: str


class RejectRequest(BaseModel):
    docid: int
    comment: str
    summary: str
    reviewer: str | None = None
    severitylevels: str | None = None
