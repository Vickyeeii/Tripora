# Heritage Module - Endpoint Usage Map by Role

## 🔐 Authentication Endpoints (All Roles)

### Login/Register
- **Endpoint**: `POST /auth/login`
- **Frontend**: `frontend/src/pages/Login.jsx`
- **Used by**: Admin, Guide, Tourist
- **API Call**: `authAPI.login(data)`

---

## 👨‍💼 ADMIN Role Endpoints

### 1. View All Heritage (with filters)
- **Endpoint**: `GET /heritage/`
- **Frontend**: `frontend/src/pages/HeritageList.jsx`
- **API Call**: `heritageAPI.getAll()`
- **Access**: Admin sees ALL heritage (active, inactive, deleted)
- **Features**: Filter buttons (Active/Inactive/Deleted/All)

### 2. View Heritage Detail
- **Endpoint**: `GET /heritage/{id}`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx`
- **API Call**: `heritageAPI.getById(id)`
- **Access**: Admin can view ANY heritage

### 3. Approve Heritage
- **Endpoint**: `PATCH /heritage/{id}/approve`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx` (Admin Actions sidebar)
- **API Call**: `heritageAPI.approve(id)`
- **Button**: "Approve Site" (green button, shows when is_active=false)

### 4. Disable Heritage
- **Endpoint**: `PATCH /heritage/{id}/disable`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx` (Admin Actions sidebar)
- **API Call**: `heritageAPI.disable(id)`
- **Button**: "Disable Site" (amber button, shows when is_active=true)

### 5. Delete Heritage (Soft Delete)
- **Endpoint**: `PATCH /heritage/{id}/delete`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx` (Admin Actions sidebar)
- **API Call**: `heritageAPI.delete(id)`
- **Button**: "Delete Site" (red button, with confirmation modal)

### 6. Generate QR Code
- **Endpoint**: `POST /heritage/{id}/qr`
- **Frontend**: `frontend/src/pages/HeritageCreate.jsx` (auto-called after creation)
- **API Call**: `heritageAPI.generateQR(id)`
- **Access**: Admin can generate QR for any heritage

### 7. Download QR Code
- **Endpoint**: N/A (frontend only)
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx` (QR Code sidebar)
- **Button**: "Download QR Code" (shows in QR card)

---

## 🗺️ GUIDE Role Endpoints

### 1. View Own Heritage Only
- **Endpoint**: `GET /heritage/`
- **Frontend**: `frontend/src/pages/HeritageList.jsx`
- **API Call**: `heritageAPI.getAll()`
- **Access**: Guide sees ONLY their own heritage (all statuses: active, pending, deleted)
- **Features**: Status badges (Active/Pending/Deleted), "Add Site" button

### 2. View Heritage Detail
- **Endpoint**: `GET /heritage/{id}`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx`
- **API Call**: `heritageAPI.getById(id)`
- **Access**: Guide can view own heritage regardless of status

### 3. Create Heritage
- **Endpoint**: `POST /heritage/`
- **Frontend**: `frontend/src/pages/HeritageCreate.jsx`
- **API Call**: `heritageAPI.create(data)`
- **Button**: "Add Site" button in HeritageList.jsx
- **Form Fields**:
  - name (required)
  - description (required)
  - short_description
  - historical_overview
  - cultural_significance
  - best_time_to_visit
  - location_map (Leaflet map click-to-select)

### 4. Update Heritage
- **Endpoint**: `PUT /heritage/{id}`
- **Frontend**: NOT YET IMPLEMENTED (TODO: Add edit page)
- **API Call**: `heritageAPI.update(id, data)`
- **Access**: Guide can update ONLY own heritage

### 5. Add Photos
- **Endpoint**: `POST /heritage/{id}/photos`
- **Frontend**: `frontend/src/pages/HeritageCreate.jsx` (during creation)
- **API Call**: `heritageAPI.addPhoto(id, imageUrl)`
- **Process**: 
  1. Upload to Cloudinary
  2. Get secure_url
  3. Call addPhoto with URL

### 6. Add Safety Rules
- **Endpoint**: `POST /heritage/{id}/rules`
- **Frontend**: `frontend/src/pages/HeritageCreate.jsx` (during creation)
- **API Call**: `heritageAPI.addRule(id, ruleText)`
- **Features**: Dynamic add/remove rule inputs

