# Event Module - Postman Testing Guide

## 🔧 Setup

### Base URL
```
http://localhost:8000
```

### Get Your Tokens First

#### 1. Login as Guide
```
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=your-guide-email@example.com
password=your-password
```

Save the `access_token` from response.

#### 2. Login as Admin
```
POST http://localhost:8000/auth/login
Content-Type: application/x-www-form-urlencoded

username=admin@example.com
password=admin-password
```

Save the `access_token` from response.

---

## 📝 Test Sequence

### STEP 1: Get Your Approved Heritage ID

```
GET http://localhost:8000/heritage/
```

Find a heritage where:
- `is_active: true` (approved)
- You own it (if you're a guide)

Copy the `id` field.

---

## 🧪 PUBLIC ENDPOINTS (No Auth)

### Test 1: Get Today's Events
```
GET http://localhost:8000/events/today
```

**Expected**: 
- 200 OK
- Array of events (may be empty)
- Only shows events where heritage is approved

---

### Test 2: Get Tomorrow's Events
```
GET http://localhost:8000/events/tomorrow
```

**Expected**:
- 200 OK
- Array of events (may be empty)

---

### Test 3: Get Events by Heritage
```
GET http://localhost:8000/events?heritage_id=YOUR-HERITAGE-UUID
```

Replace `YOUR-HERITAGE-UUID` with actual heritage ID.

**Expected**:
- 200 OK
- Array of events for that heritage (today/tomorrow only)

---

## 🗺️ GUIDE ENDPOINTS (Auth Required)

### Test 4: Create Event (Success Case)

**Prerequisites**:
- Heritage must be approved (`is_active = true`)
- You must own the heritage

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "YOUR-APPROVED-HERITAGE-UUID",
  "title": "Onam Festival 2025",
  "description": "Traditional Onam celebration with cultural programs and feast",
  "event_date": "2025-12-29",
  "start_time": "10:00:00",
  "end_time": "18:00:00",
  "event_type": "festival"
}
```

**Expected**:
- 201 Created
- Returns event object with `id`

**Save the event `id` for next tests!**

---

### Test 5: Create Event (Unapproved Heritage)

**Prerequisites**:
- Create a new heritage (it starts as `is_active = false`)

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "UNAPPROVED-HERITAGE-UUID",
  "title": "Test Event",
  "description": "This should fail",
  "event_date": "2025-12-29",
  "event_type": "notice"
}
```

**Expected**:
- 403 Forbidden
- `"detail": "Heritage is not approved yet"`

---

### Test 6: Create Event (Other Guide's Heritage)

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "OTHER-GUIDE-HERITAGE-UUID",
  "title": "Test Event",
  "description": "This should fail",
  "event_date": "2025-12-29",
  "event_type": "notice"
}
```

**Expected**:
- 403 Forbidden
- `"detail": "You can only create events for your own heritage"`

---

### Test 7: Update Event

```
PUT http://localhost:8000/events/YOUR-EVENT-UUID
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "title": "Updated: Onam Festival 2025",
  "description": "Updated description with more details",
  "event_date": "2025-12-30",
  "start_time": "09:00:00",
  "end_time": "19:00:00",
  "event_type": "festival"
}
```

**Expected**:
- 200 OK
- Returns updated event

---

### Test 8: Update Other's Event (Should Fail)

```
PUT http://localhost:8000/events/OTHER-GUIDE-EVENT-UUID
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "title": "Trying to update",
  "description": "This should fail",
  "event_date": "2025-12-29",
  "event_type": "notice"
}
```

**Expected**:
- 404 Not Found
- `"detail": "You can only update your own events"`

---

### Test 9: Cancel Event

```
PATCH http://localhost:8000/events/YOUR-EVENT-UUID/cancel
Authorization: Bearer YOUR-GUIDE-TOKEN
```

**Expected**:
- 200 OK
- Event returned with `is_active: false`

**Note**: Cancelled events won't appear in public endpoints!

---

## 🛡️ ADMIN ENDPOINTS (Auth Required)

### Test 10: Admin Create Event (Any Heritage)

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-ADMIN-TOKEN
Content-Type: application/json

{
  "heritage_id": "ANY-HERITAGE-UUID",
  "title": "Admin Created Event",
  "description": "Admin can create for any heritage",
  "event_date": "2025-12-29",
  "event_type": "alert"
}
```

**Expected**:
- 201 Created
- Works even if heritage is unapproved

---

### Test 11: Admin Disable Event

```
PATCH http://localhost:8000/events/ANY-EVENT-UUID/disable
Authorization: Bearer YOUR-ADMIN-TOKEN
```

**Expected**:
- 200 OK
- Event `is_active` set to `false`

---

