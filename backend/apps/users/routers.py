from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from apps.users.schemas import (
    PendingGuideResponse,
    GuideApprovalRequest,
    TouristProfileResponse,
    GuideProfileResponse,
    TouristProfileUpdate,
    GuideProfileUpdate
)
from apps.users.services import (
    get_pending_guides,
    update_guide_approval,
    get_tourist_profile,
    get_guide_profile,
    update_tourist_profile,
    update_guide_profile
)
from auth.dependencies import get_current_admin


#router setup
router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

#view pending guides
@router.get(
    "/guides/pending",
    response_model=list[PendingGuideResponse]
)
def view_pending_guides(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    return get_pending_guides(db)


#approve/reject guide
@router.put("/guides/{guide_id}/approval")
def approve_or_reject_guide(
    guide_id: UUID,
    request: GuideApprovalRequest,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    update_guide_approval(
        db=db,
        guide_id=guide_id,
        admin_id=admin.id,
        approve=request.approve
    )

    return {"message": "Guide approval status updated"}


# PROFILE ENDPOINTS

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Get current user's profile (Tourist or Guide)"""
    if user["role"] == "tourist":
        profile = get_tourist_profile(db, user["user_id"])
        return TouristProfileResponse.model_validate(profile)
    elif user["role"] == "guide":
        profile = get_guide_profile(db, user["user_id"])
        return GuideProfileResponse.model_validate(profile)
    else:
        raise HTTPException(403, "Profile access not available for this role")


@router.put("/me")
def update_my_profile(
    data: TouristProfileUpdate | GuideProfileUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update current user's profile (Tourist or Guide)"""
    if user["role"] == "tourist":
        profile = update_tourist_profile(db, user["user_id"], data)
        return TouristProfileResponse.model_validate(profile)
    elif user["role"] == "guide":
        profile = update_guide_profile(db, user["user_id"], data)
        return GuideProfileResponse.model_validate(profile)
    else:
        raise HTTPException(403, "Profile update not available for this role")





