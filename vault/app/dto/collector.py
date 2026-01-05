from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    user_id: str
    full_name: str
    years_of_experience: str
    field_of_expertise: str
    department: str


class CollectorSummaryUpdateSummaryRequest(BaseModel):
    user_id: str
    session_id: int
    summary_text: str


class CollectorSummaryContinueRequest(BaseModel):
    session_id: int
    summary_text: str
    is_resume: bool


class CollectorSummaryContinueResponse(BaseModel):
    message: str
    next_page: str
    state: dict


class StartChatRequest(BaseModel):
    id: int
    question: str
    topic: str
