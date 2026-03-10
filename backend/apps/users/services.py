from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status

from auth.models import Guide, Tourist

#get all pending guides

def get_pending_guides(db: Session):
    return db.query(Guide).filter(Guide.status == False).all()


#approve or reject guide

def update_guide_approval(
    db: Session,
    guide_id: UUID,
    admin_id: UUID,
    approve: bool
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()

    if not guide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guide not found"
        )

    if approve:
        guide.status = True
        guide.approved_by = admin_id
    else:
        guide.status = False
        guide.approved_by = None

    db.commit()
    db.refresh(guide)

    return guide


def get_tourist_profile(db: Session, tourist_id: UUID):
    """Get tourist profile by ID"""
    tourist = db.query(Tourist).filter(Tourist.id == tourist_id).first()
    if not tourist:
        raise HTTPException(404, "Tourist not found")
    return tourist


def get_guide_profile(db: Session, guide_id: UUID):
    """Get guide profile by ID"""
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(404, "Guide not found")
    return guide


def update_tourist_profile(db: Session, tourist_id: UUID, data):
    """Update tourist profile"""
    tourist = db.query(Tourist).filter(Tourist.id == tourist_id).first()
    if not tourist:
        raise HTTPException(404, "Tourist not found")
    
    if data.full_name is not None:
        tourist.full_name = data.full_name
    if data.phone is not None:
        tourist.phone = data.phone
    if data.email is not None:
        # Check if email already exists
        existing = db.query(Tourist).filter(
            Tourist.email == data.email,
            Tourist.id != tourist_id
        ).first()
        if existing:
            raise HTTPException(400, "Email already in use")
        tourist.email = data.email
    
    db.commit()
    db.refresh(tourist)
    return tourist


def update_guide_profile(db: Session, guide_id: UUID, data):
    """Update guide profile"""
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(404, "Guide not found")
    
    if data.full_name is not None:
        guide.full_name = data.full_name
    if data.phone is not None:
        guide.phone = data.phone
    
    db.commit()
    db.refresh(guide)
    return guide


