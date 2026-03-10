import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from middleware.db import Base


class Heritage(Base):
    __tablename__ = "heritage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    guide_id = Column(UUID(as_uuid=True), ForeignKey("guides.id"), nullable=False)

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    location_map = Column(String, nullable=False)
    
    # Extended content fields
    short_description = Column(Text, nullable=True)
    historical_overview = Column(Text, nullable=True)
    cultural_significance = Column(Text, nullable=True)
    best_time_to_visit = Column(Text, nullable=True)

    is_active = Column(Boolean, default=False, nullable=False)   # admin approval
    is_deleted = Column(Boolean, default=False, nullable=False)  # soft delete

    created_at = Column(DateTime, default=datetime.utcnow)

    photos = relationship("HeritagePhoto", back_populates="heritage", cascade="all, delete")
    safety_rules = relationship("SafetyRule", back_populates="heritage", cascade="all, delete")
    qr_code = relationship("HeritageQR", back_populates="heritage", uselist=False)
    events = relationship("Event", back_populates="heritage", cascade="all, delete")


class HeritagePhoto(Base):
    __tablename__ = "heritage_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="CASCADE"))

    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    heritage = relationship("Heritage", back_populates="photos")


class SafetyRule(Base):
    __tablename__ = "heritage_safety_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="CASCADE"))

    rule_text = Column(Text, nullable=False)

    heritage = relationship("Heritage", back_populates="safety_rules")


class HeritageQR(Base):
    __tablename__ = "heritage_qr"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    heritage_id = Column(UUID(as_uuid=True), ForeignKey("heritage.id", ondelete="CASCADE"), unique=True)

    qr_value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    heritage = relationship("Heritage", back_populates="qr_code")