### 7. Generate QR Code
- **Endpoint**: `POST /heritage/{id}/qr`
- **Frontend**: `frontend/src/pages/HeritageCreate.jsx` (auto-called after creation)
- **API Call**: `heritageAPI.generateQR(id)`
- **Access**: Guide can generate QR for own heritage

### 8. Download QR Code
- **Endpoint**: N/A (frontend only)
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx` (QR Code sidebar)
- **Button**: "Download QR Code" (shows in QR card)

---

## 🧳 TOURIST Role Endpoints

### 1. View Active Heritage Only
- **Endpoint**: `GET /heritage/`
- **Frontend**: `frontend/src/pages/HeritageList.jsx`
- **API Call**: `heritageAPI.getAll()`
- **Access**: Tourist sees ONLY active, non-deleted heritage
- **Features**: No filters, no "Add Site" button, no status badges

### 2. View Heritage Detail
- **Endpoint**: `GET /heritage/{id}`
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx`
- **API Call**: `heritageAPI.getById(id)`
- **Access**: Tourist can view ONLY active, non-deleted heritage
- **Features**: No admin actions, no QR download

### 3. Scan QR Code (Public Access)
- **Endpoint**: `GET /heritage/{id}` (no auth required)
- **Frontend**: `frontend/src/pages/HeritageDetail.jsx`
- **API Call**: `heritageAPI.getById(id)`
- **Access**: Anyone with QR code can view active heritage

---

## 📊 Endpoint Summary by Role

### Admin (7 endpoints)
```
✅ GET /heritage/                    → HeritageList.jsx
✅ GET /heritage/{id}                → HeritageDetail.jsx
✅ PATCH /heritage/{id}/approve      → HeritageDetail.jsx (Approve button)
✅ PATCH /heritage/{id}/disable      → HeritageDetail.jsx (Disable button)
✅ PATCH /heritage/{id}/delete       → HeritageDetail.jsx (Delete button)
✅ POST /heritage/{id}/qr            → HeritageCreate.jsx (auto-called)
✅ Download QR                       → HeritageDetail.jsx (Download button)
```

### Guide (8 endpoints)
```
✅ GET /heritage/                    → HeritageList.jsx
✅ GET /heritage/{id}                → HeritageDetail.jsx
✅ POST /heritage/                   → HeritageCreate.jsx (Create form)
✅ PUT /heritage/{id}                → HeritageEdit.jsx (Edit form)
✅ POST /heritage/{id}/photos        → HeritageCreate.jsx (Photo upload)
✅ POST /heritage/{id}/rules         → HeritageCreate.jsx (Rules input)
✅ POST /heritage/{id}/qr            → HeritageCreate.jsx (auto-called)
✅ Download QR                       → HeritageDetail.jsx (Download button)
```

### Tourist (2 endpoints)
```
✅ GET /heritage/                    → HeritageList.jsx
✅ GET /heritage/{id}                → HeritageDetail.jsx
```

---

## 🎯 Frontend Page Breakdown

### `frontend/src/pages/HeritageList.jsx`
**Used by**: Admin, Guide, Tourist

**Endpoints called**:
- `GET /heritage/` - Fetches all heritage (backend filters by role)

**Role-specific features**:
- **Admin**: Shows filters (Active/Inactive/Deleted/All), status badges
- **Guide**: Shows "Add Site" button, status badges, only own heritage
- **Tourist**: No filters, no buttons, no badges, only active heritage

---

### `frontend/src/pages/HeritageDetail.jsx`
**Used by**: Admin, Guide, Tourist

**Endpoints called**:
- `GET /heritage/{id}` - Fetches single heritage
- `PATCH /heritage/{id}/approve` - Admin only
- `PATCH /heritage/{id}/disable` - Admin only
- `PATCH /heritage/{id}/delete` - Admin only

**Role-specific features**:
- **Admin**: Admin Actions sidebar (Approve/Disable/Delete buttons)
- **Guide**: QR download button (own heritage only)
- **Tourist**: View only, no actions

---

### `frontend/src/pages/HeritageCreate.jsx`
**Used by**: Guide only

**Endpoints called**:
1. `POST /heritage/` - Create heritage
2. `POST /heritage/{id}/photos` - Add photos (loop for multiple)
3. `POST /heritage/{id}/rules` - Add rules (loop for multiple)
4. `POST /heritage/{id}/qr` - Generate QR code

