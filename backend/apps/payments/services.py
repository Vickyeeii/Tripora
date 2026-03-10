from sqlalchemy.orm import Session
from uuid import UUID
from apps.payments.models import Payment
from apps.bookings.models import Booking
from apps.heritage.models import Heritage
from apps.notifications.services import create_notification


def create_payment(db: Session, data):
    """
    Create payment for a booking.
    
    Validates:
    - Booking exists and is not cancelled
    - No existing payment for this booking
    """
    # Validate booking
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    
    if not booking:
        raise ValueError("Booking not found")
    
    if booking.status == "cancelled":
        raise ValueError("Cannot create payment for cancelled booking")
    
    # Check if payment already exists
    existing = db.query(Payment).filter(Payment.booking_id == data.booking_id).first()
    if existing:
        raise ValueError("Payment already exists for this booking")
    
    payment = Payment(
        booking_id=data.booking_id,
        amount=data.amount,
        payment_method=data.payment_method,
        status="pending"
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Get heritage for guide notification
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
    
    # Create tourist notification
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Payment Initiated",
        message=f"Payment of ₹{payment.amount:.2f} is pending for booking {booking.reference_code}.",
        type="payment",
        related_id=payment.id
    )
    
    # Create guide notification
    if heritage:
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Payment Initiated",
            message=f"Payment of ₹{payment.amount:.2f} initiated for booking {booking.reference_code}.",
            type="payment",
            related_id=payment.id
        )
    
    return payment


def get_payment_by_booking(db: Session, booking_id: UUID):
    """Get payment status by booking ID (public access)"""
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    
    if not payment:
        return None
    
    return payment


def get_all_payments(db: Session):
    """Get all payments (Admin only)"""
    return db.query(Payment).all()


def mark_payment_paid(db: Session, payment_id: UUID, user_role: str, user_id: UUID = None):
    """
    Mark payment as paid.
    
    - Guide: Can mark paid for bookings of their own heritage
    - Admin: Can mark any payment as paid
    
    Validates:
    - Payment exists
    - Payment is not already paid
    - Booking is not cancelled
    - Guide owns the heritage (if guide)
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise ValueError("Payment not found")
    
    if payment.status == "paid":
        raise ValueError("Payment is already marked as paid")
    
    # Get booking
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    
    if not booking:
        raise ValueError("Associated booking not found")
    
    if booking.status == "cancelled":
        raise ValueError("Cannot mark payment as paid for cancelled booking")
    
    # Guide can only mark payments for own heritage
    if user_role == "guide":
        heritage = db.query(Heritage).filter(
            Heritage.id == booking.heritage_id,
            Heritage.guide_id == user_id
        ).first()
        
        if not heritage:
            raise ValueError("You can only mark payments for your own heritage bookings")
    
    payment.status = "paid"
    db.commit()
    db.refresh(payment)
    
    # Get booking and heritage for notifications
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first() if booking else None
    
    # Create tourist notification
    if booking:
        create_notification(
            db=db,
            recipient_role="tourist",
            recipient_id=None,
            title="Payment Completed",
            message=f"Your payment of ₹{payment.amount:.2f} for booking {booking.reference_code} has been confirmed.",
            type="payment",
            related_id=payment.id
        )
    
    # Create guide notification
    if heritage:
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Payment Completed",
            message=f"Payment of ₹{payment.amount:.2f} received for booking {booking.reference_code}.",
            type="payment",
            related_id=payment.id
        )
    
    return payment


def mark_payment_failed(db: Session, payment_id: UUID):
    """
    Mark payment as failed (Admin only).
    
    Validates:
    - Payment exists
    - Payment is not already paid
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise ValueError("Payment not found")
    
    if payment.status == "paid":
        raise ValueError("Cannot mark paid payment as failed")
    
    payment.status = "failed"
    db.commit()
    db.refresh(payment)
    
    # Get booking and heritage for notifications
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first() if booking else None
    
    # Create tourist notification
    if booking:
        create_notification(
            db=db,
            recipient_role="tourist",
            recipient_id=None,
            title="Payment Failed",
            message=f"Payment for booking {booking.reference_code} has failed. Please try again.",
            type="payment",
            related_id=payment.id
        )
    
    # Create guide notification
    if heritage:
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Payment Failed",
            message=f"Payment for booking {booking.reference_code} has failed.",
            type="payment",
            related_id=payment.id
        )
    
    return payment
