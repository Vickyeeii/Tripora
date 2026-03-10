# Phase 1 - Postman Testing Guide

## Setup

1. **Base URL**: `http://localhost:8000`
2. **Get JWT Tokens**: Use existing login endpoints to get tokens for tourist and guide

---

## Collection: Phase 1 - User Convenience

### Folder 1: Tourist Booking History

#### 1.1 Get My Bookings (Tourist)
```
Method: GET
URL: {{base_url}}/bookings/tourist/my-bookings
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected Response (200)**:
```json
[
  {
    "id": "uuid",
    "reference_code": "TRP-ABC123",
    "heritage_id": "uuid",
    "visitor_name": "John Doe",
    "status": "confirmed",
    ...
  }
]
```

**Expected Response (Empty - 200)**:
```json
[]
```

#### 1.2 Try with Guide Token (Should Fail)
```
Method: GET
URL: {{base_url}}/bookings/tourist/my-bookings
Headers:
  Authorization: Bearer {{guide_token}}
```

**Expected Response (403)**:
```json
{
  "detail": "Only tourists can access this endpoint"
}
```

---

### Folder 2: User Profile - Tourist

#### 2.1 Get Tourist Profile
```
Method: GET
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected Response (200)**:
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

#### 2.2 Update Tourist Profile (Full)
```
Method: PUT
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "full_name": "John Updated",
  "phone": "+919999999999",
  "email": "johnupdated@example.com"
}
```

**Expected Response (200)**: Updated profile

#### 2.3 Update Tourist Profile (Partial)
```
Method: PUT
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "phone": "+918888888888"
}
```

**Expected Response (200)**: Profile with updated phone only

#### 2.4 Update with Duplicate Email (Should Fail)
```
Method: PUT
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "email": "existing@example.com"
}
```

**Expected Response (400)**:
```json
{
  "detail": "Email already in use"
}
```

---

### Folder 3: User Profile - Guide

#### 3.1 Get Guide Profile
```
Method: GET
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{guide_token}}
```

**Expected Response (200)**:
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

#### 3.2 Update Guide Profile
```
Method: PUT
URL: {{base_url}}/users/me
Headers:
  Authorization: Bearer {{guide_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "full_name": "Jane Updated",
  "phone": "+917777777777"
}
```

**Expected Response (200)**: Updated guide profile

---

## Environment Variables

Create a Postman environment with:

```
base_url: http://localhost:8000
tourist_token: <paste_tourist_jwt_here>
guide_token: <paste_guide_jwt_here>
admin_token: <paste_admin_jwt_here>
```

---

## Test Scenarios

### Scenario 1: Tourist Journey
1. Login as tourist → Get JWT
2. Create a booking (existing endpoint)
3. Call `GET /bookings/tourist/my-bookings` → See the booking
4. Call `GET /users/me` → See profile
5. Call `PUT /users/me` → Update profile
6. Call `GET /users/me` → Verify changes

### Scenario 2: Guide Journey
1. Login as guide → Get JWT
2. Call `GET /users/me` → See profile
3. Call `PUT /users/me` → Update profile
4. Try `GET /bookings/tourist/my-bookings` → Get 403

### Scenario 3: Cross-Role Access
1. Tourist tries guide endpoints → 403
2. Guide tries tourist booking history → 403
3. Admin tries profile endpoints → 403

---

## Quick Test Commands (cURL)

### Tourist Booking History
```bash
curl -X GET http://localhost:8000/bookings/tourist/my-bookings \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN"
```

### Get Profile
```bash
curl -X GET http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "Updated Name", "phone": "+919999999999"}'
```

---

## Expected HTTP Status Codes

| Scenario | Status Code |
|----------|-------------|
| Success | 200 OK |
| Created | 201 Created |
| Bad Request | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not Found | 404 |
| Server Error | 500 |

---

## Troubleshooting

**Issue**: 401 Unauthorized  
**Solution**: Check if JWT token is valid and not expired

**Issue**: 403 Forbidden  
**Solution**: Check if using correct role token for the endpoint

**Issue**: Empty booking list  
**Solution**: Create a booking first as a registered tourist (with JWT)

**Issue**: Profile not found  
**Solution**: Ensure user exists and JWT is valid

---

**Status**: Ready for Postman Testing ✅
