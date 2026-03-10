import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference_code = Column(String(20), nullable=True)  # For guest tourists
    tourist_id = Column(UUID(as_uuid=True), nullable=True)  # For logged-in tourists
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="SET NULL"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    subject = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open")  # open | in_progress | resolved | closed
    admin_reply = Column(Text, nullable=True)
    created_by_role = Column(String(20), nullable=False)  # tourist
    created_at = Column(DateTime, default=datetime.utcnow)
