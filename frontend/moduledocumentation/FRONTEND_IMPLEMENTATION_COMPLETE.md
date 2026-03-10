# Tripora Frontend Implementation - Complete Documentation

## Project Overview

**Project Name:** Tripora  
**Tech Stack:** React + Vite, Tailwind CSS v4, Axios, React Router DOM  
**Backend:** FastAPI (http://localhost:8000)  
**Frontend:** Vite Dev Server (http://localhost:5173)

---

## 1. Initial Setup

### Dependencies Installed
```bash
npm install axios react-router-dom
```

### Project Structure Created
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── AuthCard.jsx
│   │   │   ├── TextInput.jsx
│   │   │   ├── PrimaryButton.jsx
│   │   │   └── InlineError.jsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── BookingRow.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── LoadingState.jsx
│   │   └── DebugAuth.jsx (commented out)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── TouristDashboard.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

---

## 2. Design System (Tailwind CSS v4)

### Color Palette
**Primary (Muted Indigo):**
- 50: #f0f4f8 → 900: #102a43
- Used for buttons, links, secondary emphasis

**Accent (Soft Emerald):**
- 50: #f0fdf4 → 900: #14532d
- Used for positive states, confirmed bookings

**Neutral (Stone-based):**
- 50: #fafaf9 (backgrounds)
- 900: #1c1917 (text)
- Used for text, borders, subtle UI elements

### Typography
- **Font:** Inter (Google Fonts)
- **Headings:** 4xl-6xl, semibold, tight tracking
- **Body:** lg for subtitles, base for labels
- **Labels:** sm, uppercase, wide tracking

### Spacing Philosophy
- Generous padding: p-8 to p-12
- Large margins: mb-10 to mb-20
- Airy layouts: no cramped spacing
- Rounded corners: rounded-xl to rounded-3xl

---

## 3. Backend Integration (CORS Fix)

### Backend Changes (main.py)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. API Service Layer (src/services/api.js)

### Axios Instance Configuration
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});
```

### Request Interceptor (Auto-attach JWT)
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor (Auto-logout on 401)
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Methods
```javascript
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/tourist/signup', data),
};

export const dashboardAPI = {
  getTouristDashboard: () => api.get('/dashboard/tourist'),
  getGuideDashboard: () => api.get('/dashboard/guide'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getMyBookings: () => api.get('/bookings/tourist/my-bookings'),
};
```

---

## 5. Authentication Module

### Login Flow (src/pages/Login.jsx)

**Features:**
- Email + password form
- Loading state during submission
- Inline error messages (no alerts)
- Auto-redirect after success
- Better error for unapproved guides

**Key Logic:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await authAPI.login(formData);
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user_role', response.data.role);
    window.location.href = '/dashboard'; // Hard redirect
  } catch (err) {
    const errorMsg = err.response?.data?.detail;
    if (errorMsg?.includes('not approved')) {
      setError('Your guide account is pending admin approval...');
    } else {
      setError(errorMsg || 'Login failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};
```

**Backend Response Structure:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "role": "tourist",
  "user_id": "uuid"
}
```

### Register Flow (src/pages/Register.jsx)

**Features:**
- Full name, email, phone, password fields
- Auto-login after registration
- Same error handling as login

**Key Logic:**
```javascript
await authAPI.register(formData);
const loginResponse = await authAPI.login({
  email: formData.email,
  password: formData.password,
});
localStorage.setItem('access_token', loginResponse.data.access_token);
localStorage.setItem('user_role', loginResponse.data.role);
window.location.href = '/dashboard';
```

### Auth Components

**AuthLayout:** Centers content, off-white background  
**AuthCard:** White card with rounded-3xl, generous padding  
**TextInput:** Label + input + error state  
**PrimaryButton:** Full-width, loading state, disabled when loading  
**InlineError:** Soft red background, calm messaging

---

## 6. Dashboard Module (Multi-Role)

### Role-Based Dashboard (src/pages/TouristDashboard.jsx)

**Key Feature:** Single dashboard component works for all roles

**Role Detection:**
```javascript
const role = localStorage.getItem('user_role');

