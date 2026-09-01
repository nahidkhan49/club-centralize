from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.dependencies import get_current_user, get_db, get_current_admin_user
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, UserResponse, UserUpdate

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_data.username is not None and user_data.username != current_user.username:
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.username = user_data.username

    if user_data.email is not None and user_data.email != current_user.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_data.email

    if user_data.avatar_url is not None:
        current_user.avatar_url = user_data.avatar_url.strip() if user_data.avatar_url else None

    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name.strip() if user_data.full_name else None

    if user_data.department is not None:
        current_user.department = user_data.department.strip() if user_data.department else None

    if user_data.contact is not None:
        current_user.contact = user_data.contact.strip() if user_data.contact else None

    if user_data.bio is not None:
        current_user.bio = user_data.bio.strip() if user_data.bio else None

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    current_user.password = hash_password(password_data.new_password)
    db.commit()
    db.refresh(current_user)

    return {"message": "Password changed successfully"}


@router.get("/", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin endpoint to list all users"""
    users = db.query(User).all()
    return users


@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin endpoint to get platform-wide statistics."""
    from app.models.club import Club
    from app.models.membership import Membership
    from app.models.event import Event
    from app.models.announcement import Announcement

    total_users = db.query(User).count()
    total_clubs = db.query(Club).count()
    total_events = db.query(Event).count()
    total_announcements = db.query(Announcement).count()

    # Role counts from memberships
    presidents = db.query(Membership).filter(Membership.role == "president").count()
    secretaries = db.query(Membership).filter(Membership.role == "secretary").count()
    members_count = db.query(Membership).filter(Membership.role == "member").count()

    # Upcoming events
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    upcoming_events = db.query(Event).filter(
        Event.is_active == True,
        Event.start_time >= now
    ).count()

    return {
        "total_users": total_users,
        "total_clubs": total_clubs,
        "total_events": total_events,
        "total_announcements": total_announcements,
        "total_presidents": presidents,
        "total_secretaries": secretaries,
        "total_members": members_count,
        "upcoming_events": upcoming_events,
    }


@router.patch("/{user_id}/promote")
def promote_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin-only: Toggle a user's superuser (admin) status."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own admin status")
    user.is_superuser = not user.is_superuser
    db.commit()
    db.refresh(user)
    return {"message": f"User {user.username} is_superuser set to {user.is_superuser}", "is_superuser": user.is_superuser}


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin-only: Get a specific user's details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin-only: Delete a user and cleanly cascade all their related records."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    from sqlalchemy import or_
    from app.models.membership import Membership
    from app.models.membership_request import MembershipRequest
    from app.models.event_participant import event_participants
    from app.models.club_message import ClubMessage
    from app.models.notification import Notification
    from app.models.event_task import EventTask
    from app.models.announcement import Announcement

    try:
        # 1. Clean up memberships
        db.query(Membership).filter(Membership.user_id == user_id).delete(synchronize_session=False)

        # 2. Clean up membership requests
        db.query(MembershipRequest).filter(MembershipRequest.user_id == user_id).delete(synchronize_session=False)
        db.query(MembershipRequest).filter(MembershipRequest.reviewed_by_id == user_id).update({"reviewed_by_id": None}, synchronize_session=False)

        # 3. Clean up event registrations
        db.execute(event_participants.delete().where(event_participants.c.user_id == user_id))

        # 4. Clean up club messages
        db.query(ClubMessage).filter(
            or_(ClubMessage.user_id == user_id, ClubMessage.sender_id == user_id)
        ).delete(synchronize_session=False)

        # 5. Clean up notifications
        db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)

        # 6. Unassign tasks or null creator references
        db.query(EventTask).filter(EventTask.assigned_to == user_id).update({"assigned_to": None}, synchronize_session=False)
        db.query(EventTask).filter(EventTask.assigned_by == user_id).update({"assigned_by": None}, synchronize_session=False)

        # 7. Reassign authored announcements to the acting admin
        db.query(Announcement).filter(Announcement.author_id == user_id).update({"author_id": admin_user.id}, synchronize_session=False)

        # 8. Delete user
        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

    return None
