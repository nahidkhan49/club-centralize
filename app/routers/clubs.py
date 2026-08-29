from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db, get_current_admin_user
from app.models.club import Club
from app.models.membership import Membership
from app.models.membership_request import MembershipRequest, RequestStatus
from app.models.user import User
from app.models.event import Event
from app.models.announcement import Announcement
from app.models.event_participant import event_participants
from app.schemas.club import ClubCreate, ClubResponse, ClubUpdate
from app.schemas.membership import (
    ClubMemberResponse,
    MembershipResponse,
    MembershipRoleUpdate,
    MembershipRole,
    MembershipRequestResponse,
    MyMembershipRequestStatusResponse,
)

router = APIRouter(
    prefix="/clubs",
    tags=["Clubs"]
)


def check_club_officer_permission(club_id: int, user: User, db: Session) -> bool:
    """Ensures user is either superuser, president, or secretary of this specific club."""
    if user.is_superuser:
        return True
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == user.id
    ).first()
    if not membership or membership.role not in ("president", "secretary"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club president or secretary can perform this action"
        )
    return True


class AssignClubRoleRequest(BaseModel):
    user_id: int
    role: str  # 'president' | 'secretary' | 'vice_president' | 'treasurer' | 'member'


@router.post("/", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_data: ClubCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin-only: Create a new club."""
    existing_club = db.query(Club).filter(Club.name == club_data.name.strip()).first()
    if existing_club:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club name already exists"
        )

    new_club = Club(
        name=club_data.name.strip(),
        description=club_data.description.strip() if club_data.description else None,
        logo_url=club_data.logo_url.strip() if club_data.logo_url else None,
        contact_email=club_data.contact_email.strip() if club_data.contact_email else None,
        category=club_data.category.strip() if club_data.category else None,
    )

    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return new_club


@router.get("/", response_model=list[ClubResponse])
def get_clubs(db: Session = Depends(get_db)):
    """Public: List all clubs."""
    clubs = db.query(Club).all()
    return clubs


@router.get("/my/memberships")
def get_my_memberships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's club memberships with roles."""
    memberships = db.query(Membership).filter(
        Membership.user_id == current_user.id
    ).all()

    result = []
    for m in memberships:
        club = db.query(Club).filter(Club.id == m.club_id).first()
        if club:
            result.append({
                "club_id": m.club_id,
                "club_name": club.name,
                "role": m.role,
                "is_active": club.is_active,
            })
    return result


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    """Public: Get a specific club."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    return club


@router.put("/{club_id}", response_model=ClubResponse)
@router.patch("/{club_id}", response_model=ClubResponse)
def update_club(
    club_id: int,
    club_data: ClubUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Club Officers (President, Secretary) or Admin: Update club profile, cover, logo, and details."""
    check_club_officer_permission(club_id, current_user, db)

    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Admin only updates for name, category, is_active
    if current_user.is_superuser:
        if club_data.name is not None and club_data.name.strip() != club.name:
            existing_club = db.query(Club).filter(Club.name == club_data.name.strip()).first()
            if existing_club:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Club name already exists"
                )
            club.name = club_data.name.strip()

        if club_data.category is not None:
            club.category = club_data.category.strip() if club_data.category else None

        if club_data.is_active is not None:
            club.is_active = club_data.is_active

    # Officers & Admins can update description, cover, logo, contact, meeting info, gallery
    if club_data.description is not None:
        club.description = club_data.description.strip() if club_data.description else None

    if club_data.logo_url is not None:
        club.logo_url = club_data.logo_url.strip() if club_data.logo_url else None

    if club_data.cover_url is not None:
        club.cover_url = club_data.cover_url.strip() if club_data.cover_url else None

    if club_data.meeting_location is not None:
        club.meeting_location = club_data.meeting_location.strip() if club_data.meeting_location else None

    if club_data.meeting_time is not None:
        club.meeting_time = club_data.meeting_time.strip() if club_data.meeting_time else None

    if club_data.gallery is not None:
        club.gallery = club_data.gallery.strip() if club_data.gallery else None

    if club_data.contact_email is not None:
        club.contact_email = club_data.contact_email.strip() if club_data.contact_email else None

    db.commit()
    db.refresh(club)

    return club


