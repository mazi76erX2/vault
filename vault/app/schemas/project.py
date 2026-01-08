from datetime import datetime

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    """Base project schema."""

    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    status: str | None = "active"


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""

    manager_id: str | None = None
    company_id: int | None = None


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""

    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None


class ProjectResponse(ProjectBase):
    """Schema for project response."""

    id: str
    manager_id: str
    company_id: int
    company_regno: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=str(obj.id),
            name=obj.name,
            description=obj.description,
            manager_id=str(obj.manager_id),
            company_id=obj.company_id,
            company_regno=obj.company_regno,
            status=obj.status,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )
