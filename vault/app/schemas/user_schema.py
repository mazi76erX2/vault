from pydantic import BaseModel, EmailStr


# Define the User Schema Base Model (for common fields)
class UserBase(BaseModel):
    username: str
    name: str | None = None
    email: EmailStr
    current_position: str | None = None
    expertise_domain: str | None = None
    experience_years: int | None = None
    severity_level: int | None = None
    roles: list[str] = []  # Roles as a list of strings, as stored in a comma-separated string

    # This will allow you to convert the SQLAlchemy model to a Pydantic model
    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str  # Required to create a new user


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool = True

    class UserResponseConfig:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = None
    current_position: str | None = None
    expertise_domain: str | None = None
    experience_years: int | None = None
    severity_level: int | None = None
    roles: list[str] | None = None  # If roles need to be updated
    is_active: bool | None = None
