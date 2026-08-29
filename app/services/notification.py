from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    content: str,
    link: str | None = None
) -> Notification:
    """
    Helper function to create a notification, add to session, commit, and refresh.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        link=link
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
