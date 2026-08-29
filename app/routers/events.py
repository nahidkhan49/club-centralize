from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.event import Event
from app.models.event_participant import event_participants
from app.models.membership import Membership
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

ALLOWED_EVENT_MANAGERS = ("president", "secretary", "vice_president")


def _check_event_permission(club_id: int, current_user: User, db: Session):
    if current_user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == current_user.id,
        Membership.role.in_(ALLOWED_EVENT_MANAGERS)
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club president or secretary can manage events for this club"
        )
    return True


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event for a club. Only president, secretary, or admin may create."""
    _check_event_permission(event_data.club_id, current_user, db)

    event_dict = event_data.model_dump() if hasattr(event_data, "model_dump") else event_data.dict()
    event_dict.pop("date", None)

    if not event_dict.get("start_time"):
        event_dict["start_time"] = datetime.now()
    if not event_dict.get("end_time"):
        event_dict["end_time"] = event_dict["start_time"] + timedelta(hours=2)

    event = Event(**event_dict)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=List[EventResponse])
def list_all_events(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all events across all clubs. Any authenticated user can view."""
    query = db.query(Event)
    if not include_inactive:
        query = query.filter(Event.is_active == True)
    return query.offset(skip).limit(limit).all()


@router.get("/club/{club_id}", response_model=List[EventResponse])
def list_events(
    club_id: int,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List events for a club. Any authenticated user can view. Set include_inactive=True to see all."""
    query = db.query(Event).filter(Event.club_id == club_id)
    if not include_inactive:
        query = query.filter(Event.is_active == True)
    return query.order_by(Event.start_time.asc()).all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.patch("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    update_data: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    _check_event_permission(event.club_id, current_user, db)

    data = update_data.model_dump(exclude_unset=True) if hasattr(update_data, "model_dump") else update_data.dict(exclude_unset=True)
    data.pop("date", None)

    for field, value in data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    _check_event_permission(event.club_id, current_user, db)

    db.delete(event)
    db.commit()
    return None


@router.post("/{event_id}/join", response_model=EventResponse)
def join_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Current user joins the event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if current_user in event.participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already joined this event")
    event.participants.append(current_user)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}/join", status_code=status.HTTP_204_NO_CONTENT)
def leave_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Current user leaves the event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if current_user not in event.participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not a participant of this event")
    event.participants.remove(current_user)
    db.commit()
    return None


@router.get("/{event_id}/participants", response_model=List[UserResponse])
def list_event_participants(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List participants of an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    _check_event_permission(event.club_id, current_user, db)

    return [
        UserResponse(
            id=u.id,
            email=u.email,
            username=u.username,
            full_name=u.full_name,
            system_role=u.system_role.value if hasattr(u.system_role, "value") else str(u.system_role),
            is_active=u.is_active,
            is_superuser=u.is_superuser,
            avatar_url=u.avatar_url,
            created_at=u.created_at,
            updated_at=u.updated_at
        )
        for u in event.participants
    ]


@router.post("/{event_id}/participants/{user_id}", response_model=UserResponse)
def add_event_participant(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually add a member to the event roster (President / Secretary / Admin)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    _check_event_permission(event.club_id, current_user, db)

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target_user not in event.participants:
        event.participants.append(target_user)
        db.commit()

    return UserResponse(
        id=target_user.id,
        email=target_user.email,
        username=target_user.username,
        full_name=target_user.full_name,
        system_role=target_user.system_role.value if hasattr(target_user.system_role, "value") else str(target_user.system_role),
        is_active=target_user.is_active,
        is_superuser=target_user.is_superuser,
        avatar_url=target_user.avatar_url,
        created_at=target_user.created_at,
        updated_at=target_user.updated_at
    )


@router.delete("/{event_id}/participants/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_event_participant(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a registrant from the event roster (President / Secretary / Admin)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    _check_event_permission(event.club_id, current_user, db)

    target_user = db.query(User).filter(User.id == user_id).first()
    if target_user and target_user in event.participants:
        event.participants.remove(target_user)
        db.commit()

    return None
