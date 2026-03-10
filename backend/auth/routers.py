from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from middleware.db import get_db
from auth.schemas import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    TouristSignupRequest,
    GuideSignupRequest,
    LogoutRequest,
)
from auth.services import (
    authenticate_user,
    refresh_access_token,
    register_tourist,
    register_guide,
    logout_user,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = authenticate_user(db, data.email, data.password)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )


@router.post("/refresh")
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        new_access_token = refresh_access_token(db, data.refresh_token)
        return {"access_token": new_access_token}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/tourist/signup")
def tourist_signup(data: TouristSignupRequest, db: Session = Depends(get_db)):
    try:
        register_tourist(db, data)
        return {"message": "Tourist registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/guide/signup")
def guide_signup(data: GuideSignupRequest, db: Session = Depends(get_db)):
    try:
        register_guide(db, data)
        return {
            "message": "Guide registration submitted. Await admin approval."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    try:
        logout_user(db, data.refresh_token)
        return {"message": "Logged out successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

