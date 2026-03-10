from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.dashboard import services, schemas

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/guide", response_model=schemas.GuideDashboardResponse)
def get_guide_dashboard(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Guide dashboard analytics (Guide only)"""
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can access guide dashboard")
    
    try:
        return services.get_guide_dashboard(db, user["user_id"])
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch guide dashboard: {str(e)}")


@router.get("/admin", response_model=schemas.AdminDashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Admin dashboard analytics (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can access admin dashboard")
    
    try:
        return services.get_admin_dashboard(db)
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch admin dashboard: {str(e)}")


@router.get("/tourist", response_model=schemas.TouristDashboardResponse)
def get_tourist_dashboard(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Tourist dashboard analytics (Tourist only)"""
    if user["role"] != "tourist":
        raise HTTPException(403, "Only tourists can access tourist dashboard")
    
    try:
        return services.get_tourist_dashboard(db, user["user_id"])
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch tourist dashboard: {str(e)}")
