from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.event import Event
from app.models.event_task import EventTask
from app.models.membership import Membership
from app.models.user import User
from app.schemas.event_task import EventTaskCreate, EventTaskUpdate, EventTaskResponse

router = APIRouter(
    prefix="/events",
    tags=["Event Tasks"]
)


def _is_club_leader(club_id: int, user: User, db: Session) -> bool:
    """Check if user is admin/president/secretary/event_manager of the club."""
    if user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.club_id == club_id
    ).first()
    if membership and membership.role in ("president", "secretary", "event_manager"):
        return True
    return False


def _is_club_member(club_id: int, user: User, db: Session) -> bool:
    """Check if user is a member of the club."""
    if user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.user_id == user.id,
        Membership.club_id == club_id
    ).first()
    return membership is not None


def _task_to_response(task: EventTask) -> EventTaskResponse:
    """Convert a task ORM object to a response with enriched user data."""
    assignee = task.assignee
    assigner = task.assigner
    return EventTaskResponse(
        id=task.id,
        event_id=task.event_id,
        assigned_to=task.assigned_to,
        assigned_by=task.assigned_by,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        category=task.category,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
        assignee_name=assignee.username if assignee else None,
        assignee_email=assignee.email if assignee else None,
        assignee_avatar=assignee.avatar_url if assignee else None,
        assigner_name=assigner.username if assigner else None,
    )


@router.get("/{event_id}/tasks", response_model=List[EventTaskResponse])
def list_event_tasks(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tasks for an event. Any club member can view."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    tasks = db.query(EventTask).filter(EventTask.event_id == event_id).order_by(EventTask.created_at.desc()).all()
    return [_task_to_response(t) for t in tasks]


@router.post("/{event_id}/tasks", response_model=EventTaskResponse, status_code=status.HTTP_201_CREATED)
def create_event_task(
    event_id: int,
    task_data: EventTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task for the event. Only president/secretary can create."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not _is_club_leader(event.club_id, current_user, db):
        raise HTTPException(status_code=403, detail="Only club president or secretary can create tasks")

    # Validate assignee exists if provided
    if task_data.assigned_to:
        assignee = db.query(User).filter(User.id == task_data.assigned_to).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assigned user not found")

    new_task = EventTask(
        event_id=event_id,
        assigned_to=task_data.assigned_to,
        assigned_by=current_user.id,
        title=task_data.title,
        description=task_data.description,
        status=task_data.status or "pending",
        priority=task_data.priority or "medium",
        category=task_data.category,
        due_date=task_data.due_date,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    try:
        if new_task.assigned_to and new_task.assigned_to != current_user.id:
            from app.services.notification import create_notification
            create_notification(
                db=db,
                user_id=new_task.assigned_to,
                title="New Task Assigned",
                content=f"You have been assigned the task '{new_task.title}' for event '{event.title}'.",
                link=f"/events/{event_id}/manage"
            )
    except Exception as ne:
        print(f"Failed to create task notification: {ne}")

    return _task_to_response(new_task)


@router.patch("/{event_id}/tasks/{task_id}", response_model=EventTaskResponse)
def update_event_task(
    event_id: int,
    task_id: int,
    task_data: EventTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task. President/secretary can update anything. Assigned member can only update status."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    task = db.query(EventTask).filter(EventTask.id == task_id, EventTask.event_id == event_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    is_leader = _is_club_leader(event.club_id, current_user, db)
    is_assignee = task.assigned_to == current_user.id

    if not is_leader and not is_assignee:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")

    old_assignee = task.assigned_to

    # If only assignee (not leader), they can only update status
    if is_assignee and not is_leader:
        if task_data.status:
            task.status = task_data.status
    else:
        # Leader can update everything
        update_fields = task_data.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(task, field, value)

    db.commit()
    db.refresh(task)

    # Notify if assignee has changed
    if task.assigned_to and task.assigned_to != old_assignee and task.assigned_to != current_user.id:
        try:
            from app.services.notification import create_notification
            create_notification(
                db=db,
                user_id=task.assigned_to,
                title="New Task Assigned",
                content=f"You have been assigned the task '{task.title}' for event '{event.title}'.",
                link=f"/events/{event_id}/manage"
            )
        except Exception as ne:
            print(f"Failed to create task update notification: {ne}")

    return _task_to_response(task)


@router.delete("/{event_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event_task(
    event_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task. Only president/secretary can delete."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not _is_club_leader(event.club_id, current_user, db):
        raise HTTPException(status_code=403, detail="Only club president or secretary can delete tasks")

    task = db.query(EventTask).filter(EventTask.id == task_id, EventTask.event_id == event_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None
