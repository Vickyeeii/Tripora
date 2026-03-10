from pydantic import BaseModel, EmailStr
from uuid import UUID



class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    role: str
    user_id: UUID

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TouristSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    country: str
    preferred_language: str


class GuideSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    address: str

class LogoutRequest(BaseModel):
    refresh_token: str