@router.delete("/{club_id}")
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """Admin-only: Delete a club and its associated data cleanly."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # Delete memberships & membership requests
    db.query(Membership).filter(Membership.club_id == club_id).delete()
    db.query(MembershipRequest).filter(MembershipRequest.club_id == club_id).delete()

    # Delete announcements
    db.query(Announcement).filter(Announcement.club_id == club_id).delete()

    # Delete event participants and events
    club_events = db.query(Event).filter(Event.club_id == club_id).all()
    for ev in club_events:
        db.execute(event_participants.delete().where(event_participants.c.event_id == ev.id))
        db.delete(ev)

    db.delete(club)
    db.commit()

    return {"message": "Club deleted successfully"}


@router.post("/{club_id}/join", response_model=MembershipRequestResponse, status_code=status.HTTP_201_CREATED)
def join_club(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    User submits a join request. Status is PENDING and no active member
    permissions are granted until President/Secretary approves.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    # 1. Prevent joining if already an active member
    existing_membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.club_id == club_id
    ).first()
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already an active member of this club"
        )

    # 2. Check existing request status
    existing_request = db.query(MembershipRequest).filter(
        MembershipRequest.club_id == club_id,
        MembershipRequest.user_id == current_user.id
    ).first()

    if existing_request:
        if existing_request.status == RequestStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have a pending join request for this club"
            )
        elif existing_request.status == RequestStatus.REJECTED.value:
            # Allow user to reapply
            existing_request.status = RequestStatus.PENDING.value
            existing_request.reviewed_by_id = None
            existing_request.reviewed_at = None
            existing_request.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing_request)
            return MembershipRequestResponse(
                id=existing_request.id,
                club_id=existing_request.club_id,
                user_id=existing_request.user_id,
                username=current_user.username,
                user_email=current_user.email,
                status=existing_request.status,
                created_at=existing_request.created_at,
                updated_at=existing_request.updated_at,
                reviewed_by_id=None,
                reviewed_by_username=None,
                reviewed_at=None,
            )

    new_request = MembershipRequest(
        club_id=club_id,
        user_id=current_user.id,
        status=RequestStatus.PENDING.value
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return MembershipRequestResponse(
        id=new_request.id,
        club_id=new_request.club_id,
        user_id=new_request.user_id,
        username=current_user.username,
        user_email=current_user.email,
        status=new_request.status,
        created_at=new_request.created_at,
        updated_at=new_request.updated_at,
        reviewed_by_id=None,
        reviewed_by_username=None,
        reviewed_at=None,
    )


@router.get("/{club_id}/my-request", response_model=MyMembershipRequestStatusResponse)
def get_my_club_request_status(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's join request & membership status for this club."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.club_id == club_id
    ).first()

    req = db.query(MembershipRequest).filter(
        MembershipRequest.user_id == current_user.id,
        MembershipRequest.club_id == club_id
    ).order_by(MembershipRequest.id.desc()).first()

    return MyMembershipRequestStatusResponse(
        club_id=club_id,
        status=req.status if req else None,
        is_member=bool(membership),
        role=membership.role if membership else None,
        request_id=req.id if req else None,
    )


@router.get("/{club_id}/requests", response_model=list[MembershipRequestResponse])
def get_club_membership_requests(
    club_id: int,
    status_filter: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    President/Secretary/Admin only: List membership requests for a club.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    check_club_officer_permission(club_id, current_user, db)

    query = db.query(
        MembershipRequest,
        User.username.label("applicant_username"),
        User.email.label("applicant_email")
    ).join(User, MembershipRequest.user_id == User.id).filter(
        MembershipRequest.club_id == club_id
    )

    if status_filter:
        query = query.filter(MembershipRequest.status == status_filter.upper())

    results = query.order_by(MembershipRequest.created_at.desc()).all()

    reviewer_ids = {r[0].reviewed_by_id for r in results if r[0].reviewed_by_id}
    reviewers = {}
    if reviewer_ids:
        reviewers = {u.id: u.username for u in db.query(User).filter(User.id.in_(reviewer_ids)).all()}

    output = []
    for req_obj, u_name, u_email in results:
        output.append(
            MembershipRequestResponse(
                id=req_obj.id,
                club_id=req_obj.club_id,
                user_id=req_obj.user_id,
                username=u_name,
                user_email=u_email,
                status=req_obj.status,
                created_at=req_obj.created_at,
                updated_at=req_obj.updated_at,
                reviewed_by_id=req_obj.reviewed_by_id,
                reviewed_by_username=reviewers.get(req_obj.reviewed_by_id),
                reviewed_at=req_obj.reviewed_at,
            )
        )
    return output


@router.post("/{club_id}/requests/{request_id}/approve", response_model=MembershipRequestResponse)
def approve_membership_request(
    club_id: int,
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    President/Secretary/Admin only: Approve a membership request.
    User is granted active MEMBER role in this club.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    check_club_officer_permission(club_id, current_user, db)

    req = db.query(MembershipRequest).filter(
        MembershipRequest.id == request_id,
        MembershipRequest.club_id == club_id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership request not found")

    # Update request
    req.status = RequestStatus.APPROVED.value
    req.reviewed_by_id = current_user.id
    req.reviewed_at = datetime.now(timezone.utc)
    req.updated_at = datetime.now(timezone.utc)

    # Ensure user has active Membership with role='member'
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == req.user_id
    ).first()

    if not membership:
        membership = Membership(
            club_id=club_id,
            user_id=req.user_id,
            role="member"
        )
        db.add(membership)

    db.commit()
    db.refresh(req)

    applicant = db.query(User).filter(User.id == req.user_id).first()
    return MembershipRequestResponse(
        id=req.id,
        club_id=req.club_id,
        user_id=req.user_id,
        username=applicant.username if applicant else None,
        user_email=applicant.email if applicant else None,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
        reviewed_by_id=req.reviewed_by_id,
        reviewed_by_username=current_user.username,
        reviewed_at=req.reviewed_at,
    )


@router.post("/{club_id}/requests/{request_id}/reject", response_model=MembershipRequestResponse)
def reject_membership_request(
    club_id: int,
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    President/Secretary/Admin only: Reject a membership request.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    check_club_officer_permission(club_id, current_user, db)

    req = db.query(MembershipRequest).filter(
        MembershipRequest.id == request_id,
        MembershipRequest.club_id == club_id
    ).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership request not found")

    req.status = RequestStatus.REJECTED.value
    req.reviewed_by_id = current_user.id
    req.reviewed_at = datetime.now(timezone.utc)
    req.updated_at = datetime.now(timezone.utc)

    # Ensure no active membership exists
    db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == req.user_id
    ).delete()

    db.commit()
    db.refresh(req)

    applicant = db.query(User).filter(User.id == req.user_id).first()
    return MembershipRequestResponse(
        id=req.id,
        club_id=req.club_id,
        user_id=req.user_id,
        username=applicant.username if applicant else None,
        user_email=applicant.email if applicant else None,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
        reviewed_by_id=req.reviewed_by_id,
        reviewed_by_username=current_user.username,
        reviewed_at=req.reviewed_at,
    )


@router.delete("/{club_id}/leave")
def leave_club(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.club_id == club_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member of this club"
        )

    db.delete(membership)
    # Also clean up any membership requests for this user & club
    db.query(MembershipRequest).filter(
        MembershipRequest.user_id == current_user.id,
        MembershipRequest.club_id == club_id
    ).delete()

    db.commit()

    return {"message": "You have successfully left the club"}


@router.get("/{club_id}/members", response_model=list[ClubMemberResponse])
def get_club_members(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    results = (
        db.query(
            Membership.user_id,
            User.username,
            User.email,
            Membership.role
        )
        .join(User, Membership.user_id == User.id)
        .filter(Membership.club_id == club_id)
        .all()
    )

    return [
        ClubMemberResponse(
            user_id=row.user_id,
            username=row.username,
            email=row.email,
            role=row.role
        )
        for row in results
    ]


@router.patch("/{club_id}/members/{user_id}/role", response_model=MembershipResponse)
def update_membership_role(
    club_id: int,
    user_id: int,
    role_data: MembershipRoleUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin-only: Update a user's role in a club."""
    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == user_id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found"
        )

    # If assigning president, demote previous president to member
    if role_data.role == "president":
        prev_presidents = db.query(Membership).filter(
            Membership.club_id == club_id,
            Membership.role == "president",
            Membership.user_id != user_id
        ).all()
        for p in prev_presidents:
            p.role = "member"

    # If assigning secretary, demote previous secretary to member
    if role_data.role == "secretary":
        prev_secretaries = db.query(Membership).filter(
            Membership.club_id == club_id,
            Membership.role == "secretary",
            Membership.user_id != user_id
        ).all()
        for s in prev_secretaries:
            s.role = "member"

    membership.role = role_data.role
    db.commit()
    db.refresh(membership)

    return membership


