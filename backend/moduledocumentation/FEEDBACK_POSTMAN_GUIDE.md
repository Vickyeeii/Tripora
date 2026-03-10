# Feedback Module - Postman Testing Guide

## Setup

**Base URL**: `http://localhost:8000`

**Required Tokens**:
- Tourist JWT (from login)
- Admin JWT (from login)

**Prerequisites**:
- At least one confirmed booking with reference code
- Heritage site UUID
- Tourist account

---

## Collection: Feedbacks

### Folder 1: Public Endpoints

#### 1.1 Get Heritage Feedbacks (Empty Initially)
```
Method: GET
URL: {{base_url}}/feedbacks/heritage/{{heritage_id}}
```

**Expected**: `200 OK` with empty array `[]` (no approved feedbacks yet)

#### 1.2 Get Event Feedbacks
```
Method: GET
URL: {{base_url}}/feedbacks/event/{{event_id}}
```

**Expected**: `200 OK` with array of approved feedbacks

---

### Folder 2: Guest Tourist Feedback

#### 2.1 Create Feedback (Guest)
```
Method: POST
URL: {{base_url}}/feedbacks/
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "your-heritage-uuid",
  "event_id": null,
  "rating": 5,
  "title": "Excellent heritage site",
  "comment": "Very well maintained. The guide was professional and provided great historical context."
}
```

**Expected**: `201 Created` with feedback details

#### 2.2 Try Duplicate Feedback (Should Fail)
```
Method: POST
URL: {{base_url}}/feedbacks/
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "your-heritage-uuid",
  "rating": 4,
  "title": "Another feedback",
  "comment": "Trying to submit feedback again for same booking."
}
```

**Expected**: `400 Bad Request` - "Feedback already submitted for this booking"

#### 2.3 Invalid Rating (Should Fail)
```
Method: POST
URL: {{base_url}}/feedbacks/
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "your-heritage-uuid",
  "rating": 6,
  "title": "Test",
  "comment": "Test comment"
}
```

**Expected**: `422 Unprocessable Entity` - "Rating must be between 1 and 5"

#### 2.4 Short Title (Should Fail)
```
Method: POST
URL: {{base_url}}/feedbacks/
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "your-heritage-uuid",
  "rating": 5,
  "title": "Bad",
  "comment": "This is a valid comment with more than 10 characters."
}
```

**Expected**: `422 Unprocessable Entity` - "Title must be at least 5 characters"

---

### Folder 3: Logged-in Tourist Feedback

#### 3.1 Create Feedback (Logged-in)
```
Method: POST
URL: {{base_url}}/feedbacks/tourist
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "booking_id": "your-booking-uuid",
  "heritage_id": "your-heritage-uuid",
  "event_id": null,
  "rating": 4,
  "title": "Good experience overall",
  "comment": "The site was good but some areas need improvement. Guide was knowledgeable."
}
```

**Expected**: `201 Created` with feedback details