### Test 12: Admin Soft Delete Event

```
PATCH http://localhost:8000/events/ANY-EVENT-UUID/delete
Authorization: Bearer YOUR-ADMIN-TOKEN
```

**Expected**:
- 200 OK
- Event `is_deleted` set to `true`
- Event won't appear in any public queries

---

## 🎯 Event Type Validation

### Test 13: Invalid Event Type

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "YOUR-HERITAGE-UUID",
  "title": "Test",
  "description": "Test",
  "event_date": "2025-12-29",
  "event_type": "invalid_type"
}
```

**Expected**:
- 422 Unprocessable Entity
- Validation error: event_type must be one of: festival, ritual, notice, alert

---

## 📅 Date Testing

### Test 14: Create Event for Today

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "YOUR-HERITAGE-UUID",
  "title": "Today's Event",
  "description": "Event happening today",
  "event_date": "2025-12-28",
  "event_type": "notice"
}
```

Then check:
```
GET http://localhost:8000/events/today
```

**Expected**: Your event appears in the list.

---

### Test 15: Create Event for Tomorrow

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "YOUR-HERITAGE-UUID",
  "title": "Tomorrow's Event",
  "description": "Event happening tomorrow",
  "event_date": "2025-12-29",
  "event_type": "festival"
}
```

Then check:
```
GET http://localhost:8000/events/tomorrow
```

**Expected**: Your event appears in the list.

---

### Test 16: Create Event for Next Week (Won't Show)

```
POST http://localhost:8000/events
Authorization: Bearer YOUR-GUIDE-TOKEN
Content-Type: application/json

{
  "heritage_id": "YOUR-HERITAGE-UUID",
  "title": "Next Week Event",
  "description": "Event next week",
  "event_date": "2026-01-05",
  "event_type": "ritual"
}
```

Then check:
```
GET http://localhost:8000/events/today
GET http://localhost:8000/events/tomorrow
```

**Expected**: Event created but NOT visible in today/tomorrow endpoints.

---

## 🔍 Verification Tests

### Test 17: Verify Heritage Approval Filter

**Step 1**: Create event for approved heritage
```
POST http://localhost:8000/events
{
  "heritage_id": "APPROVED-HERITAGE-UUID",
  "title": "Test Event",
  "description": "Test",
  "event_date": "2025-12-29",
  "event_type": "notice"
}
```

**Step 2**: Check public endpoint
```
GET http://localhost:8000/events/tomorrow
```
**Expected**: Event visible ✅

**Step 3**: Admin disables the heritage
```
PATCH http://localhost:8000/heritage/APPROVED-HERITAGE-UUID/disable
Authorization: Bearer YOUR-ADMIN-TOKEN
```

**Step 4**: Check public endpoint again
```
GET http://localhost:8000/events/tomorrow
```
**Expected**: Event NOT visible ❌ (filtered by heritage approval)

---

## 📊 Complete Test Checklist

### Public Endpoints:
- [ ] GET /events/today
- [ ] GET /events/tomorrow
- [ ] GET /events?heritage_id={id}

### Guide Endpoints:
- [ ] POST /events (success - approved heritage)
- [ ] POST /events (fail - unapproved heritage)
- [ ] POST /events (fail - other's heritage)
- [ ] PUT /events/{id} (success - own event)
- [ ] PUT /events/{id} (fail - other's event)
- [ ] PATCH /events/{id}/cancel

### Admin Endpoints:
- [ ] POST /events (any heritage)
- [ ] PATCH /events/{id}/disable
- [ ] PATCH /events/{id}/delete

### Validation:
- [ ] Invalid event_type
- [ ] Today's event visibility
- [ ] Tomorrow's event visibility
- [ ] Heritage approval filter

---

## 💡 Quick Test Script

Copy-paste this sequence in Postman:

```bash
# 1. Login as guide
POST /auth/login

# 2. Get approved heritage
GET /heritage/

# 3. Create event
POST /events
{
  "heritage_id": "...",
  "title": "Test Event",
  "description": "Testing",
  "event_date": "2025-12-29",
  "event_type": "festival"
}

# 4. View in public
GET /events/tomorrow

# 5. Update event
PUT /events/{event_id}

# 6. Cancel event
PATCH /events/{event_id}/cancel

# 7. Verify cancelled event not visible
GET /events/tomorrow
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ Guide can create events for own approved heritage
- ✅ Guide cannot create for unapproved heritage
- ✅ Guide cannot create for other's heritage
- ✅ Public sees only events for approved heritage
- ✅ Cancelled events don't appear publicly
- ✅ Admin can manage all events
- ✅ Event types validated correctly
- ✅ Date filtering works (today/tomorrow only)

**Your Event module is working correctly!** 🎉
