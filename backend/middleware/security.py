from jose import JWTError
from datetime import datetime, timedelta
import hashlib
import bcrypt
from jose import jwt
from middleware.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

def _pre_hash(password: str) -> bytes:
    """Pre-hash password with SHA256 to handle long passwords"""
    return hashlib.sha256(password.encode("utf-8")).digest()


def hash_password(password: str) -> str:
    print("using hash method")
    pre_hashed = _pre_hash(password)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = _pre_hash(plain_password)
    return bcrypt.checkpw(pre_hashed, hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {**data, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "exp": expire,
        "type": "refresh"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Optional safety check
        if payload.get("type") == "refresh":
            return None

        return payload

    except JWTError:
        return None