**Flow**:
1. Guide fills form
2. Clicks "Create Heritage Site"
3. Backend creates heritage (is_active=false)
4. Frontend uploads photos to Cloudinary
5. Frontend calls addPhoto for each photo
6. Frontend calls addRule for each rule
7. Frontend calls generateQR
8. Navigate to HeritageDetail page

---

### `frontend/src/pages/HeritageEdit.jsx`
**Used by**: Guide only

**Endpoints called**:
- `GET /heritage/{id}` - Fetches heritage to edit
- `PUT /heritage/{id}` - Updates heritage

**Features**:
- Pre-filled form with existing data
- Update all text fields
- Update location via Leaflet map
- Cannot edit photos/rules (only text fields and location)
- Navigate back to detail page after save

---

## 🔄 API Service (`frontend/src/services/api.js`)

All endpoints are defined in `heritageAPI` object:

```javascript
export const heritageAPI = {
  getAll: () => api.get('/heritage/'),                              // All roles
  getById: (id) => api.get(`/heritage/${id}`),                      // All roles
  create: (data) => api.post('/heritage/', data),                   // Guide only
  update: (id, data) => api.put(`/heritage/${id}`, data),          // Guide only (NOT USED YET)
  approve: (id) => api.patch(`/heritage/${id}/approve`),           // Admin only
  disable: (id) => api.patch(`/heritage/${id}/disable`),           // Admin only
  delete: (id) => api.patch(`/heritage/${id}/delete`),             // Admin only
  addPhoto: (id, imageUrl) => api.post(`/heritage/${id}/photos`, { image_url: imageUrl }),  // Guide only
  addRule: (id, ruleText) => api.post(`/heritage/${id}/rules`, { rule_text: ruleText }),    // Guide only
  generateQR: (id) => api.post(`/heritage/${id}/qr`),              // Admin/Guide
};
```

---

## 📱 Navigation

### Navbar (`frontend/src/components/dashboard/DashboardLayout.jsx`)
- **Heritage Link**: Available to ALL roles (Admin, Guide, Tourist)
- **Route**: `/heritage`
- **Destination**: HeritageList.jsx

---

## 🚦 Routes (`frontend/src/App.jsx`)

```javascript
<Route path="/heritage" element={<ProtectedRoute><HeritageList /></ProtectedRoute>} />
<Route path="/heritage/create" element={<ProtectedRoute><HeritageCreate /></ProtectedRoute>} />
<Route path="/heritage/:id/edit" element={<ProtectedRoute><HeritageEdit /></ProtectedRoute>} />
<Route path="/heritage/:id" element={<ProtectedRoute><HeritageDetail /></ProtectedRoute>} />
```

All routes are protected (require login).

**Note**: `/heritage/:id/edit` must be defined BEFORE `/heritage/:id` to avoid route conflicts.

---

## 🎉 Implementation Complete

All heritage endpoints are now fully implemented in the frontend:
- ✅ HeritageList.jsx
- ✅ HeritageDetail.jsx  
- ✅ HeritageCreate.jsx
- ✅ HeritageEdit.jsx

**Edit Button Location**: HeritageDetail.jsx (top right, next to Back button, guide only, own heritage only)

---

## 🎨 UI Components Used

### Toast (`frontend/src/components/ui/Toast.jsx`)
- Used in: HeritageList, HeritageDetail, HeritageCreate
- Success/Error notifications

### ConfirmModal (`frontend/src/components/ui/ConfirmModal.jsx`)
- Used in: HeritageDetail (Admin delete/disable actions)
- Confirmation dialogs

### Leaflet Map
- Used in: HeritageDetail (display), HeritageCreate (location picker)
- Interactive maps

---

## 📝 Summary

**Total Endpoints**: 10
- **Admin uses**: 7 endpoints
- **Guide uses**: 8 endpoints (all implemented)
- **Tourist uses**: 2 endpoints

**Frontend Pages**: 4
- HeritageList.jsx (all roles)
- HeritageDetail.jsx (all roles, different features)
- HeritageCreate.jsx (guide only)
- HeritageEdit.jsx (guide only)

**Status**: ✅ All endpoints fully implemented!
