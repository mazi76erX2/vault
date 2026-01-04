from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class User(BaseModel):
    id: str
    username: str
    email: str
    firstname: str = ""
    lastname: str = ""


class LoginResponse(BaseModel):
    user: User
    token: str
    refresh_token: str
