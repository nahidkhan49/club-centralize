from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.event import Event
from app.models.event_participant import event_participants
from typing import List

from app.dependencies import get_current_user, get_db, get_club_event_manager
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


@router.post("/", response_model=EventResponse)
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    manager: None = Depends(get_club_event_manager)  # ensures president or secretary
):
    """Create a new event for a club. Only president or secretary (or admin) may create."""
    event = Event(**event_data.dict())
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
    current_user: None = Depends(get_current_user)
):
    """List events for a club. Any authenticated user can view. Set include_inactive=True to see all."""
    query = db.query(Event).filter(Event.club_id == club_id)
    if not include_inactive:
        query = query.filter(Event.is_active == True)
    return query.all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: None = Depends(get_current_user)
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
    # Authorization: ensure the user is president or secretary of the club
    get_club_event_manager(event.club_id, current_user=current_user, db=db)
    for field, value in update_data.dict(exclude_unset=True).items():
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
    # Authorization check
    get_club_event_manager(event.club_id, current_user=current_user, db=db)
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
    """List participants of an event. Admin, or President/Secretary of this specific club only."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if not current_user.is_superuser:
        from app.models.membership import Membership
        membership = db.query(Membership).filter(
            Membership.club_id == event.club_id,
            Membership.user_id == current_user.id,
            Membership.role.in_(["president", "secretary", "vice_president"])
        ).first()
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view participants for this event"
            )

    return event.participants


@router.get("/{event_id}/participants/me", response_model=dict)
def check_my_participation(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if the current user is registered for a specific event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    is_registered = current_user in event.participants
    return {"registered": is_registered, "participant_count": len(event.participants)}


@router.delete("/{event_id}/participants/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_participant(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin/president/secretary can remove a participant from an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    get_club_event_manager(event.club_id, current_user=current_user, db=db)
    participant = db.query(User).filter(User.id == user_id).first()
    if not participant or participant not in event.participants:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found in event")
    event.participants.remove(participant)
    db.commit()
    return None
