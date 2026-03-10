# Payment Module - API Testing Examples

## Prerequisites
1. Backend server running: `uvicorn main:app --reload`
2. Database migrations applied: `alembic upgrade head`
3. Test users created (Admin, Guide, Tourist)
4. At least one booking created

---

## Test Flow

### Step 1: Create a Booking (Tourist - No Auth)
```bash
curl -X POST http://localhost:8000/bookings/ \
  -H "Content-Type: application/json" \
  -d '{
    "heritage_id": "YOUR_HERITAGE_UUID",
    "visitor_name": "John Doe",
    "visitor_phone": "+919876543210",
    "visitor_email": "john@example.com",
    "visit_date": "2025-12-31",
    "people_count": 2
  }'
```

**Save the `booking_id` from response**

---

### Step 2: Create Payment (Guide/Admin - Auth Required)
```bash
curl -X POST http://localhost:8000/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN" \
  -d '{
    "booking_id": "BOOKING_UUID_FROM_STEP_1",
    "amount": 50000,
    "payment_method": "UPI"
  }'
```

**Save the `payment_id` from response**

---

### Step 3: Check Payment Status (Public - No Auth)
```bash
curl -X GET http://localhost:8000/payments/booking/BOOKING_UUID
```

**Expected Response**:
```json
{
  "booking_id": "uuid",
  "status": "pending",
  "amount": 50000,
  "payment_method": "UPI"
}
```

---

### Step 4: Mark Payment as Paid (Guide/Admin)
```bash
curl -X PATCH http://localhost:8000/payments/PAYMENT_UUID/mark-paid \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN"
```

**Expected Response**:
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "UPI",
  "status": "paid",
  "created_at": "2025-12-30T10:00:00"
}
```

---

### Step 5: Verify Status Changed (Public)
```bash
curl -X GET http://localhost:8000/payments/booking/BOOKING_UUID
```

**Expected Response**:
```json
{
  "booking_id": "uuid",
  "status": "paid",
  "amount": 50000,
  "payment_method": "UPI"
}
```

---

### Step 6: List All Payments (Admin Only)
```bash
curl -X GET http://localhost:8000/payments/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Step 7: Mark Payment as Failed (Admin Only)
```bash
curl -X PATCH http://localhost:8000/payments/PAYMENT_UUID/mark-failed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Error Testing

### Test 1: Duplicate Payment
Try creating another payment for the same booking:
```bash
curl -X POST http://localhost:8000/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN" \
  -d '{
    "booking_id": "SAME_BOOKING_UUID",
    "amount": 30000,
    "payment_method": "CASH"
  }'
```

**Expected**: `400 Bad Request` - "Payment already exists for this booking"

---

### Test 2: Guide Accessing Other's Heritage
Guide A tries to mark payment for Guide B's heritage booking:
```bash
curl -X PATCH http://localhost:8000/payments/PAYMENT_UUID/mark-paid \
  -H "Authorization: Bearer GUIDE_A_TOKEN"
```

**Expected**: `403 Forbidden` - "You can only mark payments for your own heritage bookings"

---

### Test 3: Mark Already Paid Payment
Try marking a paid payment again:
```bash
curl -X PATCH http://localhost:8000/payments/PAYMENT_UUID/mark-paid \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN"
```

**Expected**: `400 Bad Request` - "Payment is already marked as paid"

---

### Test 4: Invalid Amount
```bash
curl -X POST http://localhost:8000/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN" \
  -d '{
    "booking_id": "BOOKING_UUID",
    "amount": -100,
    "payment_method": "UPI"
  }'
```

**Expected**: `422 Unprocessable Entity` - Validation error

---

### Test 5: Invalid Payment Method
```bash
curl -X POST http://localhost:8000/payments/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_GUIDE_TOKEN" \
  -d '{
    "booking_id": "BOOKING_UUID",
    "amount": 50000,
    "payment_method": "BITCOIN"
  }'
```

**Expected**: `422 Unprocessable Entity` - Must be UPI, CASH, or CARD

---

## Using Postman/Thunder Client

### Collection Structure
```
Tripora Payments
├── Create Payment (POST)
├── Get Payment Status (GET)
├── List All Payments (GET)
├── Mark as Paid (PATCH)
└── Mark as Failed (PATCH)
```

### Environment Variables
```
base_url: http://localhost:8000
admin_token: <your_admin_jwt>
guide_token: <your_guide_jwt>
booking_id: <test_booking_uuid>
payment_id: <test_payment_uuid>
```

---

## Python Test Script

```python
import requests

BASE_URL = "http://localhost:8000"
GUIDE_TOKEN = "your_guide_token"
ADMIN_TOKEN = "your_admin_token"

# 1. Create Payment
response = requests.post(
    f"{BASE_URL}/payments/",
    headers={"Authorization": f"Bearer {GUIDE_TOKEN}"},
    json={
        "booking_id": "booking_uuid",
        "amount": 50000,
        "payment_method": "UPI"
    }
)
print("Create Payment:", response.status_code, response.json())

# 2. Check Status (Public)
booking_id = "booking_uuid"
response = requests.get(f"{BASE_URL}/payments/booking/{booking_id}")
print("Payment Status:", response.status_code, response.json())

# 3. Mark as Paid
payment_id = "payment_uuid"
response = requests.patch(
    f"{BASE_URL}/payments/{payment_id}/mark-paid",
    headers={"Authorization": f"Bearer {GUIDE_TOKEN}"}
)
print("Mark Paid:", response.status_code, response.json())

# 4. List All (Admin)
response = requests.get(
    f"{BASE_URL}/payments/",
    headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}
)
print("All Payments:", response.status_code, len(response.json()))
```

---

## Expected HTTP Status Codes

| Endpoint | Success | Error Scenarios |
|----------|---------|-----------------|
| POST /payments/ | 201 | 400 (duplicate), 403 (no auth), 404 (booking not found) |
| GET /payments/booking/{id} | 200 | 404 (not found) |
| GET /payments/ | 200 | 403 (not admin) |
| PATCH /payments/{id}/mark-paid | 200 | 400 (already paid), 403 (not authorized), 404 (not found) |
| PATCH /payments/{id}/mark-failed | 200 | 400 (already paid), 403 (not admin), 404 (not found) |

---

## Database Verification

Check payments in database:
```sql
SELECT * FROM payments;
```

Check payment with booking details:
```sql
SELECT 
    p.id,
    p.amount,
    p.payment_method,
    p.status,
    b.reference_code,
    b.visitor_name
FROM payments p
JOIN bookings b ON p.booking_id = b.id;
```

---

## Quick Smoke Test Checklist

- [ ] Create payment for valid booking
- [ ] Check payment status without auth
- [ ] Mark payment as paid (guide)
- [ ] Verify status changed
- [ ] Try duplicate payment (should fail)
- [ ] Try marking paid payment again (should fail)
- [ ] Admin can view all payments
- [ ] Admin can mark as failed
- [ ] Guide cannot access other's heritage payments

---

**All tests passing = Payment module working correctly! ✅**
