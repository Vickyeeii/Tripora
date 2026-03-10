from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from auth.models import Tourist, Guide, RefreshToken
from middleware.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from middleware.auth_utils import get_user_by_email
from middleware.config import REFRESH_TOKEN_EXPIRE_DAYS

# login
def authenticate_user(db: Session, email: str, password: str):
    user, role = get_user_by_email(db, email)

    if not user or not verify_password(password, user.password_hash):
        return None

    if role == "guide" and not user.status:
        raise ValueError("Guide account pending admin approval")

    # DELETE OLD REFRESH TOKENS (PASTE THIS BLOCK)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.role == role
    ).delete()
    db.commit()

    # CREATE NEW TOKENS
    access_token = create_access_token(
        {"user_id": str(user.id), "role": role}
    )

    refresh_token_value = create_refresh_token()
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh_token = RefreshToken(
        user_id=user.id,
        role=role,
        token=refresh_token_value,
        expires_at=expires_at,
    )

    db.add(refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_value,
        "role": role,
        "user_id": str(user.id),
    }

# refresh token

def refresh_access_token(db: Session, refresh_token: str):
    token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == refresh_token,
            RefreshToken.expires_at > datetime.utcnow(),
        )
        .first()
    )

    if not token:
        raise ValueError("Invalid or expired refresh token")

    return create_access_token(
        {"user_id": str(token.user_id), "role": token.role}
    )


# Tourist signup
def register_tourist(db: Session, data):
    if db.query(Tourist).filter(Tourist.email == data.email).first():
        raise ValueError("Email already registered")

    tourist = Tourist(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        country=data.country,
        preferred_language=data.preferred_language,
    )

    db.add(tourist)
    db.commit()
    db.refresh(tourist)
    return tourist


# Guide signup
def register_guide(db: Session, data):
    if db.query(Guide).filter(Guide.email == data.email).first():
        raise ValueError("Email already registered")

    guide = Guide(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        address=data.address,
        status=False,
        approved_by=None,
    )

    db.add(guide)
    db.commit()
    db.refresh(guide)
    return guide

#logout

def logout_user(db: Session, refresh_token: str):
    token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token
    ).first()

    if not token:
        raise ValueError("Invalid refresh token")

    db.delete(token)
    db.commit()


