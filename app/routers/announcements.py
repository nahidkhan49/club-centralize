from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_current_user, get_db
from app.models.announcement import Announcement
from app.models.membership import Membership
from app.models.user import User
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"]
)

MANAGER_ROLES = ("president", "secretary", "vice_president")


def _can_manage_announcement(announcement: Announcement, current_user: User, db: Session) -> bool:
    """Return True if user can edit/delete this announcement."""
    if current_user.is_superuser:
        return True
    # Club president or secretary can manage their club's announcements
    if announcement.club_id:
        membership = db.query(Membership).filter(
            Membership.user_id == current_user.id,
            Membership.club_id == announcement.club_id,
            Membership.role.in_(MANAGER_ROLES)
        ).first()
        return membership is not None
    return False


def _can_create_announcement(club_id: int | None, current_user: User, db: Session) -> bool:
    """Return True if user can create announcements."""
    if current_user.is_superuser:
        return True
    if club_id:
        membership = db.query(Membership).filter(
            Membership.user_id == current_user.id,
            Membership.club_id == club_id,
            Membership.role.in_(MANAGER_ROLES)
        ).first()
        return membership is not None
    return False


@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create announcement. Only admin, president, or secretary can create."""
    if not _can_create_announcement(data.club_id, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin, president, or secretary can create announcements"
        )
    announcement = Announcement(
        title=data.title,
        content=data.content,
        club_id=data.club_id,
        club_name=data.club_name,
        source_location=data.source_location,
        is_published=data.is_published,
        author_id=current_user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/", response_model=List[AnnouncementResponse])
def list_announcements(
    club_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List published announcements. All authenticated users can view."""
    query = db.query(Announcement).filter(Announcement.is_published == True)
    if club_id:
        query = query.filter(Announcement.club_id == club_id)
    return query.order_by(Announcement.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/all", response_model=List[AnnouncementResponse])
def list_all_announcements(
    club_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all announcements (including unpublished). Admin and club managers only."""
    query = db.query(Announcement)
    if club_id:
        query = query.filter(Announcement.club_id == club_id)
    elif not current_user.is_superuser:
        # Non-admin only sees their own club's announcements
        managed_club_ids = [
            m.club_id for m in db.query(Membership).filter(
                Membership.user_id == current_user.id,
                Membership.role.in_(MANAGER_ROLES)
            ).all()
        ]
        query = query.filter(Announcement.club_id.in_(managed_club_ids))
    return query.order_by(Announcement.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    return announcement


@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if not _can_manage_announcement(announcement, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this announcement"
        )
    for field, value in data.dict(exclude_unset=True).items():
        setattr(announcement, field, value)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if not _can_manage_announcement(announcement, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this announcement"
        )
    db.delete(announcement)
    db.commit()
    return None
