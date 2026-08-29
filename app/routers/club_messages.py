from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.club import Club
from app.models.club_message import ClubMessage
from app.models.membership import Membership
from app.models.user import User
from app.schemas.club_message import ClubMessageCreate, ClubMessageResponse, ClubChatParticipant

router = APIRouter(
    prefix="/clubs",
    tags=["Club Messaging"]
)


def _is_club_officer(club_id: int, user: User, db: Session) -> bool:
    """Check if user is president or secretary of the club."""
    if user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == user.id
    ).first()
    return membership is not None and membership.role in ("president", "secretary")


def _is_club_member(club_id: int, user: User, db: Session) -> bool:
    """Check if user is a member of the club."""
    if user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == user.id
    ).first()
    return membership is not None


@router.get("/{club_id}/messages", response_model=List[ClubMessageResponse])
def get_club_messages(
    club_id: int,
    user_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve chat message history between a member and the club."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    is_officer = _is_club_officer(club_id, current_user, db)

    # Determine whose chat history to load
    target_user_id = current_user.id
    if is_officer:
        if user_id is None:
            raise HTTPException(status_code=400, detail="Officer must specify user_id to view member chat")
        target_user_id = user_id
    else:
        # Member can only view their own chat
        if not _is_club_member(club_id, current_user, db):
            raise HTTPException(status_code=403, detail="You are not a member of this club")

    messages = (
        db.query(ClubMessage)
        .filter(ClubMessage.club_id == club_id, ClubMessage.user_id == target_user_id)
        .order_by(ClubMessage.created_at.ascii() if hasattr(ClubMessage.created_at, "ascii") else ClubMessage.created_at.asc())
        .all()
    )

    response = []
    for msg in messages:
        sender_user = db.query(User).filter(User.id == msg.sender_id).first()
        response.append(
            ClubMessageResponse(
                id=msg.id,
                club_id=msg.club_id,
                user_id=msg.user_id,
                sender_id=msg.sender_id,
                sender_name=sender_user.username if sender_user else "System",
                content=msg.content,
                created_at=msg.created_at
            )
        )
    return response


@router.post("/{club_id}/messages", response_model=ClubMessageResponse, status_code=status.HTTP_201_CREATED)
def send_club_message(
    club_id: int,
    payload: ClubMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the club (if member) or to a member (if officer)."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")

    is_officer = _is_club_officer(club_id, current_user, db)

    # Determine whose channel this message belongs to
    if is_officer:
        if not payload.user_id:
            raise HTTPException(status_code=400, detail="Officer must provide user_id of the recipient member")
        target_user_id = payload.user_id
    else:
        if not _is_club_member(club_id, current_user, db):
            raise HTTPException(status_code=403, detail="You must be a club member to send messages")
        target_user_id = current_user.id

    new_msg = ClubMessage(
        club_id=club_id,
        user_id=target_user_id,
        sender_id=current_user.id,
        content=payload.content.strip()
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return ClubMessageResponse(
        id=new_msg.id,
        club_id=new_msg.club_id,
        user_id=new_msg.user_id,
        sender_id=new_msg.sender_id,
        sender_name=current_user.username,
        content=new_msg.content,
        created_at=new_msg.created_at
    )


@router.get("/{club_id}/chat-participants", response_model=List[ClubChatParticipant])
def get_chat_participants(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all club members who can be messaged (officers/admins only)."""
    if not _is_club_officer(club_id, current_user, db):
        raise HTTPException(status_code=403, detail="Only club officers can list chat participants")

    # Get all memberships for the club (excluding officers themselves to avoid self-chatting)
    members = (
        db.query(Membership)
        .filter(
            Membership.club_id == club_id,
            Membership.role.not_in(["president", "secretary"])
        )
        .all()
    )
    user_ids = [m.user_id for m in members]

    participants = []
    for uid in user_ids:
        user_obj = db.query(User).filter(User.id == uid).first()
        if not user_obj:
            continue

        # Get last message
        last_msg = (
            db.query(ClubMessage)
            .filter(ClubMessage.club_id == club_id, ClubMessage.user_id == uid)
            .order_by(ClubMessage.created_at.desc())
            .first()
        )

        participants.append(
            ClubChatParticipant(
                user_id=uid,
                username=user_obj.username,
                avatar_url=user_obj.avatar_url,
                last_message=last_msg.content if last_msg else None,
                last_message_time=last_msg.created_at if last_msg else None
            )
        )

    # Sort participants so those with messages appear first, ordered by latest message time
    from datetime import datetime
    participants.sort(key=lambda x: x.last_message_time or datetime.min, reverse=True)
    return participants
