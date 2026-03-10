# Feedback/Reviews Module - Complete Implementation ✅

## Overview
A text-only feedback and rating system for Tripora. Tourists can submit reviews for heritage sites and events after confirmed bookings. Admins moderate feedback visibility.

**Important**: NO image uploads, NO file attachments - text-only for MVP simplicity.

---

## Database Schema

### Table: `feedbacks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique feedback identifier |
| `booking_id` | UUID | FK → bookings.id, UNIQUE, NOT NULL | One feedback per booking |
| `tourist_id` | UUID | NULLABLE | Tourist UUID (for logged-in) |
| `reference_code` | VARCHAR(20) | NULLABLE | Booking reference (for guest) |
| `heritage_id` | UUID | FK → heritage.id, NOT NULL | Related heritage site |
| `event_id` | UUID | FK → events.id, NULLABLE | Related event (optional) |
| `rating` | INTEGER | NOT NULL | Rating 1-5 stars |
| `title` | VARCHAR(150) | NOT NULL | Feedback title/summary |
| `comment` | TEXT | NOT NULL | Detailed feedback |
| `is_visible` | BOOLEAN | NOT NULL, DEFAULT FALSE | Admin approval status |
| `created_at` | TIMESTAMP | DEFAULT now() | Submission timestamp |

**Key Constraints**:
- `booking_id` is UNIQUE (one feedback per booking)
- Either `tourist_id` OR `reference_code` must be present
- Foreign keys use `ON DELETE SET NULL`
- Rating must be 1-5
- No hard deletes

---

## API Endpoints

### 1. Get Heritage Feedbacks (Public)
**GET** `/feedbacks/heritage/{heritage_id}`

**Auth**: None (Public)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "heritage_id": "uuid",
    "event_id": null,
    "rating": 5,
    "title": "Amazing experience!",
    "comment": "The heritage site was well maintained and the guide was very knowledgeable.",
    "created_at": "2025-12-30T10:00:00"
  }
]
```

**Note**: Only returns feedbacks where `is_visible = true`

---

### 2. Get Event Feedbacks (Public)
**GET** `/feedbacks/event/{event_id}`

**Auth**: None (Public)

**Response**: `200 OK` (same format as heritage feedbacks)

---

### 3. Create Feedback (Guest)
**POST** `/feedbacks/`

**Auth**: None (Public)

**Request Body**:
```json
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "uuid",
  "event_id": null,
  "rating": 5,
  "title": "Excellent heritage site",
  "comment": "Very well maintained. The guide was professional and informative."
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "booking_id": "uuid",
  "heritage_id": "uuid",
  "event_id": null,
  "rating": 5,
  "title": "Excellent heritage site",
  "comment": "Very well maintained...",
  "created_at": "2025-12-30T10:00:00"
}
```

**Validations**:
- Booking must exist with reference code
- Booking must be confirmed
- No duplicate feedback for same booking
- Rating: 1-5
- Title: min 5 characters
- Comment: min 10 characters

---

### 4. Create Feedback (Logged-in Tourist)
**POST** `/feedbacks/tourist`

**Auth**: Tourist JWT required

**Request Body**:
```json
{
  "booking_id": "uuid",
  "heritage_id": "uuid",
  "event_id": null,
  "rating": 4,
  "title": "Good experience",
  "comment": "Overall good experience. Some areas need improvement but worth visiting."
}
```

**Response**: `201 Created` (same format)

**Validations**:
- Booking must belong to tourist
- Booking must be confirmed
- No duplicate feedback

---

### 5. Get My Feedbacks (Logged-in Tourist)
**GET** `/feedbacks/my`

**Auth**: Tourist JWT required

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "tourist_id": "tourist-uuid",
    "reference_code": "TRP-ABC123",
    "heritage_id": "uuid",
    "event_id": null,
    "rating": 5,
    "title": "Amazing experience!",
    "comment": "The heritage site was well maintained...",
    "is_visible": true,
    "created_at": "2025-12-30T10:00:00"
  }
]
```

**Note**: Returns all feedbacks (visible and hidden) submitted by the tourist

---

### 6. Get All Feedbacks (Admin)
**GET** `/feedbacks/`

