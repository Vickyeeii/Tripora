from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID
from datetime import date, timedelta
from apps.events.models import Event
from apps.heritage.models import Heritage
from apps.heritage.services import validate_guide_heritage_access


def create_event(db: Session, user_id: UUID, user_role: str, data):
    """
    Create event - Guide can only create for own approved heritage, Admin for any.
    
    Heritage approval is controlled via is_active flag.
    There is no separate approved column.
    """
    # Admin can create events for any heritage (just verify it exists)
    if user_role == "admin":
        heritage = db.query(Heritage).filter(
            Heritage.id == data.heritage_id,
            Heritage.is_deleted == False
        ).first()
        
        if not heritage:
            raise ValueError("Heritage not found")
    else:
        # Guide: validate ownership, approval (is_active), and not deleted
        heritage = validate_guide_heritage_access(db, data.heritage_id, user_id)
    
    event = Event(
        heritage_id=data.heritage_id,
        title=data.title,
        description=data.description,
        event_date=data.event_date,
        start_time=data.start_time,
        end_time=data.end_time,
        event_type=data.event_type,
        created_by_role=user_role,
        created_by_id=user_id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event_id: UUID, user_id: UUID, user_role: str, data):
    """
    Update event - Guide can only update own events, Admin can update any.
    
    Heritage approval is controlled via is_active flag.
    There is no separate approved column.
    """
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
    
    if not event:
        raise ValueError("Event not found")
    
    # Guide can only update their own events
    if user_role == "guide" and event.created_by_id != user_id:
        raise ValueError("You can only update your own events")
    
    event.title = data.title
    event.description = data.description
    event.event_date = data.event_date
    event.start_time = data.start_time
    event.end_time = data.end_time
    event.event_type = data.event_type
    
    db.commit()
    db.refresh(event)
    return event


def cancel_event(db: Session, event_id: UUID, user_id: UUID, user_role: str):
    """
    Cancel event (set is_active = False) - Guide can only cancel own events.
    
    Heritage approval is controlled via is_active flag.
    There is no separate approved column.
    """
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
    
    if not event:
        raise ValueError("Event not found")
    
    # Guide can only cancel their own events
    if user_role == "guide" and event.created_by_id != user_id:
        raise ValueError("You can only cancel your own events")
    
    event.is_active = False
    db.commit()
    db.refresh(event)
    return event


def disable_event(db: Session, event_id: UUID):
    """Disable event (Admin only)"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
    
    if not event:
        raise ValueError("Event not found")
    
    event.is_active = False
    db.commit()
    db.refresh(event)
    return event


def soft_delete_event(db: Session, event_id: UUID, user_id: UUID = None, user_role: str = None):
    """
    Soft delete event (Admin or Guide Owner).
    """
    # Find event
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
    
    if not event:
        raise ValueError("Event not found")
        
    # Check permissions
    if user_role == "guide" and event.created_by_id != user_id:
        raise ValueError("You can only delete your own events")
    
    event.is_deleted = True
    db.commit()
    db.refresh(event)
    return event


def get_today_events(db: Session):
    """
    Get all active events for today (Public).
    
    Only returns events where:
    - Event is active (is_active = True)
    - Event is not deleted (is_deleted = False)
    - Heritage is approved (is_active = True)
    - Heritage is not deleted (is_deleted = False)
    
    Heritage approval is controlled via is_active flag.
    There is no separate approved column.
    """
    today = date.today()
    return (
        db.query(Event)
        .join(Heritage, Event.heritage_id == Heritage.id)
        .filter(
            Event.event_date == today,
            Event.is_active == True,
            Event.is_deleted == False,
            Heritage.is_active == True,
            Heritage.is_deleted == False
        )
        .all()
    )


def get_tomorrow_events(db: Session):
    """
    Get all active events for tomorrow (Public).
    
    Only returns events where:
    - Event is active (is_active = True)
    - Event is not deleted (is_deleted = False)
    - Heritage is approved (is_active = True)
    - Heritage is not deleted (is_deleted = False)
    
    Heritage approval is controlled via is_active flag.
    There is no separate approved column.
    """
    tomorrow = date.today() + timedelta(days=1)
    return (
        db.query(Event)
        .join(Heritage, Event.heritage_id == Heritage.id)
        .filter(
            Event.event_date == tomorrow,
            Event.is_active == True,
            Event.is_deleted == False,
            Heritage.is_active == True,
            Heritage.is_deleted == False
        )
        .all()
    )


def get_events_by_heritage(db: Session, heritage_id: UUID, user_role: str = None, user_id: UUID = None):
    """
    Get events for a specific heritage.
    
    Access Logic:
    - Admin: All events EXCEPT deleted
    - Guide (Owner): All events EXCEPT deleted
    - Public: Only today/tomorrow, active, not deleted
    """
    # Base query
    query = db.query(Event).join(Heritage, Event.heritage_id == Heritage.id)
    
    # Check access level
    is_admin = user_role == "admin"
    is_owner = False
    
    if user_role == "guide" and user_id:
        heritage = db.query(Heritage).filter(Heritage.id == heritage_id).first()
        if heritage and str(heritage.guide_id) == str(user_id):
            is_owner = True
            
    if is_admin:
        # Admin sees everything for this heritage EXCEPT deleted
        return query.filter(
            Event.heritage_id == heritage_id,
            Event.is_deleted == False
        ).all()
        
    elif is_owner:
        # Owner sees everything EXCEPT deleted events
        return query.filter(
            Event.heritage_id == heritage_id,
            Event.is_deleted == False
        ).all()
        
    else:
        # Public view: Today and Tomorrow, Active only
        today = date.today()
        tomorrow = today + timedelta(days=1)
        
        return query.filter(
            Event.heritage_id == heritage_id,
            Event.event_date.in_([today, tomorrow]),
            Event.is_active == True,
            Event.is_deleted == False,
            Heritage.is_active == True,
            Heritage.is_deleted == False
        ).all()


def get_event_by_id(db: Session, event_id: UUID):
    """
    Get a single event by ID (Public).
    """
    return db.query(Event).filter(
        Event.id == event_id,
        Event.is_deleted == False
    ).first()
