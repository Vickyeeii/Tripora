# Setup Instructions

## Backend Setup (CORS Fix)

1. Restart the backend server:
```bash
cd backend
# Stop current server (Ctrl+C)
uvicorn main:app --reload
```

The CORS middleware has been added to allow frontend requests.

## Frontend Setup

1. Ensure dependencies are installed:
```bash
cd frontend
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Open browser to: http://localhost:5173

## Test Flow

1. Navigate to `/login` or `/register`
2. Register a new tourist account
3. Auto-login and redirect to `/dashboard`
4. View dashboard metrics

## Troubleshooting

### CORS Error
- Ensure backend has CORS middleware (already added)
- Restart backend server

### Styling Issues
- Clear browser cache
- Check Tailwind config is loaded
- Verify index.css imports are correct

### 401 Errors
- Check token is stored in localStorage
- Verify backend is running on port 8000
- Check API baseURL in services/api.js