**Auth**: Admin JWT required

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "booking_id": "uuid",
    "tourist_id": "uuid",
    "reference_code": "TRP-ABC123",
    "heritage_id": "uuid",
    "event_id": null,
    "rating": 5,
    "title": "Amazing experience!",
    "comment": "The heritage site was well maintained...",
    "is_visible": false,
    "created_at": "2025-12-30T10:00:00"
  }
]
```

**Note**: Returns ALL feedbacks (visible and hidden)

---

### 7. Approve Feedback (Admin)
**PATCH** `/feedbacks/{feedback_id}/approve`

**Auth**: Admin JWT required

**Response**: `200 OK` (updated feedback with `is_visible = true`)

**Effect**: Feedback becomes visible in public endpoints

---

### 8. Hide Feedback (Admin)
**PATCH** `/feedbacks/{feedback_id}/hide`

**Auth**: Admin JWT required

**Response**: `200 OK` (updated feedback with `is_visible = false`)

**Effect**: Feedback is hidden from public endpoints

---

## Role-Based Access Control

### Tourist (Guest)
✅ Create feedback (with reference_code)  
✅ View public feedbacks (approved only)  
❌ Cannot view own feedback status  
❌ Cannot edit/delete feedback

### Tourist (Logged-in)
✅ Create feedback (tourist_id set automatically)  
✅ View own feedbacks (all statuses)  
✅ View public feedbacks  
❌ Cannot edit/delete feedback  
❌ Cannot approve/hide feedback

### Guide
✅ View public feedbacks for their heritage  
❌ Cannot submit feedback  
❌ Cannot approve/hide feedback

### Admin
✅ View all feedbacks (visible + hidden)  
✅ Approve feedback (make visible)  
✅ Hide feedback (make invisible)  
❌ Cannot submit feedback

---

## Business Rules

1. **One Feedback Per Booking**: `booking_id` is UNIQUE
2. **Confirmed Bookings Only**: Feedback can only be submitted for confirmed bookings
3. **No Editing**: Once submitted, feedback cannot be edited
4. **No Deletion**: Feedbacks are permanent (no hard deletes)
5. **Admin Moderation**: All feedback starts as hidden (`is_visible = false`)
6. **Public Visibility**: Only approved feedbacks appear in public endpoints
7. **Tourist Ownership**: Logged-in tourists can only submit feedback for their own bookings

---

## Validation Rules

**Rating**:
- Must be integer between 1 and 5
- Required field

**Title**:
- Minimum 5 characters
- Trimmed automatically
- Required field

**Comment**:
- Minimum 10 characters
- Trimmed automatically
- Required field

**Reference Code** (Guest):
- Booking must exist
- Case-insensitive matching

**Booking ID** (Logged-in):
- Booking must exist
- Must belong to tourist
- Must be confirmed

---

## File Structure

```
backend/apps/feedbacks/
├── models.py      # SQLAlchemy Feedback model
├── schemas.py     # Pydantic validation schemas (4 schemas)
├── services.py    # Business logic layer (8 functions)
└── routers.py     # FastAPI route handlers (8 endpoints)
```

---

## Migration Details

**Migration File**: `alembic/versions/c5647d9c0c2b_create_feedbacks_table.py`

**Revision ID**: `c5647d9c0c2b`  
**Revises**: `d1401a051f95`

**Applied**: ✅ Successfully stamped

---

## Testing Guide (Postman)

### Test 1: Guest Creates Feedback
```
POST http://localhost:8000/feedbacks/
Content-Type: application/json

{
  "reference_code": "TRP-ABC123",
  "heritage_id": "heritage-uuid",
  "rating": 5,
  "title": "Excellent site",
  "comment": "Very well maintained and informative guide."
}
```

### Test 2: View Public Feedbacks
```
GET http://localhost:8000/feedbacks/heritage/HERITAGE_UUID
```

**Expected**: Empty array (feedback not yet approved)

### Test 3: Admin Approves Feedback
```
PATCH http://localhost:8000/feedbacks/FEEDBACK_UUID/approve
Authorization: Bearer ADMIN_TOKEN
```

### Test 4: View Public Feedbacks Again
```
GET http://localhost:8000/feedbacks/heritage/HERITAGE_UUID
```

**Expected**: Feedback now appears

### Test 5: Logged-in Tourist Creates Feedback
```
POST http://localhost:8000/feedbacks/tourist
Authorization: Bearer TOURIST_TOKEN
Content-Type: application/json

