import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"), unique=True, nullable=False)
    tourist_id = Column(UUID(as_uuid=True), nullable=True)
    reference_code = Column(String(20), nullable=True)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="SET NULL"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(150), nullable=False)
    comment = Column(Text, nullable=False)
    is_visible = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
