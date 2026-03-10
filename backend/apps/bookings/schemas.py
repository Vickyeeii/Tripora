from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import date, time, datetime
from typing import Optional


class BookingCreate(BaseModel):
    heritage_id: UUID
    event_id: Optional[UUID] = None
    visitor_name: str
    visitor_phone: str
    visitor_email: Optional[str] = None
    visit_date: date
    visit_time: Optional[time] = None
    people_count: int
    notes: Optional[str] = None

    @field_validator('people_count')
    @classmethod
    def validate_people_count(cls, v):
        if v < 1:
            raise ValueError('people_count must be at least 1')
        return v


class BookingResponse(BaseModel):
    id: UUID
    reference_code: str
    heritage_id: UUID
    event_id: Optional[UUID] = None
    visitor_name: str
    visitor_phone: str
    visitor_email: Optional[str] = None
    visit_date: date
    visit_time: Optional[time] = None
    people_count: int
    created_by_role: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BookingTrackingResponse(BaseModel):
    reference_code: str
    status: str
    heritage_id: UUID
    event_id: Optional[UUID] = None
    visit_date: date
    visit_time: Optional[time] = None
    people_count: int

    class Config:
        from_attributes = True
