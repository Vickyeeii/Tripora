from sqlalchemy.orm import Session
from uuid import UUID
import secrets
import string
from apps.bookings.models import Booking
from apps.heritage.models import Heritage
from apps.events.models import Event
from apps.notifications.services import create_notification


def generate_reference_code(db: Session) -> str:
    """Generate unique reference code: TRP-XXXXXX"""
    while True:
        code = 'TRP-' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        existing = db.query(Booking).filter(Booking.reference_code == code).first()
        if not existing:
            return code


def create_booking(db: Session, data, created_by_role: str, created_by_id: UUID = None):
    """
    Create booking - Tourist (no auth) or Guide (for own heritage).
    
    Validates:
    - Heritage exists, is_active=True, is_deleted=False
    - If event_id provided: event exists, belongs to heritage, is_active, not deleted
    - Guide can only create for own heritage
    """
    # Validate heritage
    heritage = db.query(Heritage).filter(
        Heritage.id == data.heritage_id,
        Heritage.is_active == True,
        Heritage.is_deleted == False
    ).first()
    
    if not heritage:
        raise ValueError("Heritage not found or not available for booking")
    
    # Guide can only create bookings for own heritage
    if created_by_role == "guide" and heritage.guide_id != created_by_id:
        raise ValueError("You can only create bookings for your own heritage")
    
    # Validate event if provided
    if data.event_id:
        event = db.query(Event).filter(
            Event.id == data.event_id,
            Event.is_active == True,
            Event.is_deleted == False
        ).first()
        
        if not event:
            raise ValueError("Event not found or not available")
        
        if event.heritage_id != data.heritage_id:
            raise ValueError("Event does not belong to the specified heritage")
    
    booking = Booking(
        reference_code=generate_reference_code(db),
        heritage_id=data.heritage_id,
        event_id=data.event_id,
        visitor_name=data.visitor_name,
        visitor_phone=data.visitor_phone,
        visitor_email=data.visitor_email,
        visit_date=data.visit_date,
        visit_time=data.visit_time,
        people_count=data.people_count,
        notes=data.notes,
        created_by_role=created_by_role,
        created_by_id=created_by_id,
        status="pending"
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Create guide notification
    create_notification(
        db=db,
        recipient_role="guide",
        recipient_id=heritage.guide_id,
        title="New Booking Received",
        message=f"New booking {booking.reference_code} for {heritage.name} on {booking.visit_date}. Visitor: {booking.visitor_name}",
        type="booking",
        related_id=booking.id
    )
    
    # Create tourist notification
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Booking Created",
        message=f"Your booking {booking.reference_code} has been created successfully. Please wait for confirmation.",
        type="booking",
        related_id=booking.id
    )
    
    return booking


def get_guide_bookings(db: Session, guide_id: UUID):
    """Get all bookings for guide's heritage"""
    return (
        db.query(Booking)
        .join(Heritage, Booking.heritage_id == Heritage.id)
        .filter(
            Heritage.guide_id == guide_id,
            Heritage.is_deleted == False
        )
        .all()
    )


def get_all_bookings(db: Session):
    """Get all bookings (Admin only)"""
    return db.query(Booking).all()


def get_tourist_bookings(db: Session, tourist_id: UUID):
    """Get bookings created by a specific tourist"""
    return db.query(Booking).filter(
        Booking.created_by_role == "tourist",
        Booking.created_by_id == tourist_id
    ).order_by(Booking.created_at.desc()).all()


def confirm_booking(db: Session, booking_id: UUID, user_role: str, user_id: UUID = None):
    """
    Confirm booking.
    - Guide: Can confirm bookings for own heritage
    - Admin: Can confirm any booking
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    # Guide can only confirm bookings for own heritage
    if user_role == "guide":
        heritage = db.query(Heritage).filter(
            Heritage.id == booking.heritage_id,
            Heritage.guide_id == user_id
        ).first()
        
        if not heritage:
            raise ValueError("You can only confirm bookings for your own heritage")
    
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    
    # Get heritage for guide notification
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
    
    # Create tourist notification
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Booking Confirmed",
        message=f"Your booking {booking.reference_code} has been confirmed. See you on {booking.visit_date}!",
        type="booking",
        related_id=booking.id
    )
    
    # Create guide notification
    if heritage:
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Booking Confirmed",
            message=f"Booking {booking.reference_code} has been confirmed.",
            type="booking",
            related_id=booking.id
        )
    
    return booking


def cancel_booking(db: Session, booking_id: UUID, user_role: str, user_id: UUID = None):
    """
    Cancel booking.
    - Guide: Can cancel bookings for own heritage
    - Admin: Can cancel any booking
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    # Guide can only cancel bookings for own heritage
    if user_role == "guide":
        heritage = db.query(Heritage).filter(
            Heritage.id == booking.heritage_id,
            Heritage.guide_id == user_id
        ).first()
        
        if not heritage:
            raise ValueError("You can only cancel bookings for your own heritage")
    
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    
    # Get heritage for guide notification
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
    
    # Create tourist notification
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Booking Cancelled",
        message=f"Your booking {booking.reference_code} has been cancelled.",
        type="booking",
        related_id=booking.id
    )
    
    # Create guide notification
    if heritage:
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Booking Cancelled",
            message=f"Booking {booking.reference_code} has been cancelled.",
            type="booking",
            related_id=booking.id
        )
    
    return booking


def track_booking(db: Session, reference_code: str):
    """Track booking by reference code (case-insensitive)"""
    booking = db.query(Booking).filter(
        Booking.reference_code.ilike(reference_code)
    ).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    return booking
