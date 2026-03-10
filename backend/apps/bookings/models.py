import uuid
from sqlalchemy import Column, String, Integer, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference_code = Column(String(20), unique=True, nullable=False)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="CASCADE"), nullable=False)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=True)

    visitor_name = Column(String(150), nullable=False)
    visitor_phone = Column(String(20), nullable=False)
    visitor_email = Column(String(150), nullable=True)
    visit_date = Column(Date, nullable=False)
    visit_time = Column(Time, nullable=True)
    people_count = Column(Integer, nullable=False)

    created_by_role = Column(String(20), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
