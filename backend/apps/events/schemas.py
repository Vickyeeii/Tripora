from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import date, time, datetime
from typing import Optional


class EventCreate(BaseModel):
    heritage_id: UUID
    title: str
    description: str
    event_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str

    @field_validator('event_type')
    @classmethod
    def validate_event_type(cls, v):
        allowed = ['festival', 'ritual', 'notice', 'alert']
        if v not in allowed:
            raise ValueError(f'event_type must be one of: {", ".join(allowed)}')
        return v


class EventUpdate(BaseModel):
    title: str
    description: str
    event_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str

    @field_validator('event_type')
    @classmethod
    def validate_event_type(cls, v):
        allowed = ['festival', 'ritual', 'notice', 'alert']
        if v not in allowed:
            raise ValueError(f'event_type must be one of: {", ".join(allowed)}')
        return v




class HeritagePhotoSchema(BaseModel):
    id: UUID
    image_url: str

    class Config:
        from_attributes = True


class HeritageMinimal(BaseModel):
    id: UUID
    name: str
    photos: list[HeritagePhotoSchema] = []

    class Config:
        from_attributes = True

class EventResponse(BaseModel):
    id: UUID
    heritage_id: UUID
    title: str
    description: str
    event_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    event_type: str
    is_active: bool
    created_by_role: str
    created_at: datetime
    heritage: Optional[HeritageMinimal] = None

    class Config:
        from_attributes = True