#### 3.2 Get My Feedbacks
```
Method: GET
URL: {{base_url}}/feedbacks/my
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected**: `200 OK` with list of tourist's feedbacks (including hidden ones)

#### 3.3 Try Without Auth (Should Fail)
```
Method: GET
URL: {{base_url}}/feedbacks/my
```

**Expected**: `401 Unauthorized`

#### 3.4 Try with Guide Token (Should Fail)
```
Method: POST
URL: {{base_url}}/feedbacks/tourist
Headers:
  Authorization: Bearer {{guide_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "booking_id": "booking-uuid",
  "heritage_id": "heritage-uuid",
  "rating": 5,
  "title": "Test",
  "comment": "Test comment"
}
```

**Expected**: `403 Forbidden` - "Only tourists can submit feedback"

---

### Folder 4: Admin Moderation

#### 4.1 View All Feedbacks
```
Method: GET
URL: {{base_url}}/feedbacks/
Headers:
  Authorization: Bearer {{admin_token}}
```

**Expected**: `200 OK` with all feedbacks (visible and hidden)

#### 4.2 Approve Feedback
```
Method: PATCH
URL: {{base_url}}/feedbacks/{{feedback_id}}/approve
Headers:
  Authorization: Bearer {{admin_token}}
```

**Expected**: `200 OK` with updated feedback (`is_visible: true`)

#### 4.3 Verify Public Visibility
```
Method: GET
URL: {{base_url}}/feedbacks/heritage/{{heritage_id}}
```

**Expected**: `200 OK` with approved feedback now visible

#### 4.4 Hide Feedback
```
Method: PATCH
URL: {{base_url}}/feedbacks/{{feedback_id}}/hide
Headers:
  Authorization: Bearer {{admin_token}}
```

**Expected**: `200 OK` with updated feedback (`is_visible: false`)

#### 4.5 Verify Hidden from Public
```
Method: GET
URL: {{base_url}}/feedbacks/heritage/{{heritage_id}}
```

**Expected**: `200 OK` with empty array or without the hidden feedback

#### 4.6 Try Approve Without Auth (Should Fail)
```
Method: PATCH
URL: {{base_url}}/feedbacks/{{feedback_id}}/approve
```

**Expected**: `401 Unauthorized`

#### 4.7 Try Approve with Tourist Token (Should Fail)
```
Method: PATCH
URL: {{base_url}}/feedbacks/{{feedback_id}}/approve
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected**: `403 Forbidden` - "Only admins can approve feedbacks"

---

## Environment Variables

Create Postman environment:

```
base_url: http://localhost:8000
tourist_token: <paste_tourist_jwt>
guide_token: <paste_guide_jwt>
admin_token: <paste_admin_jwt>
heritage_id: <paste_heritage_uuid>
event_id: <paste_event_uuid>
booking_id: <paste_booking_uuid>
feedback_id: <paste_feedback_uuid>
```

---

## Complete Test Flow

### Scenario 1: Guest Tourist Journey
1. Create feedback with reference code
2. Check public feedbacks (empty - not approved yet)
3. Admin approves feedback
4. Check public feedbacks again (feedback now visible)

### Scenario 2: Logged-in Tourist Journey
1. Login as tourist → Get JWT
2. Create feedback with booking_id
3. View own feedbacks (see feedback with is_visible: false)
4. Admin approves
5. View own feedbacks again (see is_visible: true)
6. Check public feedbacks (feedback visible)

### Scenario 3: Admin Moderation Journey
1. Login as admin → Get JWT
2. View all feedbacks
3. Approve some feedbacks
4. Hide inappropriate feedback
5. Verify public visibility changes

### Scenario 4: Validation Testing
1. Try rating 0 (fail)
2. Try rating 6 (fail)
3. Try short title (fail)
4. Try short comment (fail)
5. Try duplicate feedback (fail)

---

## cURL Examples

### Create Feedback (Guest)
```bash
curl -X POST http://localhost:8000/feedbacks/ \
  -H "Content-Type: application/json" \
  -d '{
    "reference_code": "TRP-ABC123",
    "heritage_id": "heritage-uuid",
    "rating": 5,
    "title": "Excellent site",
    "comment": "Very well maintained and informative."
  }'
```

### Get Public Feedbacks
```bash
curl -X GET http://localhost:8000/feedbacks/heritage/HERITAGE_UUID
```

### Create Feedback (Logged-in)
```bash
curl -X POST http://localhost:8000/feedbacks/tourist \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "booking-uuid",
    "heritage_id": "heritage-uuid",
    "rating": 4,
    "title": "Good experience",
    "comment": "Overall good but some improvements needed."
  }'
```

### Get My Feedbacks
```bash
curl -X GET http://localhost:8000/feedbacks/my \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN"
```

### Admin Approve
```bash
curl -X PATCH http://localhost:8000/feedbacks/FEEDBACK_UUID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Admin Hide
```bash
curl -X PATCH http://localhost:8000/feedbacks/FEEDBACK_UUID/hide \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Expected HTTP Status Codes

| Endpoint | Success | Common Errors |
|----------|---------|---------------|
| GET /feedbacks/heritage/{id} | 200 | - |
| GET /feedbacks/event/{id} | 200 | - |
| POST /feedbacks/ | 201 | 400 (duplicate/invalid), 422 (validation) |
| POST /feedbacks/tourist | 201 | 401 (no auth), 403 (not tourist), 400 (duplicate) |
| GET /feedbacks/my | 200 | 401 (no auth), 403 (not tourist) |
| GET /feedbacks/ | 200 | 401 (no auth), 403 (not admin) |
| PATCH /feedbacks/{id}/approve | 200 | 403 (not admin), 404 (not found) |
| PATCH /feedbacks/{id}/hide | 200 | 403 (not admin), 404 (not found) |

---

## Troubleshooting

**Issue**: 400 - Invalid booking reference  
**Solution**: Ensure booking exists with that reference code

**Issue**: 400 - Feedback can only be submitted for confirmed bookings  
**Solution**: Booking status must be "confirmed" or "completed"

**Issue**: 400 - Feedback already submitted  
**Solution**: Each booking can only have one feedback

**Issue**: 422 - Rating validation error  
**Solution**: Rating must be 1, 2, 3, 4, or 5

**Issue**: 422 - Title too short  
**Solution**: Title must be at least 5 characters

**Issue**: 422 - Comment too short  
**Solution**: Comment must be at least 10 characters

**Issue**: Empty public feedbacks  
**Solution**: Admin must approve feedbacks first (is_visible = true)

---

## Quick Smoke Test Checklist

- [ ] Guest can create feedback with reference code
- [ ] Logged-in tourist can create feedback
- [ ] Duplicate feedback is rejected
- [ ] Invalid rating (0 or 6) is rejected
- [ ] Short title/comment is rejected
- [ ] Public feedbacks only show approved ones
- [ ] Tourist can view own feedbacks (all statuses)
- [ ] Admin can view all feedbacks
- [ ] Admin can approve feedback
- [ ] Admin can hide feedback
- [ ] Approved feedback appears in public endpoint
- [ ] Hidden feedback disappears from public endpoint

---

**Status**: Ready for Postman Testing ✅
