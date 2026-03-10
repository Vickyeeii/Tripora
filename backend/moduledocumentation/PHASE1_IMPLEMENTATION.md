# Phase 1 Implementation - User Convenience Layer ✅

## Overview
Phase 1 adds user convenience features WITHOUT modifying core modules or database schemas.

---

## 1️⃣ Tourist Booking History

### Purpose
Registered tourists can view their own booking history through their account.

### Endpoint
**GET** `/bookings/tourist/my-bookings`

**Auth**: JWT required (Tourist role only)

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "reference_code": "TRP-ABC123",
    "heritage_id": "uuid",
    "event_id": null,
    "visitor_name": "John Doe",
    "visitor_phone": "+919876543210",
    "visitor_email": "john@example.com",
    "visit_date": "2025-12-31",
    "visit_time": "10:00:00",
    "people_count": 2,
    "created_by_role": "tourist",
    "status": "confirmed",
    "notes": null,
    "created_at": "2025-12-30T10:00:00"
  }
]
```

**Logic**:
- Extracts `tourist_id` from JWT token
- Returns bookings where:
  - `created_by_role = "tourist"`
  - `created_by_id = tourist_id`
- Ordered by `created_at DESC` (newest first)
- Returns empty array if no bookings

**Access Control**:
- ✅ Tourist (own bookings only)
- ❌ Guide (403 Forbidden)
- ❌ Admin (403 Forbidden)

**Note**: Guest tourists continue using `/bookings/track?reference=XXX` (no change)

---

## 2️⃣ User Profile Management

### Purpose
Allow logged-in users (Tourist/Guide) to view and update their profile.

---

### Get Profile
**GET** `/users/me`

**Auth**: JWT required (Tourist or Guide)

**Tourist Response**: `200 OK`
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "country": "India",
  "preferred_language": "English",
  "created_at": "2025-12-01T10:00:00"
}
```

**Guide Response**: `200 OK`
```json
{
  "id": "uuid",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+919876543211",
  "address": "123 Main St, Kerala",
  "status": true,
  "created_at": "2025-12-01T10:00:00"
}
```

**Access Control**:
- ✅ Tourist (own profile)
- ✅ Guide (own profile)
- ❌ Admin (403 Forbidden - not implemented)

---

### Update Profile
**PUT** `/users/me`

**Auth**: JWT required (Tourist or Guide)

**Tourist Request Body**:
```json
{
  "full_name": "John Updated",
  "phone": "+919876543999",
  "email": "newemail@example.com"
}
```

**Guide Request Body**:
```json
{
  "full_name": "Jane Updated",
  "phone": "+919876543999"
}
```

**Response**: Same as GET `/users/me`

**Editable Fields**:

**Tourist**:
- `full_name` (optional)
- `phone` (optional)
- `email` (optional, checks for duplicates)

**Guide**:
- `full_name` (optional)
- `phone` (optional)

**Validation**:
- Email uniqueness checked (returns 400 if duplicate)
- All fields are optional (partial updates allowed)
- User can only update their own profile

**Access Control**:
- ✅ Tourist (own profile)
- ✅ Guide (own profile)
- ❌ Admin (403 Forbidden)

---

## Files Modified

### 1. Booking Module
**apps/bookings/routers.py**
- Added: `GET /bookings/tourist/my-bookings`

**apps/bookings/services.py**
- Added: `get_tourist_bookings(db, tourist_id)`

### 2. Users Module
**apps/users/schemas.py**
- Added: `TouristProfileResponse`
- Added: `GuideProfileResponse`
- Added: `TouristProfileUpdate`
- Added: `GuideProfileUpdate`

**apps/users/services.py**
- Added: `get_tourist_profile(db, tourist_id)`
- Added: `get_guide_profile(db, guide_id)`
- Added: `update_tourist_profile(db, tourist_id, data)`
- Added: `update_guide_profile(db, guide_id, data)`

**apps/users/routers.py**
- Added: `GET /users/me`
- Added: `PUT /users/me`

---

## Testing Guide (Postman)

### 1. Tourist Booking History

**Request**:
```
GET http://localhost:8000/bookings/tourist/my-bookings
Authorization: Bearer <TOURIST_JWT_TOKEN>
```

**Expected**: List of tourist's bookings or empty array

---

### 2. Get Tourist Profile

**Request**:
```
GET http://localhost:8000/users/me
Authorization: Bearer <TOURIST_JWT_TOKEN>
```

**Expected**: Tourist profile data

---

### 3. Update Tourist Profile

**Request**:
```
PUT http://localhost:8000/users/me
Authorization: Bearer <TOURIST_JWT_TOKEN>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+919999999999"
}
```

**Expected**: Updated tourist profile

---

### 4. Get Guide Profile

**Request**:
```
GET http://localhost:8000/users/me
Authorization: Bearer <GUIDE_JWT_TOKEN>
```

**Expected**: Guide profile data

---

### 5. Update Guide Profile

**Request**:
```
PUT http://localhost:8000/users/me
Authorization: Bearer <GUIDE_JWT_TOKEN>
Content-Type: application/json

{
  "full_name": "Updated Guide Name",
  "phone": "+918888888888"
}
```

**Expected**: Updated guide profile

---

## Error Scenarios

### 403 Forbidden
- Tourist trying to access guide endpoints
- Guide trying to access tourist endpoints
- Admin trying to access profile endpoints

### 404 Not Found
- Profile not found (should not happen with valid JWT)

### 400 Bad Request
- Email already in use (when updating email)

---

## Verification Checklist

✅ Tourist can view own booking history  
✅ Tourist cannot view other tourists' bookings  
✅ Guide/Admin cannot access tourist booking history endpoint  
✅ Tourist can view own profile  
✅ Guide can view own profile  
✅ Tourist can update own profile  
✅ Guide can update own profile  
✅ Email uniqueness validated  
✅ Partial updates work (optional fields)  
✅ No database schema changes  
✅ No modifications to core modules (auth, booking creation, payment, notification)  
✅ Guest tourist tracking still works via reference code

---

## Summary

**Total Endpoints Added**: 3
1. `GET /bookings/tourist/my-bookings` - Tourist booking history
2. `GET /users/me` - Get current user profile
3. `PUT /users/me` - Update current user profile

**Total Service Functions Added**: 5
1. `get_tourist_bookings()`
2. `get_tourist_profile()`
3. `get_guide_profile()`
4. `update_tourist_profile()`
5. `update_guide_profile()`

**Database Changes**: None

**Core Modules Affected**: None (only added convenience layer)

**Status**: ✅ COMPLETE AND READY FOR TESTING
