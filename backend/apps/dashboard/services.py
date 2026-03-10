from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date
from apps.heritage.models import Heritage
from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.complaints.models import Complaint
from apps.feedbacks.models import Feedback
from auth.models import Tourist, Guide


def get_guide_dashboard(db: Session, guide_id: str):
    # Get guide's heritage IDs
    heritage_ids = db.query(Heritage.id).filter(Heritage.guide_id == guide_id).all()
    heritage_ids = [h[0] for h in heritage_ids]

    # Total bookings
    total_bookings = db.query(func.count(Booking.id)).filter(
        Booking.heritage_id.in_(heritage_ids)
    ).scalar() or 0

    # Today bookings
    today_bookings = db.query(func.count(Booking.id)).filter(
        and_(
            Booking.heritage_id.in_(heritage_ids),
            Booking.visit_date == date.today()
        )
    ).scalar() or 0

    # Upcoming bookings
    upcoming_bookings = db.query(func.count(Booking.id)).filter(
        and_(
            Booking.heritage_id.in_(heritage_ids),
            Booking.visit_date > date.today(),
            Booking.status != "cancelled"
        )
    ).scalar() or 0

    # Pending complaints
    pending_complaints = db.query(func.count(Complaint.id)).filter(
        and_(
            Complaint.heritage_id.in_(heritage_ids),
            Complaint.status == "open"
        )
    ).scalar() or 0

    # Average rating
    average_rating = db.query(func.avg(Feedback.rating)).filter(
        and_(
            Feedback.heritage_id.in_(heritage_ids),
            Feedback.is_visible == True
        )
    ).scalar()

    # Total revenue
    booking_ids = db.query(Booking.id).filter(Booking.heritage_id.in_(heritage_ids)).all()
    booking_ids = [b[0] for b in booking_ids]
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        and_(
            Payment.booking_id.in_(booking_ids),
            Payment.status == "paid"
        )
    ).scalar() or 0

    return {
        "total_bookings": total_bookings,
        "today_bookings": today_bookings,
        "upcoming_bookings": upcoming_bookings,
        "pending_complaints": pending_complaints,
        "average_rating": float(average_rating) if average_rating else None,
        "total_revenue": float(total_revenue)
    }


def get_admin_dashboard(db: Session):
    total_tourists = db.query(func.count(Tourist.id)).scalar() or 0
    total_guides = db.query(func.count(Guide.id)).scalar() or 0
    total_heritage = db.query(func.count(Heritage.id)).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    
    pending_complaints = db.query(func.count(Complaint.id)).filter(
        Complaint.status == "open"
    ).scalar() or 0
    
    pending_feedbacks = db.query(func.count(Feedback.id)).filter(
        Feedback.is_visible == False
    ).scalar() or 0
    
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "paid"
    ).scalar() or 0

    return {
        "total_tourists": total_tourists,
        "total_guides": total_guides,
        "total_heritage": total_heritage,
        "total_bookings": total_bookings,
        "pending_complaints": pending_complaints,
        "pending_feedbacks": pending_feedbacks,
        "total_revenue": float(total_revenue)
    }


def get_tourist_dashboard(db: Session, tourist_id: str):
    total_bookings = db.query(func.count(Booking.id)).filter(
        Booking.created_by_id == tourist_id
    ).scalar() or 0

    upcoming_bookings = db.query(func.count(Booking.id)).filter(
        and_(
            Booking.created_by_id == tourist_id,
            Booking.visit_date > date.today()
        )
    ).scalar() or 0

    # Last booking status
    last_booking = db.query(Booking).filter(
        Booking.created_by_id == tourist_id
    ).order_by(Booking.created_at.desc()).first()

    last_booking_status = last_booking.status if last_booking else None

    return {
        "total_bookings": total_bookings,
        "upcoming_bookings": upcoming_bookings,
        "last_booking_status": last_booking_status
    }
