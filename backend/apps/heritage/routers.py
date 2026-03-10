from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from middleware.security import verify_access_token
from apps.heritage import services, schemas

router = APIRouter(prefix="/heritage", tags=["Heritage"])
security = HTTPBearer(auto_error=False)


@router.post("/", response_model=schemas.HeritageResponse, status_code=201)
def create(data: schemas.HeritageCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can create heritage sites")
    try:
        return services.create_heritage(db, user["user_id"], data)
    except Exception as e:
        raise HTTPException(500, f"Failed to create heritage: {str(e)}")


@router.put("/{heritage_id}", response_model=schemas.HeritageResponse)
def update(heritage_id: UUID, data: schemas.HeritageUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can update heritage sites")
    try:
        return services.update_heritage(db, heritage_id, user["user_id"], data)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to update heritage: {str(e)}")


@router.patch("/{heritage_id}/approve", response_model=schemas.HeritageResponse)
def approve(heritage_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can approve heritage sites")
    try:
        return services.toggle_heritage_status(db, heritage_id, True)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to approve heritage: {str(e)}")


@router.patch("/{heritage_id}/disable", response_model=schemas.HeritageResponse)
def disable(heritage_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can disable heritage sites")
    try:
        return services.toggle_heritage_status(db, heritage_id, False)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to disable heritage: {str(e)}")


@router.post("/{heritage_id}/photos", status_code=201)
def add_photo(heritage_id: UUID, data: schemas.PhotoCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can add photos")
    try:
        return services.add_photo(db, heritage_id, data.image_url)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to add photo: {str(e)}")


@router.delete("/{heritage_id}/photos/{photo_id}", status_code=200)
def delete_photo(heritage_id: UUID, photo_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can delete photos")
    try:
        return services.delete_photo(db, heritage_id, photo_id, user["user_id"])
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to delete photo: {str(e)}")


@router.post("/{heritage_id}/rules", status_code=201)
def add_rule(heritage_id: UUID, data: schemas.SafetyRuleCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] != "guide":
        raise HTTPException(403, "Only guides can add safety rules")
    try:
        return services.add_rule(db, heritage_id, data.rule_text)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to add safety rule: {str(e)}")


@router.post("/{heritage_id}/qr", status_code=201)
def generate_qr(heritage_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user["role"] not in ["admin", "guide"]:
        raise HTTPException(403, "Only admins and guides can generate QR codes")
    try:
        return services.generate_qr(db, heritage_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to generate QR code: {str(e)}")


@router.get("/", response_model=list[schemas.HeritageResponse])
def list_all(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    user_role = None
    user_id = None
    
    if credentials:
        try:
            payload = verify_access_token(credentials.credentials)
            if payload:
                user_role = payload.get("role")
                user_id = payload.get("user_id")
        except:
            pass
    
    return services.list_heritage(db, user_role, user_id)



@router.get("/{heritage_id}", response_model=schemas.HeritageResponse)
def get_single(
    heritage_id: UUID, 
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Get single heritage by ID.
    
    Access rules:
    - Public: Only active and not deleted
    - Guide: Own heritage regardless of status
    - Admin: Any heritage
    """
    user_role = None
    user_id = None
    
    # Check if user is authenticated
    if credentials:
        try:
            payload = verify_access_token(credentials.credentials)
            if payload:
                user_role = payload.get("role")
                user_id = payload.get("user_id")
        except:
            pass  # Continue as public user
    
    try:
        heritage = services.get_heritage_by_id(db, heritage_id, user_role, user_id)
        return heritage
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to retrieve heritage: {str(e)}")


@router.patch("/{heritage_id}/delete", response_model=schemas.HeritageResponse)
def soft_delete(heritage_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Soft delete heritage (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can delete heritage sites")
    try:
        return services.soft_delete_heritage(db, heritage_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to delete heritage: {str(e)}")