{
  "booking_id": "booking-uuid",
  "heritage_id": "heritage-uuid",
  "rating": 4,
  "title": "Good experience",
  "comment": "Overall good but some areas need improvement."
}
```

### Test 6: Tourist Views Own Feedbacks
```
GET http://localhost:8000/feedbacks/my
Authorization: Bearer TOURIST_TOKEN
```

### Test 7: Duplicate Feedback (Should Fail)
```
POST http://localhost:8000/feedbacks/
Content-Type: application/json

{
  "reference_code": "TRP-ABC123",
  "heritage_id": "heritage-uuid",
  "rating": 5,
  "title": "Another feedback",
  "comment": "Trying to submit again."
}
```

**Expected**: `400 Bad Request` - "Feedback already submitted for this booking"

### Test 8: Invalid Rating (Should Fail)
```
POST http://localhost:8000/feedbacks/
Content-Type: application/json

{
  "reference_code": "TRP-ABC123",
  "heritage_id": "heritage-uuid",
  "rating": 6,
  "title": "Test",
  "comment": "Test comment"
}
```

**Expected**: `422 Unprocessable Entity` - "Rating must be between 1 and 5"

---

## Error Handling

| Status Code | Scenario |
|-------------|----------|
| `200` | Success |
| `201` | Created |
| `400` | Invalid data, duplicate feedback, booking not confirmed |
| `403` | Permission denied |
| `404` | Feedback not found |
| `422` | Validation error |
| `500` | Server error |

---

## MVP Scope & Limitations

### ✅ What's Included
- Text-only feedback (rating + title + comment)
- Guest and logged-in tourist support
- Admin moderation (approve/hide)
- One feedback per booking
- Public visibility control
- Rating system (1-5 stars)

### ❌ What's NOT Included (By Design)
- Image uploads
- File attachments
- Feedback editing
- Feedback deletion
- Tourist replies to feedback
- Guide responses
- Helpful/unhelpful voting
- Feedback categories/tags
- Verified purchase badges

---

## Viva Questions & Answers

**Q: Why no image uploads?**  
A: MVP simplicity. Text feedback is sufficient for most reviews. Image handling adds complexity (storage, validation, security).

**Q: Why can't tourists edit feedback?**  
A: Once submitted, feedback should remain as-is for authenticity. Tourists can submit new feedback for different bookings.

**Q: Why admin moderation?**  
A: Prevents spam, inappropriate content, and fake reviews. Ensures quality control.

**Q: Why one feedback per booking?**  
A: Prevents spam and duplicate reviews. Each booking represents one visit experience.

**Q: What if booking is deleted?**  
A: Foreign key uses `SET NULL`. Feedback persists with NULL booking reference, maintaining historical data.

**Q: Why can't guides submit feedback?**  
A: Guides are service providers, not customers. Only tourists (customers) can review.

---

## Integration with Existing Modules

### With Bookings Module
- Validates `booking_id` or `reference_code` exists
- Checks booking status (must be confirmed)
- Prevents duplicate feedback per booking

### With Heritage Module
- Links feedback to heritage via `heritage_id`
- Public can view approved feedbacks for heritage

### With Events Module
- Links feedback to event via `event_id` (optional)
- Public can view approved feedbacks for events

---

## Future Enhancements (Post-MVP)

- Image upload support (max 3 images per feedback)
- Helpful/unhelpful voting
- Guide responses to feedback
- Verified purchase badges
- Feedback categories (cleanliness, guide quality, facilities)
- Average rating calculation per heritage
- Feedback analytics dashboard
- Email notifications on approval
- Feedback reporting (inappropriate content)

---

## Summary

✅ Complete text-only feedback system  
✅ Guest and logged-in tourist support  
✅ Admin moderation (approve/hide)  
✅ One feedback per booking  
✅ Rating system (1-5 stars)  
✅ Public visibility control  
✅ Database migration applied  
✅ Follows Tripora architecture  
✅ Ready for college project demonstration

**Status**: COMPLETE AND READY FOR USE 🎉
