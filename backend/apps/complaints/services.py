from sqlalchemy.orm import Session
from uuid import UUID
from apps.complaints.models import Complaint
from apps.bookings.models import Booking
from apps.heritage.models import Heritage


def create_complaint(db: Session, data, tourist_id: UUID = None):
    """
    Create complaint - Guest (reference_code) or Logged-in tourist (tourist_id).
    
    Validates:
    - Either tourist_id OR reference_code must be present
    - If reference_code provided, booking must exist
    """
    # Validate that either tourist_id or reference_code is present
    if not tourist_id and not data.reference_code:
        raise ValueError("Either login or provide a booking reference code")
    
    # If reference_code provided, validate booking exists
    if data.reference_code:
        booking = db.query(Booking).filter(
            Booking.reference_code.ilike(data.reference_code)
        ).first()
        if not booking:
            raise ValueError("Invalid booking reference code")
    
    complaint = Complaint(
        reference_code=data.reference_code,
        tourist_id=tourist_id,
        heritage_id=data.heritage_id,
        event_id=data.event_id,
        booking_id=data.booking_id,
        subject=data.subject,
        description=data.description,
        status="open",
        created_by_role="tourist"
    )
    
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


def track_complaint(db: Session, reference_code: str):
    """Track complaint by reference code (guest tourists)"""
    complaint = db.query(Complaint).filter(
        Complaint.reference_code.ilike(reference_code)
    ).first()
    
    if not complaint:
        raise ValueError("Complaint not found")
    
    return complaint


def get_tourist_complaints(db: Session, tourist_id: UUID):
    """Get complaints created by a specific logged-in tourist"""
    return db.query(Complaint).filter(
        Complaint.tourist_id == tourist_id
    ).order_by(Complaint.created_at.desc()).all()


def get_guide_complaints(db: Session, guide_id: UUID):
    """Get complaints related to guide's heritage"""
    return (
        db.query(Complaint)
        .join(Heritage, Complaint.heritage_id == Heritage.id)
        .filter(Heritage.guide_id == guide_id)
        .order_by(Complaint.created_at.desc())
        .all()
    )


def get_all_complaints(db: Session):
    """Get all complaints (Admin only)"""
    return db.query(Complaint).order_by(Complaint.created_at.desc()).all()


def update_complaint_status(db: Session, complaint_id: UUID, status: str):
    """Update complaint status (Admin only)"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise ValueError("Complaint not found")
    
    complaint.status = status
    db.commit()
    db.refresh(complaint)
    return complaint


def add_admin_reply(db: Session, complaint_id: UUID, reply: str):
    """Add admin reply to complaint (Admin only)"""
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    
    if not complaint:
        raise ValueError("Complaint not found")
    
    complaint.admin_reply = reply
    db.commit()
    db.refresh(complaint)
    return complaint
