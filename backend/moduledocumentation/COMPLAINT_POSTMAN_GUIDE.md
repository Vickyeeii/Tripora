# Complaint Module - Postman Testing Guide

## Setup

**Base URL**: `http://localhost:8000`

**Required Tokens**:
- Tourist JWT (from login)
- Guide JWT (from login)
- Admin JWT (from login)

---

## Collection: Complaints

### Folder 1: Guest Tourist Complaints

#### 1.1 Create Complaint (Guest)
```
Method: POST
URL: {{base_url}}/complaints/
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "reference_code": "TRP-ABC123",
  "heritage_id": "your-heritage-uuid",
  "subject": "Poor maintenance at site",
  "description": "The heritage site was not well maintained. Broken stairs and no proper signage found."
}
```

**Expected**: `201 Created` with complaint details

#### 1.2 Track Complaint (Guest)
```
Method: GET
URL: {{base_url}}/complaints/track?reference=TRP-ABC123
```

**Expected**: `200 OK` with complaint status

---

### Folder 2: Logged-in Tourist Complaints

#### 2.1 Create Complaint (Logged-in)
```
Method: POST
URL: {{base_url}}/complaints/tourist
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "heritage_id": "your-heritage-uuid",
  "subject": "Guide was unprofessional",
  "description": "The guide provided incorrect historical information and was rude to visitors."
}
```

**Expected**: `201 Created` with `tourist_id` set

#### 2.2 Get My Complaints
```
Method: GET
URL: {{base_url}}/complaints/my
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected**: `200 OK` with list of tourist's complaints

#### 2.3 Try Without Auth (Should Fail)
```
Method: GET
URL: {{base_url}}/complaints/my
```

**Expected**: `401 Unauthorized`

---

### Folder 3: Guide Complaints

#### 3.1 View Heritage Complaints
```
Method: GET
URL: {{base_url}}/complaints/guide/my-heritage
Headers:
  Authorization: Bearer {{guide_token}}
```

**Expected**: `200 OK` with complaints related to guide's heritage

#### 3.2 Try to Create Complaint (Should Fail)
```
Method: POST
URL: {{base_url}}/complaints/tourist
Headers:
  Authorization: Bearer {{guide_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "subject": "Test",
  "description": "Test complaint"
}
```

**Expected**: `403 Forbidden`

---

### Folder 4: Admin Complaints

#### 4.1 View All Complaints
```
Method: GET
URL: {{base_url}}/complaints/
Headers:
  Authorization: Bearer {{admin_token}}
```

**Expected**: `200 OK` with all complaints

#### 4.2 Update Complaint Status
```
Method: PATCH
URL: {{base_url}}/complaints/{{complaint_id}}/status
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "status": "in_progress"
}
```

**Expected**: `200 OK` with updated complaint

#### 4.3 Add Admin Reply
```
Method: PATCH
URL: {{base_url}}/complaints/{{complaint_id}}/reply
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "admin_reply": "We have investigated this issue and taken corrective action. Thank you for bringing this to our attention."
}
```

**Expected**: `200 OK` with updated complaint

#### 4.4 Update Status (All Options)
Test each status:
- `"status": "open"`
- `"status": "in_progress"`
- `"status": "resolved"`
- `"status": "closed"`

---

## Validation Testing

### Test 1: Short Subject (Should Fail)
```
POST {{base_url}}/complaints/
Body:
{
  "reference_code": "TRP-ABC123",
  "subject": "Bad",
  "description": "This is a valid description with more than 10 characters."
}
```

**Expected**: `422 Unprocessable Entity` - Subject too short

### Test 2: Short Description (Should Fail)
```
POST {{base_url}}/complaints/
Body:
{
  "reference_code": "TRP-ABC123",
  "subject": "Valid subject here",
  "description": "Short"
}
```

**Expected**: `422 Unprocessable Entity` - Description too short

### Test 3: Invalid Reference Code (Should Fail)
```
POST {{base_url}}/complaints/
Body:
{
  "reference_code": "INVALID-CODE",
  "subject": "Valid subject",
  "description": "Valid description with enough characters."
}
```

**Expected**: `400 Bad Request` - Invalid booking reference

### Test 4: Invalid Status (Should Fail)
```
PATCH {{base_url}}/complaints/{{complaint_id}}/status
Headers: Authorization: Bearer {{admin_token}}
Body:
{
  "status": "invalid_status"
}
```

**Expected**: `422 Unprocessable Entity` - Invalid status value

---

## Environment Variables

Create Postman environment:

```
base_url: http://localhost:8000
tourist_token: <paste_tourist_jwt>
guide_token: <paste_guide_jwt>
admin_token: <paste_admin_jwt>
complaint_id: <paste_complaint_uuid>
```

---

## Complete Test Flow

### Scenario 1: Guest Tourist Journey
1. Create complaint with reference code
2. Track complaint status
3. Admin updates status to "in_progress"
4. Admin adds reply
5. Guest tracks again to see updates

### Scenario 2: Logged-in Tourist Journey
1. Login as tourist → Get JWT
2. Create complaint (no reference code needed)
3. View own complaints
4. Admin updates status
5. Tourist views complaints again to see update

### Scenario 3: Guide Journey
1. Login as guide → Get JWT
2. View complaints for own heritage
3. See complaint details
4. (Cannot reply - admin only)

### Scenario 4: Admin Journey
1. Login as admin → Get JWT
2. View all complaints
3. Update complaint status
4. Add admin reply
5. Verify updates

---

## cURL Examples

### Create Complaint (Guest)
```bash
curl -X POST http://localhost:8000/complaints/ \
  -H "Content-Type: application/json" \
  -d '{
    "reference_code": "TRP-ABC123",
    "subject": "Poor maintenance",
    "description": "The site was not well maintained."
  }'
