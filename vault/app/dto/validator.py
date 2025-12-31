from pydantic import BaseModel


class RejectDocumentRequest(BaseModel):
    docid: int
    comment: str
    summary: str
    reviewer: str | None = None
    severitylevels: str | None = None


class AcceptDocumentRequest(BaseModel):
    docid: int
    comment: str | None = None
    summary: str | None = None
    status: str | None = None
    severitylevels: str | None = None


class DelegateRequest(BaseModel):
    docid: int
    comment: str
    summary: str
    delegatorid: str
    assigneeid: str
    status: str | None = None
    severitylevels: str | None = None


class DocumentFetchRequest(BaseModel):
    documentid: int | str
