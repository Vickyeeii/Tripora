from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal


class ComplaintCreate(BaseModel):
    reference_code: Optional[str] = None  # For guest tourists
    heritage_id: Optional[UUID] = None
    event_id: Optional[UUID] = None
    booking_id: Optional[UUID] = None
    subject: str
    description: str

    @field_validator('subject')
    @classmethod
    def validate_subject(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('Subject must be at least 5 characters')
        return v.strip()

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Description must be at least 10 characters')
        return v.strip()


class ComplaintResponse(BaseModel):
    id: UUID
    reference_code: Optional[str]
    tourist_id: Optional[UUID]
    heritage_id: Optional[UUID]
    event_id: Optional[UUID]
    booking_id: Optional[UUID]
    subject: str
    description: str
    status: str
    admin_reply: Optional[str]
    created_by_role: str
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintUpdateStatus(BaseModel):
    status: Literal["open", "in_progress", "resolved", "closed"]


class ComplaintReply(BaseModel):
    admin_reply: str

    @field_validator('admin_reply')
    @classmethod
    def validate_reply(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Reply must be at least 10 characters')
        return v.strip()