```

### Track Complaint
```bash
curl -X GET "http://localhost:8000/complaints/track?reference=TRP-ABC123"
```

### Create Complaint (Logged-in)
```bash
curl -X POST http://localhost:8000/complaints/tourist \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "heritage_id": "heritage-uuid",
    "subject": "Guide was rude",
    "description": "The guide was unprofessional."
  }'
```

### Get My Complaints
```bash
curl -X GET http://localhost:8000/complaints/my \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN"
```

### Admin Update Status
```bash
curl -X PATCH http://localhost:8000/complaints/COMPLAINT_UUID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### Admin Add Reply
```bash
curl -X PATCH http://localhost:8000/complaints/COMPLAINT_UUID/reply \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"admin_reply": "We have investigated and taken action."}'
```

---

## Expected HTTP Status Codes

| Endpoint | Success | Common Errors |
|----------|---------|---------------|
| POST /complaints/ | 201 | 400 (invalid data), 422 (validation) |
| GET /complaints/track | 200 | 404 (not found) |
| POST /complaints/tourist | 201 | 401 (no auth), 403 (not tourist) |
| GET /complaints/my | 200 | 401 (no auth), 403 (not tourist) |
| GET /complaints/guide/my-heritage | 200 | 401 (no auth), 403 (not guide) |
| GET /complaints/ | 200 | 401 (no auth), 403 (not admin) |
| PATCH /complaints/{id}/status | 200 | 403 (not admin), 404 (not found) |
| PATCH /complaints/{id}/reply | 200 | 403 (not admin), 404 (not found) |

---

## Troubleshooting

**Issue**: 401 Unauthorized  
**Solution**: Check JWT token validity and expiration

**Issue**: 403 Forbidden  
**Solution**: Verify correct role token for endpoint

**Issue**: 404 Not Found (track)  
**Solution**: Verify reference code is correct

**Issue**: 400 Invalid reference code  
**Solution**: Ensure booking with that reference exists

**Issue**: 422 Validation Error  
**Solution**: Check subject (min 5 chars) and description (min 10 chars)

---

## Quick Smoke Test Checklist

- [ ] Guest can create complaint with reference code
- [ ] Guest can track complaint
- [ ] Logged-in tourist can create complaint
- [ ] Logged-in tourist can view own complaints
- [ ] Guide can view heritage complaints
- [ ] Admin can view all complaints
- [ ] Admin can update status
- [ ] Admin can add reply
- [ ] Validation works (short subject/description fails)
- [ ] Role checks work (tourist can't access admin endpoints)

---

**Status**: Ready for Postman Testing ✅
