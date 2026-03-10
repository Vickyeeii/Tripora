from sqlalchemy.orm import Session
from uuid import UUID
from apps.notifications.models import Notification
from apps.bookings.models import Booking


def create_notification(
    db: Session,
    recipient_role: str,
    recipient_id: UUID,
    title: str,
    message: str,
    type: str,
    related_id: UUID = None
):
    """
    Helper function to create notifications from other modules.
    
    Args:
        recipient_role: tourist | guide | admin
        recipient_id: UUID of recipient (NULL for tourist)
        title: Notification title
        message: Notification message
        type: booking | payment | event | complaint | system
        related_id: Related entity ID (booking_id, payment_id, etc.)
    """
    notification = Notification(
        recipient_role=recipient_role,
        recipient_id=recipient_id,
        title=title,
        message=message,
        type=type,
        related_id=related_id,
        is_read=False
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_tourist_notifications(db: Session, reference_code: str):
    """
    Get notifications for a tourist by booking reference code.
    Returns notifications where related_id matches the booking.
    """
    # Find booking by reference code
    booking = db.query(Booking).filter(
        Booking.reference_code.ilike(reference_code)
    ).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    # Get notifications related to this booking
    notifications = db.query(Notification).filter(
        Notification.recipient_role == "tourist",
        Notification.related_id == booking.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications


def get_guide_notifications(db: Session, guide_id: UUID):
    """Get all notifications for a specific guide."""
    return db.query(Notification).filter(
        Notification.recipient_role == "guide",
        Notification.recipient_id == guide_id
    ).order_by(Notification.created_at.desc()).all()


def get_admin_notifications(db: Session):
    """Get all notifications (Admin view)."""
    return db.query(Notification).order_by(
        Notification.created_at.desc()
    ).all()


def mark_notification_read(db: Session, notification_id: UUID, user_role: str, user_id: UUID = None):
    """
    Mark notification as read.
    - Guide can only mark their own notifications
    - Admin can mark any notification
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()
    
    if not notification:
        raise ValueError("Notification not found")
    
    # Guide can only mark their own notifications
    if user_role == "guide":
        if notification.recipient_role != "guide" or notification.recipient_id != user_id:
            raise ValueError("You can only mark your own notifications as read")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
