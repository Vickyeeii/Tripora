from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.feedbacks import services, schemas

router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])


# PUBLIC ENDPOINTS

@router.get("/heritage/{heritage_id}", response_model=list[schemas.FeedbackResponse])
def get_heritage_feedbacks(
    heritage_id: UUID,
    db: Session = Depends(get_db)
):
    """Get visible feedbacks for a heritage site (Public)"""
    return services.get_feedbacks_by_heritage(db, heritage_id)


@router.get("/event/{event_id}", response_model=list[schemas.FeedbackResponse])
def get_event_feedbacks(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get visible feedbacks for an event (Public)"""
    return services.get_feedbacks_by_event(db, event_id)


# GUEST TOURIST ENDPOINTS

@router.post("/", response_model=schemas.FeedbackResponse, status_code=201)
def create_feedback_guest(
    data: schemas.FeedbackCreateGuest,
    db: Session = Depends(get_db)
):
    """Create feedback using reference code (Guest tourist - no auth)"""
    try:
        return services.create_feedback_guest(db, data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create feedback: {str(e)}")


# LOGGED-IN TOURIST ENDPOINTS

@router.post("/tourist", response_model=schemas.FeedbackResponse, status_code=201)
def create_feedback_tourist(
    data: schemas.FeedbackCreateTourist,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Create feedback (Logged-in tourist)"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can submit feedback")
    
    try:
        return services.create_feedback_tourist(db, data, user["user_id"])
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to create feedback: {str(e)}")


@router.get("/my", response_model=list[schemas.FeedbackAdminResponse])
def get_my_feedbacks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get logged-in tourist's feedbacks"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can access this endpoint")
    
    return services.get_my_feedbacks(db, user["user_id"])


# ADMIN ENDPOINTS

@router.get("/", response_model=list[schemas.FeedbackAdminResponse])
def get_all_feedbacks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get all feedbacks (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can view all feedbacks")
    
    return services.get_all_feedbacks(db)


@router.patch("/{feedback_id}/approve", response_model=schemas.FeedbackAdminResponse)
def approve_feedback(
    feedback_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Approve feedback - make it visible (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can approve feedbacks")
    
    try:
        return services.approve_feedback(db, feedback_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to approve feedback: {str(e)}")


@router.patch("/{feedback_id}/hide", response_model=schemas.FeedbackAdminResponse)
def hide_feedback(
    feedback_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Hide feedback - make it invisible (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can hide feedbacks")
    
    try:
        return services.hide_feedback(db, feedback_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to hide feedback: {str(e)}")