@router.post("/{club_id}/assign-role", response_model=MembershipResponse)
def assign_club_role_admin(
    club_id: int,
    req: AssignClubRoleRequest,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin-only: Assign a role (e.g. president/secretary) to any user in a club.
    If the user is not yet a member, they are automatically added to the club with that role.
    """
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    target_user = db.query(User).filter(User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # If assigning president, demote existing president of this club
    if req.role == "president":
        existing_presidents = db.query(Membership).filter(
            Membership.club_id == club_id,
            Membership.role == "president",
            Membership.user_id != req.user_id
        ).all()
        for p in existing_presidents:
            p.role = "member"

    # If assigning secretary, demote existing secretary of this club
    if req.role == "secretary":
        existing_secretaries = db.query(Membership).filter(
            Membership.club_id == club_id,
            Membership.role == "secretary",
            Membership.user_id != req.user_id
        ).all()
        for s in existing_secretaries:
            s.role = "member"

    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == req.user_id
    ).first()

    if membership:
        membership.role = req.role
    else:
        membership = Membership(
            user_id=req.user_id,
            club_id=club_id,
            role=req.role
        )
        db.add(membership)

    db.commit()
    db.refresh(membership)
    return membership


@router.delete("/{club_id}/remove-role/{role}")
def remove_club_role_admin(
    club_id: int,
    role: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Admin-only: Remove a club-specific role (e.g. president or secretary)
    by reverting any user holding that role in this club back to 'member'.
    """
    memberships = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.role == role
    ).all()

    for m in memberships:
        m.role = "member"

    db.commit()
    return {"message": f"All {role} assignments removed for club {club_id}"}


