import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    amount = Column(Integer, nullable=False)  # Amount in smallest currency unit (e.g., paise)
    payment_method = Column(String(20), nullable=False)  # UPI | CASH | CARD
    status = Column(String(20), nullable=False, default="pending")  # pending | paid | failed
    created_at = Column(DateTime, default=datetime.utcnow)
