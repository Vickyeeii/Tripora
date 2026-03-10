from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class PendingGuideResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: str | None
    address: str
    created_at: datetime

    class Config:
        from_attributes = True

class GuideApprovalRequest(BaseModel):
    approve: bool


class TouristProfileResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str]
    country: str
    preferred_language: str
    created_at: datetime

    class Config:
        from_attributes = True


class GuideProfileResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str]
    address: str
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TouristProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class GuideProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
