# Quick Production Deployment Guide

## 1. Update requirements.txt

```bash
# Add these to requirements.txt
python-multipart>=0.0.6  # For file uploads
redis>=4.5.0  # For caching
gunicorn>=21.0.0  # Production server
```

## 2. Update main.py with middleware

```python
from middleware.security_middleware import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware
)
from fastapi.middleware.cors import CORSMiddleware

# Add after app creation
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 3. Create production .env

```bash
cp .env.example .env
# Edit .env with production values
```

## 4. Run migrations

```bash
alembic upgrade head
```

## 5. Create admin user

```bash
python scripts/create_admin.py
```

## 6. Run tests

```bash
pip install -r requirements-test.txt
pytest tests/ -v
```

## 7. Start production server

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 8. Verify deployment

```bash
curl http://localhost:8000/health
```

## Common Issues

**Database connection fails**:
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check firewall rules

**JWT errors**:
- Ensure SECRET_KEY is set (min 32 chars)
- Check token expiration settings

**CORS errors**:
- Add frontend URL to ALLOWED_ORIGINS
- Verify credentials setting

## Monitoring

Check logs:
```bash
tail -f logs/tripora.log
tail -f logs/errors.log
```
