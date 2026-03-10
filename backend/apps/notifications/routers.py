from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.notifications import services, schemas

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/tourist", response_model=list[schemas.NotificationResponse])
def get_tourist_notifications(
    reference: str = Query(..., description="Booking reference code (e.g., TRP-ABC123)"),
    db: Session = Depends(get_db)
):
    """
    Get notifications for a tourist by booking reference code.
    Public access - no authentication required.
    """
    try:
        return services.get_tourist_notifications(db, reference)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve notifications: {str(e)}")


@router.get("/guide", response_model=list[schemas.NotificationResponse])
def get_guide_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Get all notifications for the authenticated guide.
    """
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can access guide notifications")
    
    try:
        return services.get_guide_notifications(db, user["user_id"])
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve notifications: {str(e)}")


@router.get("/admin", response_model=list[schemas.NotificationResponse])
def get_admin_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Get all notifications (Admin only).
    """
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can access all notifications")
    
    try:
        return services.get_admin_notifications(db)
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve notifications: {str(e)}")


@router.patch("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Mark notification as read.
    Guide can only mark their own notifications.
    """
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can mark notifications as read")
    
    try:
        return services.mark_notification_read(db, notification_id, user["role"], user.get("user_id"))
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(404, error_msg)
        elif "own notifications" in error_msg.lower():
            raise HTTPException(403, error_msg)
        else:
            raise HTTPException(400, error_msg)
    except Exception as e:
        raise HTTPException(500, f"Failed to mark notification as read: {str(e)}")
