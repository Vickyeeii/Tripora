# Payment Module - Quick Reference

## 📁 Files Created

```
backend/
├── apps/payments/
│   ├── models.py          ✅ Payment database model
│   ├── schemas.py         ✅ Pydantic validation schemas
│   ├── services.py        ✅ Business logic layer
│   └── routers.py         ✅ API endpoints
├── alembic/versions/
│   └── b7e59db86a1c_create_payments_table.py  ✅ Migration
├── PAYMENT_MODULE_COMPLETE.md     ✅ Full documentation
├── PAYMENT_API_TESTS.md           ✅ Testing guide
└── PAYMENT_QUICK_REFERENCE.md     ✅ This file
```

## 🔧 Setup Completed

- [x] Payment model created with proper constraints
- [x] Schemas with validation (amount > 0, valid payment methods)
- [x] Service layer with business logic
- [x] API routers with role-based access
- [x] Router registered in main.py
- [x] Model imported in middleware/models.py
- [x] Database migration created and applied
- [x] Table verified in PostgreSQL

## 🎯 Core Features

1. **Create Payment** - Guide/Admin can create payment for booking
2. **Check Status** - Public access (no auth required)
3. **Mark Paid** - Guide (own heritage) or Admin
4. **Mark Failed** - Admin only
5. **List All** - Admin only

## 🔐 Permissions Matrix

| Action | Tourist | Guide | Admin |
|--------|---------|-------|-------|
| Create Payment | ❌ | ✅ (any) | ✅ (any) |
| View Status | ✅ (public) | ✅ | ✅ |
| Mark Paid | ❌ | ✅ (own heritage) | ✅ (any) |
| Mark Failed | ❌ | ❌ | ✅ |
| List All | ❌ | ❌ | ✅ |

## 📊 Database Schema

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(20) NOT NULL,  -- UPI | CASH | CARD
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | paid | failed
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## 🔄 Status Flow

```
pending ──(Guide/Admin)──> paid [LOCKED]
   │
   └──(Admin only)──> failed
```

## 🚀 Quick Start

### 1. Start Server
```bash
cd backend
uvicorn main:app --reload
```

### 2. Create Payment (Guide/Admin)
```bash
POST /payments/
{
  "booking_id": "uuid",
  "amount": 50000,
  "payment_method": "UPI"
}
```

### 3. Check Status (Public)
```bash
GET /payments/booking/{booking_id}
```

### 4. Mark as Paid
```bash
PATCH /payments/{payment_id}/mark-paid
```

## ⚠️ Important Validations

- ✅ One payment per booking (UNIQUE constraint)
- ✅ Booking must exist and not be cancelled
- ✅ Amount must be > 0
- ✅ Payment method must be: UPI, CASH, or CARD
- ✅ Cannot change status once marked as paid
- ✅ Guide can only mark payments for own heritage

## 🎓 Viva Preparation

**Q: Why mock payment system?**  
A: College project scope. Demonstrates payment flow without real gateway complexity.

**Q: How is security ensured?**  
A: Role-based access control, JWT authentication, validation checks, status locking.

**Q: What happens on booking cancellation?**  
A: Payment record is cascade deleted. Refunds are out of scope.

**Q: Why INTEGER for amount?**  
A: Avoids floating-point precision issues. Store in smallest unit (paise).

**Q: Can tourist create payment?**  
A: No. Only Guide/Admin. Tourist can only view status.

## 📝 Testing Checklist

- [ ] Create payment for valid booking
- [ ] Public status check works without auth
- [ ] Guide can mark own heritage payment as paid
- [ ] Guide cannot mark other's heritage payment
- [ ] Admin can mark any payment as paid/failed
- [ ] Cannot create duplicate payment
- [ ] Cannot mark paid payment again
- [ ] Proper error messages for all scenarios

## 🔗 Integration Points

**With Bookings Module**:
- Foreign key: `payments.booking_id → bookings.id`
- Validates booking exists and not cancelled
- Cascade delete on booking deletion

**With Heritage Module**:
- Permission check via `heritage.guide_id`
- Guide can only manage payments for own heritage

## 📈 Future Enhancements

- Real payment gateway (Razorpay/Stripe)
- Webhook handling
- Refund management
- Payment history/audit trail
- Email/SMS notifications
- Analytics dashboard

## ✅ Module Status

**COMPLETE AND READY FOR DEMONSTRATION**

All requirements met:
- ✅ Simple, mock payment system
- ✅ No external gateway integration
- ✅ Clean data modeling
- ✅ Status transitions implemented
- ✅ Role-based access control
- ✅ Follows project structure
- ✅ Database migration applied
- ✅ Comprehensive documentation

---

**Need Help?**
- Full docs: `PAYMENT_MODULE_COMPLETE.md`
- API tests: `PAYMENT_API_TESTS.md`
- Code: `apps/payments/`