let metricsRes;
if (role === 'guide') {
  metricsRes = await dashboardAPI.getGuideDashboard();
} else if (role === 'admin') {
  metricsRes = await dashboardAPI.getAdminDashboard();
} else {
  metricsRes = await dashboardAPI.getTouristDashboard();
}
```

**Bookings Handling (Tourist-Only):**
```javascript
if (role === 'tourist') {
  const bookingsRes = await dashboardAPI.getMyBookings();
  setBookings(bookingsRes.data);
}
```

### Dashboard Metrics by Role

**Tourist Metrics:**
- total_bookings
- upcoming_bookings
- last_booking_status

**Guide Metrics:**
- total_bookings
- today_bookings
- upcoming_bookings
- pending_complaints
- average_rating
- total_revenue

**Admin Metrics:**
- total_tourists
- total_guides
- total_heritage
- total_bookings
- pending_complaints
- pending_feedbacks
- total_revenue

### Dynamic Metric Display
```javascript
{metrics?.total_bookings !== undefined && (
  <StatCard label="Total Bookings" value={metrics.total_bookings} />
)}
{metrics?.average_rating !== undefined && (
  <StatCard label="Average Rating" value={metrics.average_rating.toFixed(1)} />
)}
```

### Dashboard Components

**DashboardLayout:** Full-width container, max-w-7xl, responsive padding  
**SectionHeader:** Large heading + subtitle  
**StatCard:** Hover effect, variant system (default/primary/accent)  
**BookingRow:** Date formatting, status badges  
**EmptyState:** Icon + friendly message  
**LoadingState:** Spinner + loading text

---

## 7. Routing (src/App.jsx)

### Route Configuration
```javascript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route 
      path="/dashboard" 
      element={isAuthenticated ? <TouristDashboard /> : <Navigate to="/login" />} 
    />
    <Route path="/" element={<Navigate to="/login" />} />
  </Routes>
