# How to Change QR Code URL

## Current Setup

QR codes now use a configurable base URL from environment variables.

## Configuration File

Edit `.env` file:

```bash
# QR Code Base URL
QR_BASE_URL=https://tripora.app
```

## How to Change

### Option 1: Change in .env (Recommended)
```bash
# For production
QR_BASE_URL=https://tripora.app

# For staging
QR_BASE_URL=https://staging.tripora.app

# For local development
QR_BASE_URL=http://localhost:3000

# For custom domain
QR_BASE_URL=https://yourdomain.com
```

### Option 2: Set Environment Variable
```bash
export QR_BASE_URL=https://yourdomain.com
```

## QR Code Format

The QR code will encode:
```
{QR_BASE_URL}/heritage/{heritage_id}
```

Examples:
- Production: `https://tripora.app/heritage/abc-123-def`
- Staging: `https://staging.tripora.app/heritage/abc-123-def`
- Local: `http://localhost:3000/heritage/abc-123-def`

## Important Notes

1. **Existing QR codes**: Already generated QR codes will NOT change automatically
2. **New QR codes**: Will use the new URL from .env
3. **Regenerate QR codes**: To update existing QR codes, delete and regenerate them

## Regenerating QR Codes

If you change the URL and need to update existing QR codes:

1. Delete existing QR from database (or use admin endpoint)
2. Call `POST /heritage/{id}/qr` again
3. New QR will use updated URL

## Default Value

If `QR_BASE_URL` is not set, it defaults to: `https://tripora.app`

## Restart Required

After changing `.env`, restart the FastAPI server:
```bash
# Stop server (Ctrl+C)
# Start again
uvicorn main:app --reload
```