@router.get("/{club_id}/stats")
def get_club_stats(
    club_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get club statistics: member count, event count, etc."""
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    member_count = db.query(Membership).filter(Membership.club_id == club_id).count()
    event_count = db.query(Event).filter(Event.club_id == club_id).count()
    announcement_count = db.query(Announcement).filter(Announcement.club_id == club_id).count()

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    upcoming_events = db.query(Event).filter(
        Event.club_id == club_id,
        Event.is_active == True,
        Event.start_time >= now
    ).count()

    club_event_ids = [e.id for e in db.query(Event.id).filter(Event.club_id == club_id).all()]
    registration_count = 0
    if club_event_ids:
        from sqlalchemy import func, select
        registration_count = db.execute(
            select(func.count()).select_from(event_participants).where(
                event_participants.c.event_id.in_(club_event_ids)
            )
        ).scalar() or 0

    pending_requests_count = db.query(MembershipRequest).filter(
        MembershipRequest.club_id == club_id,
        MembershipRequest.status == RequestStatus.PENDING.value
    ).count()

    return {
        "club_id": club_id,
        "member_count": member_count,
        "event_count": event_count,
        "upcoming_events": upcoming_events,
        "announcement_count": announcement_count,
        "total_registrations": registration_count,
        "pending_requests_count": pending_requests_count,
    }




