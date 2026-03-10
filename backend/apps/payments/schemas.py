from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime
from typing import Literal


class PaymentCreate(BaseModel):
    booking_id: UUID
    amount: int
    payment_method: Literal["UPI", "CASH", "CARD"]

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    amount: int
    payment_method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentStatusResponse(BaseModel):
    """Public response - minimal info for tourists"""
    id: UUID
    booking_id: UUID
    status: str
    amount: int
    payment_method: str

    class Config:
        from_attributes = True
