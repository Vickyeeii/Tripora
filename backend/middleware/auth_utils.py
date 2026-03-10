from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import UUID

from middleware.db import get_db
from middleware.security import verify_access_token
from auth.models import Admin, Guide, Tourist


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_by_email(db: Session, email: str):
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin:
        return admin, "admin"

    guide = db.query(Guide).filter(Guide.email == email).first()
    if guide:
        return guide, "guide"

    tourist = db.query(Tourist).filter(Tourist.email == email).first()
    if tourist:
        return tourist, "tourist"

    return None, None


def get_current_user(
    token: str = Depends(oauth2_scheme),
):
    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Convert user_id string to UUID for database comparisons
    try:
        user_id_uuid = UUID(user_id)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user_id format",
        )

    return {
        "user_id": user_id_uuid,  # Return UUID object, not string
        "role": role,
    }
