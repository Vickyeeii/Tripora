# Notification Integration Examples

## How to Use Notifications in Other Modules

### Import the Helper Function
```python
from apps.notifications.services import create_notification
```

---

## Booking Module Integration

### File: `apps/bookings/services.py`

#### 1. When Booking is Created
```python
def create_booking(db: Session, data, created_by_role: str, created_by_id: UUID = None):
    # ... existing booking creation code ...
    
    booking = Booking(...)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Get heritage details
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
    
    # Notify guide about new booking
    create_notification(
        db=db,
        recipient_role="guide",
        recipient_id=heritage.guide_id,
        title="New Booking Received",
        message=f"New booking for {heritage.name} on {booking.visit_date}. Visitor: {booking.visitor_name}",
        type="booking",
        related_id=booking.id
    )
    
    # Notify tourist about booking creation
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,  # NULL for tourist
        title="Booking Created Successfully",
        message=f"Your booking {booking.reference_code} has been created. Please wait for confirmation.",
        type="booking",
        related_id=booking.id
    )
    
    return booking
```

#### 2. When Booking is Confirmed
```python
def confirm_booking(db: Session, booking_id: UUID, user_role: str, user_id: UUID = None):
    # ... existing confirmation code ...
    
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    
    # Notify tourist about confirmation
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Booking Confirmed",
        message=f"Your booking {booking.reference_code} has been confirmed by the guide. See you on {booking.visit_date}!",
        type="booking",
        related_id=booking.id
    )
    
    return booking
```

#### 3. When Booking is Cancelled
```python
def cancel_booking(db: Session, booking_id: UUID, user_role: str, user_id: UUID = None):
    # ... existing cancellation code ...
    
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    
    # Notify tourist about cancellation
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Booking Cancelled",
        message=f"Your booking {booking.reference_code} has been cancelled.",
        type="booking",
        related_id=booking.id
    )
    
    # Notify guide if cancelled by tourist
    if user_role == "tourist":
        heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
        create_notification(
            db=db,
            recipient_role="guide",
            recipient_id=heritage.guide_id,
            title="Booking Cancelled",
            message=f"Booking {booking.reference_code} has been cancelled by the visitor.",
            type="booking",
            related_id=booking.id
        )
    
    return booking
```

---

## Payment Module Integration

### File: `apps/payments/services.py`

#### 1. When Payment is Created
```python
def create_payment(db: Session, data):
    # ... existing payment creation code ...
    
    payment = Payment(...)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Get booking details
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    
    # Notify tourist about payment
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Payment Pending",
        message=f"Payment of ₹{payment.amount/100:.2f} is pending for booking {booking.reference_code}.",
        type="payment",
        related_id=payment.id
    )
    
    return payment
```

#### 2. When Payment is Marked as Paid
```python
def mark_payment_paid(db: Session, payment_id: UUID, user_role: str, user_id: UUID = None):
    # ... existing payment update code ...
    
    payment.status = "paid"
    db.commit()
    db.refresh(payment)
    
    # Get booking and heritage details
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    heritage = db.query(Heritage).filter(Heritage.id == booking.heritage_id).first()
    
    # Notify tourist about payment confirmation
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Payment Confirmed",
        message=f"Your payment of ₹{payment.amount/100:.2f} for booking {booking.reference_code} has been confirmed.",
        type="payment",
        related_id=payment.id
    )
    
    # Notify guide about payment received
    create_notification(
        db=db,
        recipient_role="guide",
        recipient_id=heritage.guide_id,
        title="Payment Received",
        message=f"Payment of ₹{payment.amount/100:.2f} received for booking {booking.reference_code}.",
        type="payment",
        related_id=payment.id
    )
    
    return payment
```

#### 3. When Payment Fails
```python
def mark_payment_failed(db: Session, payment_id: UUID):
    # ... existing payment update code ...
    
    payment.status = "failed"
    db.commit()
    db.refresh(payment)
    
    # Get booking details
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    
    # Notify tourist about payment failure
    create_notification(
        db=db,
        recipient_role="tourist",
        recipient_id=None,
        title="Payment Failed",
        message=f"Payment for booking {booking.reference_code} has failed. Please try again.",
        type="payment",
        related_id=payment.id
    )
    
    return payment
```