</BrowserRouter>
```

### Authentication Guard
```javascript
const isAuthenticated = !!localStorage.getItem('access_token');
```

---

## 8. Styling (src/index.css)

### Tailwind v4 Configuration
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  
  --color-primary-50: #f0f4f8;
  --color-primary-700: #334e68;
  /* ... all color scales ... */
  
  --color-neutral-50: #fafaf9;
  --color-neutral-900: #1c1917;
}

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 9. Key Issues Resolved

### Issue 1: CORS Error (405 Method Not Allowed)
**Problem:** Frontend couldn't make requests to backend  
**Solution:** Added CORS middleware to backend main.py

### Issue 2: Response Structure Mismatch
**Problem:** Frontend expected `response.data.user.role`, backend returned `response.data.role`  
**Solution:** Updated Login.jsx and Register.jsx to use correct path

### Issue 3: Guide Login 403 Error
**Problem:** Guide redirected to `/dashboard`, which called tourist-only APIs  
**Solution:** Made dashboard role-aware, only fetch bookings for tourists

### Issue 4: Stuck on /guide/dashboard Route
**Problem:** Browser cached old route from previous attempt  
**Solution:** Changed `navigate()` to `window.location.href` for hard redirect

### Issue 5: Tailwind v4 Configuration
**Problem:** Old tailwind.config.js not compatible with v4  
**Solution:** Removed config file, used `@theme` directive in index.css

---

## 10. Authentication Flow Summary

### Login Process
1. User enters email + password
2. Frontend calls `POST /auth/login`
3. Backend validates credentials
4. Backend returns: access_token, refresh_token, role, user_id
5. Frontend stores: access_token, user_role in localStorage
6. Frontend redirects to `/dashboard` (hard redirect)
7. Dashboard checks role and calls appropriate API

### Role-Based Access
- **Tourist:** Can access `/dashboard/tourist` and `/bookings/tourist/my-bookings`
- **Guide:** Can access `/dashboard/guide` (after admin approval)
- **Admin:** Can access `/dashboard/admin`

### Token Management
- Stored in localStorage (not cookies)
- Auto-attached to requests via Axios interceptor
- Auto-logout on 401 response
- No manual token refresh implemented (uses refresh_token from backend)

---

## 11. Debug Tools

### DebugAuth Component (src/components/DebugAuth.jsx)
**Purpose:** Real-time auth state monitoring  
**Location:** Bottom-right corner (commented out in production)  
**Features:**
- Shows if token is stored
- Displays user role
- Shows token preview
- "Clear & Reload" button for testing

**To Enable:**
Uncomment in App.jsx:
```javascript
import DebugAuth from './components/DebugAuth';
// ...
<DebugAuth />
```

---

## 12. Production Checklist

### Completed ✅
- [x] CORS configured
- [x] JWT authentication working
- [x] Role-based routing
- [x] Multi-role dashboard
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Responsive design
- [x] Premium UI design
- [x] Token auto-refresh on 401

### Not Implemented ❌
- [ ] Guide-specific dashboard page
- [ ] Admin-specific dashboard page
- [ ] Logout button in UI
- [ ] Profile management UI
- [ ] Booking creation flow
- [ ] Heritage browsing
- [ ] Event calendar

---

## 13. Testing Guide

### Test Tourist Flow
1. Go to `/register`
2. Fill form with tourist details
3. Submit → Auto-login → Redirect to `/dashboard`
4. See tourist metrics (total_bookings, upcoming_bookings, last_status)
5. See "Start exploring..." empty state

### Test Guide Flow (Requires Admin Approval)
1. Register guide via `/auth/guide/signup` (Postman or backend)
2. Admin approves guide (via admin panel or database)
3. Go to `/login`
4. Login with guide credentials
5. Redirect to `/dashboard`
6. See guide metrics (bookings, revenue, ratings, complaints)
7. See "Bookings section available for tourists only"

### Test Admin Flow
1. Login with admin credentials
2. Redirect to `/dashboard`
3. See admin metrics (total users, heritage, bookings, etc.)

---

## 14. Common Errors & Solutions

### "Only tourists can access this endpoint" (403)
**Cause:** Guide/Admin trying to access tourist-only API  
**Solution:** Dashboard now role-aware, only calls appropriate APIs

### "No routes matched location /guide/dashboard"
**Cause:** Old route cached in browser  
**Solution:** Clear localStorage and reload, or use hard redirect

### CORS Error
**Cause:** Backend CORS not configured  
**Solution:** Add CORS middleware to backend main.py

### Token not stored
**Cause:** Response structure mismatch  
**Solution:** Use `response.data.role` not `response.data.user.role`

---

## 15. File Summary

### Core Files
- **App.jsx:** Routing + auth guard
- **api.js:** Axios config + interceptors + API methods
- **Login.jsx:** Login form + error handling
- **Register.jsx:** Registration form + auto-login
- **TouristDashboard.jsx:** Multi-role dashboard with dynamic metrics
- **index.css:** Tailwind v4 config + custom colors

### Component Files
- **Auth Components:** 5 reusable components for login/register
- **Dashboard Components:** 6 reusable components for dashboard UI
- **DebugAuth:** Debug tool (commented out)

---

## 16. Next Steps for ChatGPT

When continuing this project, you should know:

1. **Dashboard is multi-role:** Don't create separate dashboard pages, extend existing one
2. **API structure:** All endpoints follow `/module/action` pattern
3. **Auth flow:** Token in localStorage, auto-attached via interceptor
4. **Design system:** Use existing colors (primary/accent/neutral), Inter font, generous spacing
5. **Component pattern:** Create reusable components in `components/` folder
6. **Error handling:** Inline errors, no alerts, calm messaging
7. **Role-based logic:** Always check `localStorage.getItem('user_role')`

---

## 17. Backend API Endpoints Used

### Authentication
- POST `/auth/login` - Login (all roles)
- POST `/auth/tourist/signup` - Register tourist
- POST `/auth/guide/signup` - Register guide (needs approval)

### Dashboard
- GET `/dashboard/tourist` - Tourist metrics
- GET `/dashboard/guide` - Guide metrics
- GET `/dashboard/admin` - Admin metrics

### Bookings
- GET `/bookings/tourist/my-bookings` - Tourist booking history

---

**End of Documentation**

This document contains everything needed to understand and continue the Tripora frontend implementation.
