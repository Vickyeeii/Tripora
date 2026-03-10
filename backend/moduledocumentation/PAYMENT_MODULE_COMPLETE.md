# Payment Module - Implementation Complete ✅

## Overview
A **MOCK** payment tracking system for the Tripora college project. This module tracks payment status for bookings WITHOUT real payment gateway integration.

**Important**: This is NOT a real payment system. No actual money transfer occurs. Payments are manually marked as paid by authorized users.

---

## Database Schema

### Table: `payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique payment identifier |
| `booking_id` | UUID | FOREIGN KEY → bookings.id, UNIQUE, CASCADE | One payment per booking |
| `amount` | INTEGER | NOT NULL | Amount in smallest currency unit (e.g., paise) |
| `payment_method` | VARCHAR(20) | NOT NULL | Payment method: UPI \| CASH \| CARD |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Status: pending \| paid \| failed |
| `created_at` | TIMESTAMP | DEFAULT now() | Payment record creation time |

**Key Constraints**:
- One payment per booking (UNIQUE constraint on `booking_id`)
- Cascade delete when booking is deleted
- No hard deletes

---

## API Endpoints

### 1. Create Payment
**POST** `/payments/`

**Auth**: Guide or Admin only

**Request Body**:
```json
{
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "UPI"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "UPI",
  "status": "pending",
  "created_at": "2025-12-30T10:00:00"
}
```

**Validations**:
- Booking must exist and not be cancelled
- No duplicate payment for same booking
- Amount must be > 0

---

### 2. Get Payment Status (Public)
**GET** `/payments/booking/{booking_id}`

**Auth**: None (Public access)

**Response**: `200 OK`
```json
{
  "booking_id": "uuid",
  "status": "pending",
  "amount": 50000,
  "payment_method": "UPI"
}
```

**Use Case**: Tourists can check payment status without logging in.

---

### 3. List All Payments (Admin)
**GET** `/payments/`

**Auth**: Admin only

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "amount": 50000,
    "payment_method": "UPI",
    "status": "paid",
    "created_at": "2025-12-30T10:00:00"
  }
]
```

---

### 4. Mark Payment as Paid
**PATCH** `/payments/{payment_id}/mark-paid`

**Auth**: Guide (own heritage) or Admin (any)

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "CASH",
  "status": "paid",
  "created_at": "2025-12-30T10:00:00"
}
```

**Validations**:
- Payment must exist
- Payment not already paid
- Booking not cancelled
- Guide can only mark payments for their own heritage bookings

---

### 5. Mark Payment as Failed (Admin)
**PATCH** `/payments/{payment_id}/mark-failed`

**Auth**: Admin only

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "UPI",
  "status": "failed",
  "created_at": "2025-12-30T10:00:00"
}
```

**Validations**:
- Payment must exist
- Cannot mark already paid payment as failed

---

## Role-Based Access Control

### Tourist (No Auth)
✅ View payment status by booking ID  
❌ Cannot create or modify payments

### Guide (Auth Required)
✅ Create payments  
✅ Mark payments as paid (only for own heritage bookings)  
❌ Cannot mark as failed  
❌ Cannot view all payments

### Admin (Auth Required)
✅ Create payments  
✅ View all payments  
✅ Mark any payment as paid  
✅ Mark any payment as failed

---

## Status Transitions

```
pending → paid    (Guide/Admin)
pending → failed  (Admin only)
paid → [LOCKED]   (Cannot change)
```

**Rules**:
- Once marked as `paid`, status cannot be changed
- Cannot mark payment for cancelled booking
- Cannot create duplicate payment for same booking

---

## File Structure

```
backend/apps/payments/
├── models.py      # SQLAlchemy Payment model
├── schemas.py     # Pydantic validation schemas
├── services.py    # Business logic layer
└── routers.py     # FastAPI route handlers
```

---

## Migration Details

**Migration File**: `alembic/versions/b7e59db86a1c_create_payments_table.py`

**Revision ID**: `b7e59db86a1c`  
**Revises**: `cfc2173b78d6`

**Applied**: ✅ Successfully stamped

---

## Testing Scenarios

### Scenario 1: Tourist Checks Payment
1. Tourist creates booking → gets `booking_id`
2. Guide/Admin creates payment for that booking
3. Tourist calls `GET /payments/booking/{booking_id}` (no auth)
4. Sees status: `pending`

### Scenario 2: Guide Marks Payment Paid
1. Tourist visits heritage site and pays cash
2. Guide calls `PATCH /payments/{payment_id}/mark-paid`
3. Status changes to `paid`
4. Tourist can verify status publicly

### Scenario 3: Admin Marks Payment Failed
1. UPI payment fails
2. Admin calls `PATCH /payments/{payment_id}/mark-failed`
3. Status changes to `failed`

### Scenario 4: Permission Denied
1. Guide tries to mark payment for another guide's heritage
2. Returns `403 Forbidden`

---

## Key Design Decisions

1. **Mock System**: No real payment gateway integration (suitable for college project)
2. **Manual Status Updates**: Payments marked manually by authorized users
3. **One Payment Per Booking**: Enforced via UNIQUE constraint
4. **Public Status Check**: Tourists can verify payment without login
5. **Cascade Delete**: Payment deleted when booking is deleted
6. **No Refunds**: Out of scope for MVP

---

## What's NOT Included (By Design)

❌ Real payment gateway (Razorpay, Stripe, PayPal)  
❌ Webhook handling  
❌ Transaction IDs from payment providers  
❌ Refund logic  
❌ Payment history/audit trail  
❌ Partial payments  
❌ Payment reminders

---

## Integration with Existing Modules

### With Bookings Module
- Payment references `bookings.id` via foreign key
- Validates booking exists and is not cancelled
- Cascade deletes when booking is deleted

### With Heritage Module
- Guide permission check uses `heritage.guide_id`
- Ensures guide can only manage payments for own heritage

---

## Error Handling

| Status Code | Scenario |
|-------------|----------|
| `400` | Invalid data, duplicate payment, invalid state transition |
| `403` | Permission denied (guide trying to access other's heritage) |
| `404` | Payment or booking not found |
| `500` | Server error |

---

## Viva Questions & Answers

**Q: Why no real payment gateway?**  
A: This is a college project demonstrating payment flow logic. Real gateway integration requires business registration, compliance, and is beyond scope.

**Q: How do you ensure payment security?**  
A: Role-based access control, validation checks, and status locking (paid payments cannot be changed).

**Q: What happens if booking is cancelled after payment?**  
A: Payment status remains as-is. Refund logic is out of scope for MVP.

**Q: Why store amount in INTEGER?**  
A: Best practice to avoid floating-point precision issues. Store in smallest unit (paise for INR).

**Q: Can a tourist create payment?**  
A: No. Only Guide/Admin can create payments. Tourist can only view status.

---

## Future Enhancements (Post-MVP)

- Payment gateway integration (Razorpay/Stripe)
- Automated payment status updates via webhooks
- Refund management
- Payment history and audit logs
- Email/SMS notifications on payment status change
- Payment analytics dashboard

---

## Summary

✅ Clean, minimal mock payment system  
✅ Role-based access control implemented  
✅ Status transition validation  
✅ Public payment status check  
✅ Database migration applied  
✅ Follows project structure conventions  
✅ Ready for college project demonstration

**Status**: COMPLETE AND READY FOR USE 🎉
