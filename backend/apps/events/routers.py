from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from middleware.db import get_db
from middleware.auth_utils import get_current_user
from middleware.security import verify_access_token
from apps.events import services, schemas
from apps.events import services, schemas

router = APIRouter(prefix="/events", tags=["Events"])
security = HTTPBearer(auto_error=False)


# PUBLIC ENDPOINTS

@router.get("/today", response_model=list[schemas.EventResponse])
def get_today_events(db: Session = Depends(get_db)):
    """Get all events for today (Public)"""
    return services.get_today_events(db)


@router.get("/tomorrow", response_model=list[schemas.EventResponse])
def get_tomorrow_events(db: Session = Depends(get_db)):
    """Get all events for tomorrow (Public)"""
    return services.get_tomorrow_events(db)


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event_by_id(event_id: UUID, db: Session = Depends(get_db)):
    """Get single event details"""
    event = services.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(404, "Event not found")
    return event


@router.get("/", response_model=list[schemas.EventResponse])
def get_events_by_heritage(
    heritage_id: UUID, 
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Get events for specific heritage using role-based filtering:
    - Admin: All events
    - Guide (Owner): All events
    - Public: Today and Tomorrow only
    """
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

    return services.get_events_by_heritage(db, heritage_id, user_role, user_id)


# GUIDE ENDPOINTS

@router.post("/", response_model=schemas.EventResponse, status_code=201)
def create_event(
    data: schemas.EventCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Create event (Guide/Admin)"""
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can create events")
    
    try:
        return services.create_event(db, user["user_id"], user["role"], data)
    except ValueError as e:
        error_msg = str(e)
        if "not approved" in error_msg.lower():
            raise HTTPException(403, error_msg)
        elif "your own heritage" in error_msg.lower():
            raise HTTPException(403, error_msg)
        else:
            raise HTTPException(404, error_msg)
    except Exception as e:
        raise HTTPException(500, f"Failed to create event: {str(e)}")


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: UUID,
    data: schemas.EventUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update event (Guide can update own, Admin can update any)"""
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can update events")
    
    try:
        return services.update_event(db, event_id, user["user_id"], user["role"], data)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to update event: {str(e)}")


@router.patch("/{event_id}/cancel", response_model=schemas.EventResponse)
def cancel_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Cancel event (Guide can cancel own, Admin can cancel any)"""
    if user["role"] not in ["guide", "admin"]:
        raise HTTPException(403, "Only guides and admins can cancel events")
    
    try:
        return services.cancel_event(db, event_id, user["user_id"], user["role"])
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to cancel event: {str(e)}")


# ADMIN ENDPOINTS

@router.patch("/{event_id}/disable", response_model=schemas.EventResponse)
def disable_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Disable event (Admin only)"""
    if user["role"] != "admin":
        raise HTTPException(403, "Only admins can disable events")
    
    try:
        return services.disable_event(db, event_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to disable event: {str(e)}")


@router.patch("/{event_id}/delete", response_model=schemas.EventResponse)
def soft_delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Soft delete event (Admin or Guide Owner)"""
    if user["role"] not in ["admin", "guide"]:
        raise HTTPException(403, "Only admins and guides can delete events")
    
    try:
        return services.soft_delete_event(db, event_id, user["user_id"], user["role"])
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(500, f"Failed to delete event: {str(e)}")
