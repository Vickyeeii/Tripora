from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional


class FeedbackCreateGuest(BaseModel):
    reference_code: str
    heritage_id: UUID
    event_id: Optional[UUID] = None
    rating: int
    title: str
    comment: str

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('Title must be at least 5 characters')
        return v.strip()

    @field_validator('comment')
    @classmethod
    def validate_comment(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Comment must be at least 10 characters')
        return v.strip()


class FeedbackCreateTourist(BaseModel):
    booking_id: UUID
    heritage_id: UUID
    event_id: Optional[UUID] = None
    rating: int
    title: str
    comment: str

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or len(v.strip()) < 5:
            raise ValueError('Title must be at least 5 characters')
        return v.strip()

    @field_validator('comment')
    @classmethod
    def validate_comment(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Comment must be at least 10 characters')
        return v.strip()


class FeedbackResponse(BaseModel):
    id: UUID
    booking_id: UUID
    heritage_id: UUID
    event_id: Optional[UUID]
    rating: int
    title: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackAdminResponse(BaseModel):
    id: UUID
    booking_id: UUID
    tourist_id: Optional[UUID]
    reference_code: Optional[str]
    heritage_id: UUID
    event_id: Optional[UUID]
    rating: int
    title: str
    comment: str
    is_visible: bool
    created_at: datetime

    class Config:
        from_attributes = True
