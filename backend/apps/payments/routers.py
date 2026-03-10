from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.payments import services, schemas

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=schemas.PaymentResponse, status_code=201)
def create_payment(
    data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Create payment for a booking.
    Guide or Admin can create payments.
    """
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can create payments")
    
    try:
        return services.create_payment(db, data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create payment: {str(e)}")


@router.get("/booking/{booking_id}", response_model=schemas.PaymentStatusResponse | None)
def get_payment_status(booking_id: UUID, db: Session = Depends(get_db)):
    """
    Get payment status by booking ID.
    Public access - no authentication required.
    """
    try:
        return services.get_payment_by_booking(db, booking_id)
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve payment: {str(e)}")


@router.get("/", response_model=list[schemas.PaymentResponse])
def list_all_payments(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Get all payments (Admin only).
    """
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can view all payments")
    
    try:
        return services.get_all_payments(db)
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve payments: {str(e)}")


@router.patch("/{payment_id}/mark-paid", response_model=schemas.PaymentResponse)
def mark_as_paid(
    payment_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Mark payment as paid.
    - Guide: Can mark for their own heritage bookings
    - Admin: Can mark any payment
    """
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can mark payments as paid")
    
    try:
        return services.mark_payment_paid(db, payment_id, user["role"], user.get("user_id"))
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(404, error_msg)
        elif "own heritage" in error_msg.lower():
            raise HTTPException(403, error_msg)
        else:
            raise HTTPException(400, error_msg)
    except Exception as e:
        raise HTTPException(500, f"Failed to mark payment as paid: {str(e)}")


@router.patch("/{payment_id}/mark-failed", response_model=schemas.PaymentResponse)
def mark_as_failed(
    payment_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Mark payment as failed (Admin only).
    """
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can mark payments as failed")
    
    try:
        return services.mark_payment_failed(db, payment_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(404, str(e))
        else:
            raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to mark payment as failed: {str(e)}")
