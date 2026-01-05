from datetime import datetime

from pydantic import UUID4, BaseModel


class SessionBase(BaseModel):
    user_id: UUID4
    status: str | None = "Not Started"


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    status: str | None = None
    password_changed: bool | None = None


class SessionResponse(SessionBase):
    id: UUID4
    password_changed: bool
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuestionCreate(BaseModel):
    question_text: str
    session_id: UUID4 | None = None


class QuestionResponse(BaseModel):
    id: UUID4
    question_text: str
    user_id: UUID4
    session_id: UUID4 | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
