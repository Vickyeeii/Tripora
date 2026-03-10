from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Literal


class NotificationResponse(BaseModel):
    id: UUID
    recipient_role: str
    recipient_id: Optional[UUID]
    title: str
    message: str
    type: str
    related_id: Optional[UUID]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    recipient_role: Literal["tourist", "guide", "admin"]
    recipient_id: Optional[UUID] = None
    title: str
    message: str
    type: Literal["booking", "payment", "event", "complaint", "system"]
    related_id: Optional[UUID] = None
