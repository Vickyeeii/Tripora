from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.bookings import services, schemas

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# PUBLIC ENDPOINTS

@router.get("/track", response_model=schemas.BookingTrackingResponse)
def track_booking(
    reference: str,
    db: Session = Depends(get_db)
):
    """Track booking by reference code (Public - no auth)"""
    try:
        return services.track_booking(db, reference)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to track booking: {str(e)}")

@router.post("/", response_model=schemas.BookingResponse, status_code=201)
def create_booking_public(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db)
):
    """Create booking (Tourist - no auth required)"""
    try:
        return services.create_booking(db, data, created_by_role="tourist")
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create booking: {str(e)}")


@router.post("/tourist", response_model=schemas.BookingResponse, status_code=201)
def create_booking_tourist(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Create booking (Logged-in tourist)"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can use this endpoint")
    
    try:
        return services.create_booking(
            db, data,
            created_by_role="tourist",
            created_by_id=user["user_id"]
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create booking: {str(e)}")


# GUIDE ENDPOINTS

@router.post("/guide", response_model=schemas.BookingResponse, status_code=201)
def create_booking_guide(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Create booking (Guide assisted)"""
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can use this endpoint")
    
    try:
        return services.create_booking(
            db, data, 
            created_by_role="guide", 
            created_by_id=user["user_id"]
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create booking: {str(e)}")


@router.get("/my-heritage", response_model=list[schemas.BookingResponse])
def get_my_heritage_bookings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get bookings for guide's heritage"""
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can access this endpoint")
    
    return services.get_guide_bookings(db, user["user_id"])


@router.patch("/{booking_id}/confirm", response_model=schemas.BookingResponse)
def confirm_booking_guide(
    booking_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Confirm booking (Guide/Admin)"""
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can confirm bookings")
    
    try:
        return services.confirm_booking(db, booking_id, user["role"], user["user_id"])
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to confirm booking: {str(e)}")


@router.patch("/{booking_id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking_guide(
    booking_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Cancel booking (Guide/Admin)"""
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can cancel bookings")
    
    try:
        return services.cancel_booking(db, booking_id, user["role"], user["user_id"])
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to cancel booking: {str(e)}")


# ADMIN ENDPOINTS

@router.get("/", response_model=list[schemas.BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all bookings (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can view all bookings")
    
    return services.get_all_bookings(db)


# TOURIST ENDPOINTS

@router.get("/tourist/my-bookings", response_model=list[schemas.BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get tourist's own booking history (Registered tourist only)"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can access this endpoint")
    
    return services.get_tourist_bookings(db, user["user_id"])
