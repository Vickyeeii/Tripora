from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class HeritageCreate(BaseModel):
    name: str
    description: str
    location_map: str
    short_description: Optional[str] = None
    historical_overview: Optional[str] = None
    cultural_significance: Optional[str] = None
    best_time_to_visit: Optional[str] = None


class HeritageUpdate(BaseModel):
    name: str
    description: str
    location_map: str
    short_description: Optional[str] = None
    historical_overview: Optional[str] = None
    cultural_significance: Optional[str] = None
    best_time_to_visit: Optional[str] = None


class PhotoCreate(BaseModel):
    image_url: str


class SafetyRuleCreate(BaseModel):
    rule_text: str


# ---------- RESPONSE MODELS ----------

class HeritagePhotoResponse(BaseModel):
    id: UUID
    image_url: str

    class Config:
        from_attributes = True


class SafetyRuleResponse(BaseModel):
    id: UUID
    rule_text: str

    class Config:
        from_attributes = True


class HeritageQRResponse(BaseModel):
    qr_value: str

    class Config:
        from_attributes = True


class HeritageResponse(BaseModel):
    id: UUID
    guide_id: UUID
    name: str
    description: str
    location_map: str
    short_description: Optional[str] = None
    historical_overview: Optional[str] = None
    cultural_significance: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    is_active: bool
    is_deleted: bool
    created_at: datetime

    photos: List[HeritagePhotoResponse] = []
    safety_rules: List[SafetyRuleResponse] = []
    qr_code: Optional[HeritageQRResponse] = None

    class Config:
        from_attributes = True