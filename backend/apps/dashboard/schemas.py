from pydantic import BaseModel
from typing import Optional


class GuideDashboardResponse(BaseModel):
    total_bookings: int
    today_bookings: int
    upcoming_bookings: int
    pending_complaints: int
    average_rating: Optional[float]
    total_revenue: float


class AdminDashboardResponse(BaseModel):
    total_tourists: int
    total_guides: int
    total_heritage: int
    total_bookings: int
    pending_complaints: int
    pending_feedbacks: int
    total_revenue: float


class TouristDashboardResponse(BaseModel):
    total_bookings: int
    upcoming_bookings: int
    last_booking_status: Optional[str]
