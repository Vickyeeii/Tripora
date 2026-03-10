# Authenticated Tourist Booking - Quick Reference

## New Endpoint Added

**POST** `/bookings/tourist`

### Purpose
Allow logged-in tourists to create bookings that will appear in their booking history.

### Authentication
- JWT required
- Role: `tourist` only

### Request
```json
POST /bookings/tourist
Authorization: Bearer <TOURIST_JWT_TOKEN>
Content-Type: application/json

{
  "heritage_id": "uuid",
  "event_id": null,
  "visitor_name": "John Doe",
  "visitor_phone": "+919876543210",
  "visitor_email": "john@example.com",
  "visit_date": "2025-12-31",
  "visit_time": "10:00:00",
  "people_count": 2,
  "notes": "Optional notes"
}
```

### Response (201 Created)
```json
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
  "status": "pending",
  "notes": "Optional notes",
  "created_at": "2025-12-30T10:00:00"
}
```

### Behavior
- Sets `created_by_role = "tourist"`
- Sets `created_by_id = tourist_id` (from JWT)
- Booking will appear in `GET /bookings/tourist/my-bookings`

### Error Responses
- `400` - Invalid data or heritage not available
- `403` - Non-tourist trying to access
- `401` - Invalid/expired JWT
- `500` - Server error

---

## Booking Endpoints Summary

| Endpoint | Auth | Role | created_by_id |
|----------|------|------|---------------|
| `POST /bookings/` | No | Guest | NULL |
| `POST /bookings/tourist` | Yes | Tourist | tourist_id |
| `POST /bookings/guide` | Yes | Guide | guide_id |

---

## Testing with Postman

### 1. Create Authenticated Booking
```
Method: POST
URL: http://localhost:8000/bookings/tourist
Headers:
  Authorization: Bearer {{tourist_token}}
  Content-Type: application/json
Body:
{
  "heritage_id": "your-heritage-uuid",
  "visitor_name": "John Doe",
  "visitor_phone": "+919876543210",
  "visit_date": "2025-12-31",
  "people_count": 2
}
```

### 2. Verify in Booking History
```
Method: GET
URL: http://localhost:8000/bookings/tourist/my-bookings
Headers:
  Authorization: Bearer {{tourist_token}}
```

**Expected**: The booking created in step 1 should appear in the list.

---

## cURL Example

```bash
# Create authenticated booking
curl -X POST http://localhost:8000/bookings/tourist \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "heritage_id": "heritage-uuid",
    "visitor_name": "John Doe",
    "visitor_phone": "+919876543210",
    "visit_date": "2025-12-31",
    "people_count": 2
  }'

# Check booking history
curl -X GET http://localhost:8000/bookings/tourist/my-bookings \
  -H "Authorization: Bearer YOUR_TOURIST_TOKEN"
```

---

## Complete Flow

1. **Tourist logs in** → Gets JWT token
2. **Creates booking** → `POST /bookings/tourist` (with JWT)
3. **Booking saved** with `created_by_id = tourist_id`
4. **Views history** → `GET /bookings/tourist/my-bookings`
5. **Sees booking** in the list

---

**Status**: ✅ Complete - Authenticated tourist bookings now supported
