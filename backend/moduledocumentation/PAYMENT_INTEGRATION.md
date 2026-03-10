# Payment Module - Integration Guide

## Overview
This document explains how the Payment module integrates with other Tripora modules.

---

## Module Dependencies

```
Payment Module
    ├── Depends on: Bookings Module (booking_id FK)
    ├── Depends on: Heritage Module (permission checks)
    └── Depends on: Auth Module (JWT authentication)
```

---

## Integration with Bookings Module

### Database Relationship
```sql
payments.booking_id → bookings.id (CASCADE DELETE)
```

### Service Layer Integration
```python
# In payments/services.py
from apps.bookings.models import Booking

# Validates booking exists before creating payment
booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
if not booking:
    raise ValueError("Booking not found")
```

### Cascade Behavior
- When a booking is deleted → associated payment is automatically deleted
- When booking status = "cancelled" → cannot create/update payment

---

## Integration with Heritage Module

### Permission Validation
```python
# In payments/services.py
from apps.heritage.models import Heritage

# Guide can only mark payments for own heritage
heritage = db.query(Heritage).filter(
    Heritage.id == booking.heritage_id,
    Heritage.guide_id == user_id
).first()

if not heritage:
    raise ValueError("You can only mark payments for your own heritage bookings")
```

### Data Flow
```
Heritage (guide_id) ← Booking (heritage_id) ← Payment (booking_id)
```

---

## Integration with Auth Module

### JWT Authentication
```python
# In payments/routers.py
from middleware.auth_utils import get_current_user

@router.patch("/{payment_id}/mark-paid")
def mark_as_paid(
    payment_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)  # JWT validation
):
    # user = {"user_id": "uuid", "role": "guide"}
    ...
```

### Role-Based Access
- Tourist: No auth required for viewing status
- Guide: JWT required for create/mark-paid
- Admin: JWT required for all operations

---

## Complete User Flow Example

### Scenario: Tourist Books Heritage Visit and Pays

#### Step 1: Tourist Creates Booking (No Auth)
```
POST /bookings/
{
  "heritage_id": "heritage-uuid",
  "visitor_name": "John Doe",
  "visitor_phone": "+919876543210",
  "visit_date": "2025-12-31",
  "people_count": 2
}

Response: { "id": "booking-uuid", "reference_code": "TRP-ABC123", ... }
```

#### Step 2: Guide Creates Payment Record
```
POST /payments/
Authorization: Bearer <guide-jwt>
{
  "booking_id": "booking-uuid",
  "amount": 50000,
  "payment_method": "UPI"
}

Response: { "id": "payment-uuid", "status": "pending", ... }
```

#### Step 3: Tourist Checks Payment Status (No Auth)
```
GET /payments/booking/booking-uuid

Response: { "status": "pending", "amount": 50000, ... }
```

#### Step 4: Tourist Pays at Heritage Site
```
[Tourist pays ₹500 in cash to guide]
```

#### Step 5: Guide Marks Payment as Paid
```
PATCH /payments/payment-uuid/mark-paid
Authorization: Bearer <guide-jwt>

Response: { "status": "paid", ... }
```

#### Step 6: Tourist Verifies Payment (No Auth)
```
GET /payments/booking/booking-uuid

Response: { "status": "paid", "amount": 50000, ... }
```

---

## Database Query Examples

### Get Payment with Booking Details
```sql
SELECT 
    p.id AS payment_id,
    p.amount,
    p.payment_method,
    p.status,
    b.reference_code,
    b.visitor_name,
    b.visit_date
FROM payments p
JOIN bookings b ON p.booking_id = b.id;
```

### Get Payment with Heritage Details
```sql
SELECT 
    p.id AS payment_id,
    p.amount,
    p.status,
    h.name AS heritage_name,
    h.guide_id
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN heritage h ON b.heritage_id = h.id;
```

### Get All Payments for a Guide's Heritage
```sql
SELECT 
    p.*,
    b.reference_code,
    h.name AS heritage_name
FROM payments p
JOIN bookings b ON p.booking_id = b.id
JOIN heritage h ON b.heritage_id = h.id
WHERE h.guide_id = 'guide-uuid';
```

---

## Error Handling Across Modules

### Booking Not Found
```
POST /payments/
{ "booking_id": "invalid-uuid", ... }

→ 400 Bad Request: "Booking not found"
```

### Booking Cancelled
```
POST /payments/
{ "booking_id": "cancelled-booking-uuid", ... }

→ 400 Bad Request: "Cannot create payment for cancelled booking"
```

### Guide Permission Denied
```
PATCH /payments/payment-uuid/mark-paid
Authorization: Bearer <guide-b-jwt>

[Payment belongs to Guide A's heritage]

→ 403 Forbidden: "You can only mark payments for your own heritage bookings"
```

---

## Frontend Integration Points

### React Component Example
```jsx
// Check payment status (public)
const checkPaymentStatus = async (bookingId) => {
  const response = await fetch(
    `${API_URL}/payments/booking/${bookingId}`
  );
  const data = await response.json();
  return data; // { status: "pending", amount: 50000, ... }
};

// Mark payment as paid (guide)
const markPaymentPaid = async (paymentId, token) => {
  const response = await fetch(
    `${API_URL}/payments/${paymentId}/mark-paid`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

---

## API Response Consistency

All payment endpoints follow the same error format:

```json
{
  "detail": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid state)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Server Error

---

## Testing Integration

### Test 1: End-to-End Flow
```python
# 1. Create booking
booking = create_booking(heritage_id, visitor_data)

# 2. Create payment
payment = create_payment(booking.id, amount=50000)

# 3. Check status (public)
status = get_payment_status(booking.id)
assert status["status"] == "pending"

# 4. Mark as paid (guide)
updated = mark_payment_paid(payment.id, guide_token)
assert updated["status"] == "paid"

# 5. Verify status changed
status = get_payment_status(booking.id)
assert status["status"] == "paid"
```

### Test 2: Permission Validation
```python
# Guide A creates payment for own heritage
payment = create_payment(booking_a.id, guide_a_token)

# Guide B tries to mark it as paid
try:
    mark_payment_paid(payment.id, guide_b_token)
    assert False, "Should have raised 403"
except HTTPException as e:
    assert e.status_code == 403
```

---

## Future Integration Possibilities

### With Feedback Module
- Link payment status to feedback eligibility
- Only allow feedback after payment is marked as paid

### With Analytics Module
- Track payment methods popularity
- Calculate revenue per heritage site
- Monitor payment success rates

### With Notification Module
- Send SMS/email when payment status changes
- Notify guide when payment is created
- Remind tourist of pending payments

---

## Summary

The Payment module integrates seamlessly with:
- ✅ Bookings (FK relationship, validation)
- ✅ Heritage (permission checks)
- ✅ Auth (JWT, role-based access)

All integrations follow the same patterns used in other Tripora modules, ensuring consistency and maintainability.
