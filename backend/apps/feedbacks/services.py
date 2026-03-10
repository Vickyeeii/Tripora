from sqlalchemy.orm import Session
from uuid import UUID
from apps.feedbacks.models import Feedback
from apps.bookings.models import Booking


def create_feedback_guest(db: Session, data):
    """
    Create feedback using reference code (guest tourist).
    
    Validates:
    - Booking exists with reference code
    - Booking is confirmed
    - No duplicate feedback for this booking
    """
    # Find booking by reference code
    booking = db.query(Booking).filter(
        Booking.reference_code.ilike(data.reference_code)
    ).first()
    
    if not booking:
        raise ValueError("Invalid booking reference code")
    
    if booking.status not in ["confirmed", "completed"]:
        raise ValueError("Feedback can only be submitted for confirmed bookings")
    
    # Check for duplicate feedback
    existing = db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
    if existing:
        raise ValueError("Feedback already submitted for this booking")
    
    feedback = Feedback(
        booking_id=booking.id,
        tourist_id=None,
        reference_code=data.reference_code,
        heritage_id=data.heritage_id,
        event_id=data.event_id,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        is_visible=True
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def create_feedback_tourist(db: Session, data, tourist_id: UUID):
    """
    Create feedback for logged-in tourist.
    
    Validates:
    - Booking exists
    - Booking belongs to tourist
    - Booking is confirmed
    - No duplicate feedback
    """
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    if booking.created_by_id != tourist_id:
        raise ValueError("You can only submit feedback for your own bookings")
    
    if booking.status not in ["confirmed", "completed"]:
        raise ValueError("Feedback can only be submitted for confirmed bookings")
    
    # Check for duplicate feedback
    existing = db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
    if existing:
        raise ValueError("Feedback already submitted for this booking")
    
    feedback = Feedback(
        booking_id=booking.id,
        tourist_id=tourist_id,
        reference_code=booking.reference_code,
        heritage_id=data.heritage_id,
        event_id=data.event_id,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        is_visible=True
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def get_feedbacks_by_heritage(db: Session, heritage_id: UUID):
    """Get visible feedbacks for a heritage site (public)"""
    return db.query(Feedback).filter(
        Feedback.heritage_id == heritage_id,
        Feedback.is_visible == True
    ).order_by(Feedback.created_at.desc()).all()


def get_feedbacks_by_event(db: Session, event_id: UUID):
    """Get visible feedbacks for an event (public)"""
    return db.query(Feedback).filter(
        Feedback.event_id == event_id,
        Feedback.is_visible == True
    ).order_by(Feedback.created_at.desc()).all()


def get_my_feedbacks(db: Session, tourist_id: UUID):
    """Get feedbacks submitted by a specific tourist"""
    return db.query(Feedback).filter(
        Feedback.tourist_id == tourist_id
    ).order_by(Feedback.created_at.desc()).all()


def get_all_feedbacks(db: Session):
    """Get all feedbacks (Admin only)"""
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


def approve_feedback(db: Session, feedback_id: UUID):
    """Approve feedback - make it visible (Admin only)"""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    
    if not feedback:
        raise ValueError("Feedback not found")
    
    feedback.is_visible = True
    db.commit()
    db.refresh(feedback)
    return feedback


def hide_feedback(db: Session, feedback_id: UUID):
    """Hide feedback - make it invisible (Admin only)"""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    
    if not feedback:
        raise ValueError("Feedback not found")
    
    feedback.is_visible = False
    db.commit()
    db.refresh(feedback)
    return feedback
