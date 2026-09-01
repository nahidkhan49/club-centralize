from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import decode_access_token
from app.models.membership import Membership
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")




def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency that provides a SQLAlchemy session per request
    and ensures the session is properly closed after the request is processed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency that extracts and validates the JWT token from the request header,
    retrieves the corresponding user from the database, and returns the User object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

# Club president dependency
def get_club_president(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Membership:
    """Ensures the current user is the club president."""
    from app.models.membership import Membership
    from app.schemas.membership import MembershipRole

    if current_user.is_superuser:
        return None

    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == current_user.id
    ).first()

    if not membership or membership.role != MembershipRole.president.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club president can perform this action"
        )
    return membership


def get_club_secretary(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Membership:
    """Ensures the current user is the club secretary.
    Returns the Membership object for the secretary role.
    """
    # Superuser bypass – admin can act as secretary for any club
    if current_user.is_superuser:
        return None

    from app.models.membership import Membership
    from app.schemas.membership import MembershipRole

    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == current_user.id
    ).first()

    if not membership or membership.role != MembershipRole.secretary.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club secretary can perform this action"
        )
    return membership


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user is active.
    """
    if hasattr(current_user, "is_active") and not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency that ensures the current user is a superuser (admin).
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )
    return current_user


def get_club_event_manager(
    club_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Membership:
    """
    Dependency that ensures the current user is either the club president, secretary, event manager, or a superuser.
    Returns the Membership object for further use.
    """
    from app.models.membership import Membership
    from app.schemas.membership import MembershipRole

    # Superuser bypass
    if current_user.is_superuser:
        return None

    membership = db.query(Membership).filter(
        Membership.club_id == club_id,
        Membership.user_id == current_user.id
    ).first()

    if not membership or membership.role not in (
        MembershipRole.president.value,
        MembershipRole.secretary.value,
        MembershipRole.event_manager.value,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only club president, secretary, or designated event manager can perform this action",
        )
    return membership

