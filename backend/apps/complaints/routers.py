from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.complaints import services, schemas

router = APIRouter(prefix="/complaints", tags=["Complaints"])


# PUBLIC ENDPOINTS

@router.post("/", response_model=schemas.ComplaintResponse, status_code=201)
def create_complaint(
    data: schemas.ComplaintCreate,
    db: Session = Depends(get_db)
):
    """Create complaint (Guest or Logged-in tourist - no auth required for guest)"""
    try:
        return services.create_complaint(db, data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create complaint: {str(e)}")


@router.get("/track", response_model=schemas.ComplaintResponse)
def track_complaint(
    reference: str = Query(..., description="Booking reference code"),
    db: Session = Depends(get_db)
):
    """Track complaint by reference code (Guest tourists)"""
    try:
        return services.track_complaint(db, reference)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to track complaint: {str(e)}")


# TOURIST ENDPOINTS

@router.post("/tourist", response_model=schemas.ComplaintResponse, status_code=201)
def create_complaint_tourist(
    data: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Create complaint (Logged-in tourist)"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can create complaints")
    
    try:
        return services.create_complaint(db, data, tourist_id=user["user_id"])
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create complaint: {str(e)}")


@router.get("/my", response_model=list[schemas.ComplaintResponse])
def get_my_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get logged-in tourist's complaints"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can access this endpoint")
    
    return services.get_tourist_complaints(db, user["user_id"])


# GUIDE ENDPOINTS

@router.get("/guide/my-heritage", response_model=list[schemas.ComplaintResponse])
def get_guide_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get complaints related to guide's heritage"""
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can access this endpoint")
    
    return services.get_guide_complaints(db, user["user_id"])


# ADMIN ENDPOINTS

@router.get("/", response_model=list[schemas.ComplaintResponse])
def get_all_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all complaints (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can view all complaints")
    
    return services.get_all_complaints(db)


@router.patch("/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_complaint_status(
    complaint_id: UUID,
    data: schemas.ComplaintUpdateStatus,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update complaint status (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can update complaint status")
    
    try:
        return services.update_complaint_status(db, complaint_id, data.status)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to update status: {str(e)}")


@router.patch("/{complaint_id}/reply", response_model=schemas.ComplaintResponse)
def add_admin_reply(
    complaint_id: UUID,
    data: schemas.ComplaintReply,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Add admin reply to complaint (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can reply to complaints")
    
    try:
        return services.add_admin_reply(db, complaint_id, data.admin_reply)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to add reply: {str(e)}")
