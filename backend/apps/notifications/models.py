import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_role = Column(String(20), nullable=False)  # tourist | guide | admin
    recipient_id = Column(UUID(as_uuid=True), nullable=True)  # NULL for tourist
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # booking | payment | event | complaint | system
    related_id = Column(UUID(as_uuid=True), nullable=True)  # booking_id / event_id / payment_id
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
