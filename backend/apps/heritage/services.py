from sqlalchemy.orm import Session, joinedload
from uuid import UUID
import qrcode, io, base64

from apps.heritage.models import Heritage, HeritagePhoto, SafetyRule, HeritageQR
from middleware.config import QR_BASE_URL


def create_heritage(db: Session, guide_id: UUID, data):
    heritage = Heritage(
        guide_id=guide_id,
        name=data.name,
        description=data.description,
        location_map=data.location_map,
        short_description=data.short_description,
        historical_overview=data.historical_overview,
        cultural_significance=data.cultural_significance,
        best_time_to_visit=data.best_time_to_visit,
        is_active=False  # Requires admin approval
    )
    db.add(heritage)
    db.commit()
    db.refresh(heritage)
    return heritage


def update_heritage(db: Session, heritage_id: UUID, guide_id: UUID, data):
    heritage = db.query(Heritage).options(
        joinedload(Heritage.photos),
        joinedload(Heritage.safety_rules),
        joinedload(Heritage.qr_code),
    ).filter(
        Heritage.id == heritage_id,
        Heritage.guide_id == guide_id,
        Heritage.is_deleted == False
    ).first()

    if not heritage:
        raise ValueError("Heritage not found")

    heritage.name = data.name
    heritage.description = data.description
    heritage.location_map = data.location_map
    heritage.short_description = data.short_description
    heritage.historical_overview = data.historical_overview
    heritage.cultural_significance = data.cultural_significance
    heritage.best_time_to_visit = data.best_time_to_visit

    db.commit()
    db.refresh(heritage)
    return heritage


def toggle_heritage_status(db: Session, heritage_id: UUID, is_active: bool):
    """Toggle heritage active status (approve/disable)"""
    heritage = db.query(Heritage).options(
        joinedload(Heritage.photos),
        joinedload(Heritage.safety_rules),
        joinedload(Heritage.qr_code),
    ).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    heritage.is_active = is_active
    db.commit()
    db.refresh(heritage)
    return heritage


def add_photo(db: Session, heritage_id: UUID, image_url: str):
    # Verify heritage exists and is not deleted
    heritage = db.query(Heritage).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    photo = HeritagePhoto(heritage_id=heritage_id, image_url=image_url)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def delete_photo(db: Session, heritage_id: UUID, photo_id: UUID, guide_id: UUID):
    """Delete photo from heritage (guide must own heritage)"""
    # Verify heritage exists and guide owns it
    heritage = db.query(Heritage).filter(
        Heritage.id == heritage_id,
        Heritage.guide_id == guide_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found or access denied")
    
    # Find and delete photo
    photo = db.query(HeritagePhoto).filter(
        HeritagePhoto.id == photo_id,
        HeritagePhoto.heritage_id == heritage_id
    ).first()
    
    if not photo:
        raise ValueError("Photo not found")
    
    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted successfully"}


def add_rule(db: Session, heritage_id: UUID, rule_text: str):
    # Verify heritage exists and is not deleted
    heritage = db.query(Heritage).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    rule = SafetyRule(heritage_id=heritage_id, rule_text=rule_text)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def generate_qr(db: Session, heritage_id: UUID):
    # Verify heritage exists and is not deleted
    heritage = db.query(Heritage).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    # Check if QR already exists
    existing_qr = db.query(HeritageQR).filter(
        HeritageQR.heritage_id == heritage_id
    ).first()
    
    if existing_qr:
        return existing_qr
    
    qr_data = f"{QR_BASE_URL}/heritage/{heritage_id}"
    img = qrcode.make(qr_data)

    buf = io.BytesIO()
    img.save(buf)
    qr_base64 = base64.b64encode(buf.getvalue()).decode()

    qr = HeritageQR(heritage_id=heritage_id, qr_value=qr_base64)
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


def list_heritage(db: Session, user_role: str = None, user_id: UUID = None):
    """
    List heritage sites based on user role.
    
    - Public: Only active and not deleted
    - Guide: Own heritage (all statuses)
    - Admin: All heritage (including inactive and deleted)
    """
    query = db.query(Heritage).options(
        joinedload(Heritage.photos),
        joinedload(Heritage.safety_rules),
        joinedload(Heritage.qr_code),
    )
    
    # Normalize role to lowercase for comparison
    role = user_role.lower() if user_role else None
    
    if role == "admin":
        # Admin sees everything
        return query.all()
    elif role == "guide" and user_id:
        # Guide sees ONLY own heritage (all statuses)
        return query.filter(Heritage.guide_id == user_id).all()
    else:
        # Public sees only active and not deleted
        return query.filter(
            Heritage.is_active == True,
            Heritage.is_deleted == False
        ).all()



def get_heritage_by_id(db: Session, heritage_id: UUID, user_role: str = None, user_id: UUID = None):
    """
    Get single heritage by ID with role-based access control.
    
    - Public: Only active and not deleted
    - Guide: Own heritage regardless of status
    - Admin: Any heritage
    """
    heritage = db.query(Heritage).options(
        joinedload(Heritage.photos),
        joinedload(Heritage.safety_rules),
        joinedload(Heritage.qr_code),
    ).filter(Heritage.id == heritage_id).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    # Normalize role to lowercase for comparison
    role = user_role.lower() if user_role else None
    
    # Check access based on role
    if role == "admin":
        # Admin can view any heritage
        return heritage
    elif role == "guide" and heritage.guide_id == user_id:
        # Guide can view own heritage
        return heritage
    elif heritage.is_deleted:
        # Deleted heritage not available to public
        raise ValueError("Heritage not available")
    elif not heritage.is_active:
        # Inactive heritage shows coming soon message
        raise ValueError("Heritage awaiting approval")
    
    # Public can view active and not deleted
    return heritage


def soft_delete_heritage(db: Session, heritage_id: UUID):
    """Soft delete heritage by setting is_deleted = True"""
    heritage = db.query(Heritage).options(
        joinedload(Heritage.photos),
        joinedload(Heritage.safety_rules),
        joinedload(Heritage.qr_code),
    ).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    heritage.is_deleted = True
    db.commit()
    db.refresh(heritage)
    return heritage



def validate_guide_heritage_access(db: Session, heritage_id: UUID, guide_id: UUID):
    """
    Validate that a guide can access/use a heritage for operations like creating events.
    
    Checks:
    - Heritage exists
    - Heritage is not deleted (is_deleted = False)
    - Heritage is approved by admin (is_active = True)
    - Guide owns the heritage (guide_id matches)
    
    Note: Heritage approval is controlled via is_active flag.
          There is no separate approved column.
    
    Raises:
    - ValueError with specific message for each validation failure
    
    Returns:
    - Heritage object if all validations pass
    """
    heritage = db.query(Heritage).filter(
        Heritage.id == heritage_id,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found")
    
    if heritage.guide_id != guide_id:
        raise ValueError("You can only create events for your own heritage")
    
    # Heritage approval is controlled via is_active flag
    if not heritage.is_active:
        raise ValueError("Heritage is not approved yet")
    
    return heritage