---

## Event Module Integration

### File: `apps/events/services.py`

#### 1. When Event is Created
```python
def create_event(db: Session, guide_id: UUID, data):
    # ... existing event creation code ...
    
    event = Event(...)
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # Get heritage details
    heritage = db.query(Heritage).filter(Heritage.id == event.heritage_id).first()
    
    # Notify admin about new event
    create_notification(
        db=db,
        recipient_role="admin",
        recipient_id=None,  # Can be specific admin UUID if needed
        title="New Event Created",
        message=f"New event '{event.name}' created at {heritage.name} on {event.event_date}.",
        type="event",
        related_id=event.id
    )
    
    return event
```

#### 2. When Event is Updated
```python
def update_event(db: Session, event_id: UUID, guide_id: UUID, data):
    # ... existing event update code ...
    
    event.name = data.name
    # ... other updates ...
    db.commit()
    db.refresh(event)
    
    # Notify tourists who have bookings for this event
    bookings = db.query(Booking).filter(Booking.event_id == event_id).all()
    
    for booking in bookings:
        create_notification(
            db=db,
            recipient_role="tourist",
            recipient_id=None,
            title="Event Updated",
            message=f"Event '{event.name}' details have been updated. Check your booking {booking.reference_code} for details.",
            type="event",
            related_id=event.id
        )
    
    return event
```

---

## Heritage Module Integration

### File: `apps/heritage/services.py`

#### When Heritage is Approved
```python
def approve_heritage(db: Session, heritage_id: UUID):
    # ... existing approval code ...
    
    heritage.is_active = True
    db.commit()
    db.refresh(heritage)
    
    # Notify guide about approval
    create_notification(
        db=db,
        recipient_role="guide",
        recipient_id=heritage.guide_id,
        title="Heritage Site Approved",
        message=f"Your heritage site '{heritage.name}' has been approved and is now live!",
        type="system",
        related_id=heritage.id
    )
    
    return heritage
```

---

## Testing Notifications

### Create Test Notifications
```python
# In Python shell or test script
from middleware.db import get_db_session
from apps.notifications.services import create_notification
import uuid

db = get_db_session()

# Test guide notification
create_notification(
    db=db,
    recipient_role="guide",
    recipient_id=uuid.UUID("your-guide-uuid"),
    title="Test Notification",
    message="This is a test notification for guide.",
    type="system",
    related_id=None
)

# Test tourist notification (linked to booking)
create_notification(
    db=db,
    recipient_role="tourist",
    recipient_id=None,
    title="Test Tourist Notification",
    message="This is a test notification for tourist.",
    type="booking",
    related_id=uuid.UUID("your-booking-uuid")
)

db.close()
```

### Retrieve Notifications
```bash
# Tourist (using booking reference)
curl "http://localhost:8000/notifications/tourist?reference=TRP-ABC123"

# Guide (with auth)
curl http://localhost:8000/notifications/guide \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN"

# Admin (with auth)
curl http://localhost:8000/notifications/admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Best Practices

1. **Always create notifications in the same transaction**
   - Add notification creation after db.commit() but before return
   - This ensures data consistency

2. **Use descriptive titles and messages**
   - Title: Short, action-oriented (e.g., "Booking Confirmed")
   - Message: Include relevant details (reference codes, dates, names)

3. **Set appropriate notification types**
   - booking: Booking-related events
   - payment: Payment-related events
   - event: Event-related updates
   - complaint: Complaint-related (future)
   - system: System/admin notifications

4. **Link notifications to entities**
   - Always set related_id when possible
   - This allows future features like "view related item"

5. **Tourist notifications**
   - Always use recipient_id=None for tourists
   - Always set related_id to booking_id
   - Tourists retrieve via booking reference code

---

## Summary

The notification system is designed to be:
- ✅ Easy to integrate (single function call)
- ✅ Flexible (works with any module)
- ✅ Role-aware (tourist, guide, admin)
- ✅ Database-driven (no external dependencies)
- ✅ MVP-ready (simple and explainable)

Just import create_notification and call it after important events!
