import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from middleware.db import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    event_type = Column(String(50), nullable=False)  # festival, ritual, notice, alert

    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)

    created_by_role = Column(String(20), nullable=False)  # admin, guide
    created_by_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    heritage = relationship("Heritage", back_populates="events")
