# Tripora Backend API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:8000`  
**For:** Frontend Developers

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users & Profile](#users--profile)
3. [Heritage Sites](#heritage-sites)
4. [Events](#events)
5. [Bookings](#bookings)
6. [Payments](#payments)
7. [Notifications](#notifications)
8. [Complaints](#complaints)
9. [Feedbacks](#feedbacks)
10. [Dashboards](#dashboards)
11. [Role-Based Flows](#role-based-flows)

---

## Authentication

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

### POST /auth/login

**Purpose:** Login for tourist, guide, or admin

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "role": "tourist",
  "user_id": "uuid-here"
}
```

**Error Responses:**
- `401`: Invalid email or password
- `403`: Account not approved (for guides)

---

### POST /auth/refresh

**Purpose:** Refresh access token using refresh token

**Auth:** None

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGc..."
}
```

**Error Responses:**
- `401`: Invalid or expired refresh token

---

### POST /auth/tourist/signup

**Purpose:** Register new tourist account

**Auth:** None

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "country": "India",
  "preferred_language": "English"
}
```

**Success Response (200):**
```json
{
  "message": "Tourist registered successfully"
}
```

**Error Responses:**
- `400`: Email already exists or validation error

---

### POST /auth/guide/signup

**Purpose:** Register new guide account (requires admin approval)

**Auth:** None

**Request Body:**
```json
{
  "full_name": "Jane Guide",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St, City"
}
```

**Success Response (200):**
```json
{
  "message": "Guide registration submitted. Await admin approval."
}
```

**Error Responses:**
- `400`: Email already exists or validation error

**Frontend Note:** Guide cannot login until admin approves

---

### POST /auth/logout

**Purpose:** Logout and invalidate refresh token

**Auth:** None

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `400`: Invalid refresh token

---

## Users & Profile

### GET /users/guides/pending

**Purpose:** View pending guide approvals

**Auth:** JWT (Admin only)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "full_name": "Jane Guide",
    "email": "jane@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "status": false,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PUT /users/guides/{guide_id}/approval

**Purpose:** Approve or reject guide registration

**Auth:** JWT (Admin only)

**Request Body:**
```json
{
  "approve": true
}
```

**Success Response (200):**
```json
{
  "message": "Guide approval status updated"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Guide not found

---

### GET /users/me

**Purpose:** Get current user profile (tourist or guide)

**Auth:** JWT (Tourist or Guide)

**Success Response (200) - Tourist:**
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "country": "India",
  "preferred_language": "English",
  "created_at": "2024-01-01T00:00:00"
}
```

**Success Response (200) - Guide:**
```json
{
  "id": "uuid",
  "full_name": "Jane Guide",
  "email": "jane@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "status": true,
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist or guide

---

### PUT /users/me

**Purpose:** Update current user profile

**Auth:** JWT (Tourist or Guide)

**Request Body - Tourist:**
```json
{
  "full_name": "John Updated",
  "phone": "9876543210",
  "country": "USA",
  "preferred_language": "Spanish"
}
```

**Request Body - Guide:**
```json
{
  "full_name": "Jane Updated",
  "phone": "9876543210",
  "address": "456 New St"
}
```

**Success Response (200):** Returns updated profile

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist or guide
- `400`: Validation error

---

## Heritage Sites

### POST /heritage/

**Purpose:** Create new heritage site

**Auth:** JWT (Guide only)

**Request Body:**
```json
{
  "name": "Ancient Temple",
  "description": "Historic temple from 15th century",
  "location_map": "https://maps.google.com/...",
  "short_description": "Brief overview",
  "historical_overview": "Detailed history",
  "cultural_significance": "Cultural importance",
  "best_time_to_visit": "October to March"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "guide_id": "uuid",
  "name": "Ancient Temple",
  "description": "Historic temple from 15th century",
  "location_map": "https://maps.google.com/...",
  "is_active": false,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide
- `400`: Validation error

**Frontend Note:** Heritage is inactive until admin approves

---

### GET /heritage/

**Purpose:** List all active heritage sites

**Auth:** None (Public)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Ancient Temple",
    "description": "Historic temple",
    "location_map": "https://maps.google.com/...",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Frontend Note:** Returns only approved and active sites

---

### GET /heritage/{heritage_id}

**Purpose:** Get single heritage site details

**Auth:** Optional (Public can view active, Guide can view own, Admin can view all)

**Success Response (200):**
```json
{
  "id": "uuid",
  "guide_id": "uuid",
  "name": "Ancient Temple",
  "description": "Historic temple",
  "location_map": "https://maps.google.com/...",
  "short_description": "Brief overview",
  "historical_overview": "Detailed history",
  "cultural_significance": "Cultural importance",
  "best_time_to_visit": "October to March",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `202`: Heritage awaiting approval
- `404`: Heritage not found
- `410`: Heritage no longer available

---

### PUT /heritage/{heritage_id}

**Purpose:** Update heritage site

**Auth:** JWT (Guide - own heritage only)

**Request Body:** Same as create

**Success Response (200):** Returns updated heritage

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide or not owner
- `404`: Heritage not found

---

### PATCH /heritage/{heritage_id}/approve

**Purpose:** Approve heritage site

**Auth:** JWT (Admin only)

**Success Response (200):** Returns approved heritage

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Heritage not found

---

### PATCH /heritage/{heritage_id}/disable

**Purpose:** Disable heritage site

**Auth:** JWT (Admin only)

**Success Response (200):** Returns disabled heritage

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Heritage not found

---

### PATCH /heritage/{heritage_id}/delete

**Purpose:** Soft delete heritage site

**Auth:** JWT (Admin only)

**Success Response (200):** Returns deleted heritage

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Heritage not found

---

### POST /heritage/{heritage_id}/photos

**Purpose:** Add photo to heritage site

**Auth:** JWT (Guide only)

**Request Body:**
```json
{
  "image_url": "https://example.com/photo.jpg"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "heritage_id": "uuid",
  "image_url": "https://example.com/photo.jpg",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide
- `404`: Heritage not found

---

### POST /heritage/{heritage_id}/rules

**Purpose:** Add safety rule to heritage site

**Auth:** JWT (Guide only)

**Request Body:**
```json
{
  "rule_text": "No photography inside temple"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "heritage_id": "uuid",
  "rule_text": "No photography inside temple"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide
- `404`: Heritage not found

---

### POST /heritage/{heritage_id}/qr

**Purpose:** Generate QR code for heritage site

**Auth:** JWT (Guide or Admin)

**Success Response (201):**
```json
{
  "id": "uuid",
  "heritage_id": "uuid",
  "qr_value": "base64-encoded-qr-image",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide or admin
- `404`: Heritage not found

**Frontend Note:** QR value is base64 encoded PNG image

---

## Events

### GET /events/today

**Purpose:** Get all events scheduled for today

**Auth:** None (Public)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "heritage_id": "uuid",
    "title": "Festival Celebration",
    "description": "Annual festival",
    "event_date": "2024-01-01",
    "event_time": "10:00:00",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

---

### GET /events/tomorrow

**Purpose:** Get all events scheduled for tomorrow

**Auth:** None (Public)

**Success Response (200):** Same as today

---

### GET /events/?heritage_id={uuid}

**Purpose:** Get events for specific heritage (today and tomorrow only)

**Auth:** None (Public)

**Query Parameters:**
- `heritage_id` (required): UUID of heritage site

**Success Response (200):** Array of events

---

### POST /events/

**Purpose:** Create new event

**Auth:** JWT (Guide or Admin)

**Request Body:**
```json
{
  "heritage_id": "uuid",
  "title": "Festival Celebration",
  "description": "Annual festival at the temple",
  "event_date": "2024-12-25",
  "event_time": "10:00:00"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "heritage_id": "uuid",
  "title": "Festival Celebration",
  "description": "Annual festival",
  "event_date": "2024-12-25",
  "event_time": "10:00:00",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin, heritage not approved, or not owner
- `404`: Heritage not found

---

### PUT /events/{event_id}

**Purpose:** Update event

**Auth:** JWT (Guide - own events, Admin - all events)

**Request Body:** Same as create

**Success Response (200):** Returns updated event

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin or not owner
- `404`: Event not found

---

### PATCH /events/{event_id}/cancel

**Purpose:** Cancel event

**Auth:** JWT (Guide - own events, Admin - all events)

**Success Response (200):** Returns cancelled event

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin or not owner
- `404`: Event not found

---

### PATCH /events/{event_id}/disable

**Purpose:** Disable event

**Auth:** JWT (Admin only)

**Success Response (200):** Returns disabled event

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Event not found

---

### PATCH /events/{event_id}/delete

**Purpose:** Soft delete event

**Auth:** JWT (Admin only)

**Success Response (200):** Returns deleted event

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Event not found

---

## Bookings

### POST /bookings/

**Purpose:** Create booking (Guest tourist - no auth required)

**Auth:** None

**Request Body:**
```json
{
  "heritage_id": "uuid",
  "event_id": "uuid",
  "visitor_name": "John Doe",
  "visitor_phone": "1234567890",
  "visitor_email": "john@example.com",
  "visit_date": "2024-12-25",
  "visit_time": "10:00:00",
  "people_count": 4,
  "notes": "Family visit"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "event_id": "uuid",
  "visitor_name": "John Doe",
  "visitor_phone": "1234567890",
  "visitor_email": "john@example.com",
  "visit_date": "2024-12-25",
  "visit_time": "10:00:00",
  "people_count": 4,
  "status": "pending",
  "notes": "Family visit",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `400`: Validation error or heritage not found

**Frontend Note:** Save reference_code for tracking

---

### POST /bookings/tourist

**Purpose:** Create booking (Logged-in tourist)

**Auth:** JWT (Tourist only)

**Request Body:** Same as guest booking

**Success Response (201):** Same as guest booking

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist
- `400`: Validation error

**Frontend Note:** Booking linked to tourist account

---

### POST /bookings/guide

**Purpose:** Create booking (Guide assisted)

**Auth:** JWT (Guide only)

**Request Body:** Same as guest booking

**Success Response (201):** Same as guest booking

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide
- `400`: Validation error

---

### GET /bookings/track?reference={code}

**Purpose:** Track booking by reference code

**Auth:** None (Public)

**Query Parameters:**
- `reference` (required): Booking reference code (e.g., TRP-ABC123)

**Success Response (200):**
```json
{
  "id": "uuid",
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "visitor_name": "John Doe",
  "visit_date": "2024-12-25",
  "status": "confirmed",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `404`: Booking not found

---

### GET /bookings/tourist/my-bookings

**Purpose:** Get logged-in tourist's booking history

**Auth:** JWT (Tourist only)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "reference_code": "TRP-ABC123",
    "heritage_id": "uuid",
    "visit_date": "2024-12-25",
    "status": "confirmed",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist

**Frontend Note:** Returns empty array if no bookings

---

### GET /bookings/my-heritage

**Purpose:** Get bookings for guide's heritage sites

**Auth:** JWT (Guide only)

**Success Response (200):** Array of bookings

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide

---

### GET /bookings/

**Purpose:** Get all bookings

**Auth:** JWT (Admin only)

**Success Response (200):** Array of all bookings

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PATCH /bookings/{booking_id}/confirm

**Purpose:** Confirm booking

**Auth:** JWT (Guide or Admin)

**Success Response (200):** Returns confirmed booking

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin
- `404`: Booking not found

**Frontend Note:** Creates notification for tourist

---

### PATCH /bookings/{booking_id}/cancel

**Purpose:** Cancel booking

**Auth:** JWT (Guide or Admin)

**Success Response (200):** Returns cancelled booking

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin
- `404`: Booking not found

**Frontend Note:** Creates notification for tourist

---

## Payments

### POST /payments/

**Purpose:** Create payment for booking

**Auth:** JWT (Guide or Admin)

**Request Body:**
```json
{
  "booking_id": "uuid",
  "amount": 500.00,
  "payment_method": "UPI"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "amount": 500.00,
  "payment_method": "UPI",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin
- `400`: Booking not found or payment already exists

**Frontend Note:** Payment methods: UPI, CASH, CARD

---

### GET /payments/booking/{booking_id}

**Purpose:** Get payment status by booking ID

**Auth:** None (Public)

**Success Response (200):**
```json
{
  "booking_id": "uuid",
  "amount": 500.00,
  "payment_method": "UPI",
  "status": "paid"
}
```

**Error Responses:**
- `404`: Payment not found

---

### GET /payments/

**Purpose:** Get all payments

**Auth:** JWT (Admin only)

**Success Response (200):** Array of all payments

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PATCH /payments/{payment_id}/mark-paid

**Purpose:** Mark payment as paid

**Auth:** JWT (Guide - own heritage bookings, Admin - all)

**Success Response (200):** Returns updated payment

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin or not owner
- `404`: Payment not found
- `400`: Already paid

**Frontend Note:** Creates notification for tourist

---

### PATCH /payments/{payment_id}/mark-failed

**Purpose:** Mark payment as failed

**Auth:** JWT (Admin only)

**Success Response (200):** Returns updated payment

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Payment not found

---

## Notifications

### GET /notifications/tourist?reference={code}

**Purpose:** Get notifications for tourist by booking reference

**Auth:** None (Public)

**Query Parameters:**
- `reference` (required): Booking reference code

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "recipient_role": "tourist",
    "title": "Booking Confirmed",
    "message": "Your booking TRP-ABC123 has been confirmed",
    "type": "booking",
    "related_id": "uuid",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Error Responses:**
- `404`: No notifications found

**Frontend Note:** Returns empty array if no notifications

---

### GET /notifications/guide

**Purpose:** Get all notifications for logged-in guide

**Auth:** JWT (Guide only)

**Success Response (200):** Array of notifications

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide

---

### GET /notifications/admin

**Purpose:** Get all notifications

**Auth:** JWT (Admin only)

**Success Response (200):** Array of all notifications

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PATCH /notifications/{notification_id}/read

**Purpose:** Mark notification as read

**Auth:** JWT (Guide or Admin)

**Success Response (200):** Returns updated notification

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide/admin or not owner
- `404`: Notification not found

---

## Complaints

### POST /complaints/

**Purpose:** Create complaint (Guest tourist - no auth)

**Auth:** None

**Request Body:**
```json
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "event_id": "uuid",
  "booking_id": "uuid",
  "subject": "Cleanliness Issue",
  "description": "The site was not properly maintained"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "subject": "Cleanliness Issue",
  "description": "The site was not properly maintained",
  "status": "open",
  "admin_reply": null,
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `400`: Validation error

**Frontend Note:** At least one of heritage_id, event_id, or booking_id required

---

### GET /complaints/track?reference={code}

**Purpose:** Track complaint by reference code

**Auth:** None (Public)

**Query Parameters:**
- `reference` (required): Booking reference code

**Success Response (200):** Returns complaint details

**Error Responses:**
- `404`: Complaint not found

---

### POST /complaints/tourist

**Purpose:** Create complaint (Logged-in tourist)

**Auth:** JWT (Tourist only)

**Request Body:** Same as guest complaint (reference_code optional)

**Success Response (201):** Same as guest complaint

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist
- `400`: Validation error

---

### GET /complaints/my

**Purpose:** Get logged-in tourist's complaints

**Auth:** JWT (Tourist only)

**Success Response (200):** Array of complaints

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist

---

### GET /complaints/guide/my-heritage

**Purpose:** Get complaints for guide's heritage sites

**Auth:** JWT (Guide only)

**Success Response (200):** Array of complaints

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide

---

### GET /complaints/

**Purpose:** Get all complaints

**Auth:** JWT (Admin only)

**Success Response (200):** Array of all complaints

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PATCH /complaints/{complaint_id}/status

**Purpose:** Update complaint status

**Auth:** JWT (Admin only)

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Success Response (200):** Returns updated complaint

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Complaint not found

**Frontend Note:** Status values: open, in_progress, resolved, closed

---

### PATCH /complaints/{complaint_id}/reply

**Purpose:** Add admin reply to complaint

**Auth:** JWT (Admin only)

**Request Body:**
```json
{
  "admin_reply": "We have addressed the issue. Thank you for reporting."
}
```

**Success Response (200):** Returns updated complaint

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Complaint not found

---

## Feedbacks

### GET /feedbacks/heritage/{heritage_id}

**Purpose:** Get visible feedbacks for heritage site

**Auth:** None (Public)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "heritage_id": "uuid",
    "rating": 5,
    "title": "Amazing Experience",
    "comment": "Beautiful heritage site with rich history",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Frontend Note:** Returns only approved feedbacks (is_visible=true)

---

### GET /feedbacks/event/{event_id}

**Purpose:** Get visible feedbacks for event

**Auth:** None (Public)

**Success Response (200):** Array of feedbacks

---

### POST /feedbacks/

**Purpose:** Create feedback (Guest tourist - no auth)

**Auth:** None

**Request Body:**
```json
{
  "booking_id": "uuid",
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "event_id": "uuid",
  "rating": 5,
  "title": "Amazing Experience",
  "comment": "Beautiful heritage site with rich history"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "heritage_id": "uuid",
  "rating": 5,
  "title": "Amazing Experience",
  "comment": "Beautiful heritage site",
  "created_at": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `400`: Validation error, booking not found, or feedback already exists

**Frontend Note:** Rating must be 1-5, title min 5 chars, comment min 10 chars. One feedback per booking.

---

### POST /feedbacks/tourist

**Purpose:** Create feedback (Logged-in tourist)

**Auth:** JWT (Tourist only)

**Request Body:**
```json
{
  "booking_id": "uuid",
  "heritage_id": "uuid",
  "event_id": "uuid",
  "rating": 5,
  "title": "Amazing Experience",
  "comment": "Beautiful heritage site with rich history"
}
```

**Success Response (201):** Same as guest feedback

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist
- `400`: Validation error

---

### GET /feedbacks/my

**Purpose:** Get logged-in tourist's feedbacks

**Auth:** JWT (Tourist only)

**Success Response (200):**
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "heritage_id": "uuid",
    "rating": 5,
    "title": "Amazing Experience",
    "comment": "Beautiful heritage site",
    "is_visible": false,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist

**Frontend Note:** Shows visibility status (pending admin approval)

---

### GET /feedbacks/

**Purpose:** Get all feedbacks

**Auth:** JWT (Admin only)

**Success Response (200):** Array of all feedbacks with is_visible field

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

---

### PATCH /feedbacks/{feedback_id}/approve

**Purpose:** Approve feedback (make visible)

**Auth:** JWT (Admin only)

**Success Response (200):** Returns approved feedback

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Feedback not found

---

### PATCH /feedbacks/{feedback_id}/hide

**Purpose:** Hide feedback (make invisible)

**Auth:** JWT (Admin only)

**Success Response (200):** Returns hidden feedback

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin
- `404`: Feedback not found

---

## Dashboards

### GET /dashboard/tourist

**Purpose:** Get tourist dashboard analytics

**Auth:** JWT (Tourist only)

**Success Response (200):**
```json
{
  "total_bookings": 5,
  "upcoming_bookings": 2,
  "last_booking_status": "confirmed"
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not tourist

**Frontend Note:** last_booking_status can be null if no bookings

---

### GET /dashboard/guide

**Purpose:** Get guide dashboard analytics

**Auth:** JWT (Guide only)

**Success Response (200):**
```json
{
  "total_bookings": 150,
  "today_bookings": 5,
  "upcoming_bookings": 20,
  "pending_complaints": 2,
  "average_rating": 4.5,
  "total_revenue": 75000.00
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not guide

**Frontend Note:** average_rating is null if no ratings. All counts default to 0.

---

### GET /dashboard/admin

**Purpose:** Get admin dashboard analytics

**Auth:** JWT (Admin only)

**Success Response (200):**
```json
{
  "total_tourists": 500,
  "total_guides": 50,
  "total_heritage": 100,
  "total_bookings": 2000,
  "pending_complaints": 10,
  "pending_feedbacks": 25,
  "total_revenue": 1000000.00
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not admin

**Frontend Note:** All counts default to 0 if no data

---

## Role-Based Flows

### Tourist Flow

**Guest Tourist (No Account):**
1. Browse heritage sites: `GET /heritage/`
2. View heritage details: `GET /heritage/{id}`
3. Check today's events: `GET /events/today`
4. Create booking: `POST /bookings/`
5. Track booking: `GET /bookings/track?reference=TRP-ABC123`
6. Check payment: `GET /payments/booking/{booking_id}`
7. View notifications: `GET /notifications/tourist?reference=TRP-ABC123`
8. Submit complaint: `POST /complaints/`
9. Submit feedback: `POST /feedbacks/`

**Registered Tourist:**
1. Login: `POST /auth/login`
2. View profile: `GET /users/me`
3. Update profile: `PUT /users/me`
4. Create booking: `POST /bookings/tourist`
5. View booking history: `GET /bookings/tourist/my-bookings`
6. View my complaints: `GET /complaints/my`
7. View my feedbacks: `GET /feedbacks/my`
8. View dashboard: `GET /dashboard/tourist`

---

### Guide Flow

1. Register: `POST /auth/guide/signup` (wait for admin approval)
2. Login: `POST /auth/login` (after approval)
3. View profile: `GET /users/me`
4. Create heritage: `POST /heritage/`
5. Add photos: `POST /heritage/{id}/photos`
6. Add safety rules: `POST /heritage/{id}/rules`
7. Generate QR: `POST /heritage/{id}/qr`
8. Create events: `POST /events/`
9. View bookings: `GET /bookings/my-heritage`
10. Confirm bookings: `PATCH /bookings/{id}/confirm`
11. Create payments: `POST /payments/`
12. Mark payments paid: `PATCH /payments/{id}/mark-paid`
13. View notifications: `GET /notifications/guide`
14. View complaints: `GET /complaints/guide/my-heritage`
15. View dashboard: `GET /dashboard/guide`

---

### Admin Flow

1. Login: `POST /auth/login`
2. View pending guides: `GET /users/guides/pending`
3. Approve guides: `PUT /users/guides/{id}/approval`
4. Approve heritage: `PATCH /heritage/{id}/approve`
5. Disable heritage: `PATCH /heritage/{id}/disable`
6. View all bookings: `GET /bookings/`
7. View all payments: `GET /payments/`
8. Mark payment failed: `PATCH /payments/{id}/mark-failed`
9. View all complaints: `GET /complaints/`
10. Update complaint status: `PATCH /complaints/{id}/status`
11. Reply to complaints: `PATCH /complaints/{id}/reply`
12. View all feedbacks: `GET /feedbacks/`
13. Approve feedbacks: `PATCH /feedbacks/{id}/approve`
14. Hide feedbacks: `PATCH /feedbacks/{id}/hide`
15. View dashboard: `GET /dashboard/admin`

---

## Common Error Responses

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Only admins can access this endpoint"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "detail": "Validation error message"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Failed to process request: error details"
}
```

---

## Frontend Integration Notes

1. **JWT Token Management:**
   - Store access_token and refresh_token securely
   - Include access_token in Authorization header for protected endpoints
   - Refresh token when access_token expires (401 response)

2. **Guest vs Authenticated:**
   - Guest tourists can book without account using reference code for tracking
   - Registered tourists get booking history and profile management

3. **Empty States:**
   - All list endpoints return empty arrays `[]` when no data
   - Dashboard metrics return 0 for counts, null for averages

4. **Reference Codes:**
   - Format: TRP-XXXXXX (6 random alphanumeric)
   - Used for guest tourist tracking (bookings, notifications, complaints)

5. **Status Values:**
   - Booking: pending, confirmed, cancelled
   - Payment: pending, paid, failed
   - Complaint: open, in_progress, resolved, closed

6. **Validation:**
   - Rating: 1-5 (integer)
   - Feedback title: min 5 characters
   - Feedback comment: min 10 characters
   - One feedback per booking

7. **Approval Workflows:**
   - Guides need admin approval before login
   - Heritage sites need admin approval before public visibility
   - Feedbacks need admin approval before public visibility

---

**End of Documentation**
