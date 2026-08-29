import sqlite3
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.dependencies import get_db
from app.main import app
from app.models.user import User
from app.models.notification import Notification
from app.core.security import hash_password, create_access_token
from app.services.notification import create_notification


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(engine, "connect")
def set_sqlite_functions(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        dbapi_connection.create_function("now", 0, lambda: datetime.now(timezone.utc).isoformat())


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def auth_header_for_user(user: User) -> dict:
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def test_notifications_crud(db_session, client):
    # 1. Create a test user
    user = User(username="johndoe", email="john@test.com", password=hash_password("pass123"))
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    headers = auth_header_for_user(user)

    # 2. Check initial count (should be 0)
    res = client.get("/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 0

    # 3. Create helper notification
    noti1 = create_notification(
        db=db_session,
        user_id=user.id,
        title="Test Notification 1",
        content="Hello world",
        link="/test-link"
    )

    # 4. Check count (should be 1)
    res = client.get("/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    assert res.json()["unread_count"] == 1

    # 5. List notifications
    res = client.get("/notifications/", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Notification 1"
    assert data[0]["is_read"] is False

    # 6. Mark as read
    res = client.post(f"/notifications/{noti1.id}/read", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "Notification marked as read"

    # 7. Check count (should be 0)
    res = client.get("/notifications/unread-count", headers=headers)
    assert res.json()["unread_count"] == 0

    # 8. Create two more notifications
    noti2 = create_notification(db=db_session, user_id=user.id, title="Test 2", content="B")
    noti3 = create_notification(db=db_session, user_id=user.id, title="Test 3", content="C")

    res = client.get("/notifications/unread-count", headers=headers)
    assert res.json()["unread_count"] == 2

    # 9. Mark all as read
    res = client.post("/notifications/read-all", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "All notifications marked as read"

    # 10. Check count (should be 0)
    res = client.get("/notifications/unread-count", headers=headers)
    assert res.json()["unread_count"] == 0


def test_delete_user_admin(db_session, client):
    from app.models.club import Club
    from app.models.membership import Membership
    from app.models.event import Event
    from app.models.event_participant import event_participants

    # 1. Create admin and a test user
    admin = User(username="adminuser", email="admin@test.com", password=hash_password("pass123"), is_superuser=True)
    user = User(username="memberuser", email="member@test.com", password=hash_password("pass123"), is_superuser=False)
    db_session.add_all([admin, user])
    db_session.commit()
    db_session.refresh(admin)
    db_session.refresh(user)

    # 2. Create a club and membership for user
    club = Club(name="Test Club", description="Testing")
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)

    membership = Membership(user_id=user.id, club_id=club.id, role="member")
    db_session.add(membership)
    db_session.commit()
    db_session.refresh(membership)

    # 3. Create an event and register user
    event = Event(
        club_id=club.id,
        title="Test Event",
        description="Testing",
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc)
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)

    # Add participant
    db_session.execute(event_participants.insert().values(event_id=event.id, user_id=user.id))
    db_session.commit()

    # Verify initial state
    assert db_session.query(Membership).filter(Membership.user_id == user.id).count() == 1
    assert db_session.execute(
        event_participants.select().where(event_participants.c.user_id == user.id)
    ).first() is not None

    # 4. Delete user using admin client
    headers = auth_header_for_user(admin)
    res = client.delete(f"/users/{user.id}", headers=headers)
    assert res.status_code == 204

    # 5. Verify user and cascades are gone
    assert db_session.query(User).filter(User.id == user.id).first() is None
    assert db_session.query(Membership).filter(Membership.user_id == user.id).count() == 0
    assert db_session.execute(
        event_participants.select().where(event_participants.c.user_id == user.id)
    ).first() is None

    # 6. Verify admin cannot delete themselves
    res = client.delete(f"/users/{admin.id}", headers=headers)
    assert res.status_code == 400
    assert "Cannot delete your own account" in res.json()["detail"]


def test_remove_member_unassigns_tasks(db_session, client):
    from app.models.club import Club
    from app.models.membership import Membership
    from app.models.event import Event
    from app.models.event_task import EventTask

    # 1. Create president (officer) and member
    president = User(username="president1", email="pres@test.com", password=hash_password("pass123"))
    member = User(username="member1", email="member@test.com", password=hash_password("pass123"))
    db_session.add_all([president, member])
    db_session.commit()
    db_session.refresh(president)
    db_session.refresh(member)

    # 2. Create club and memberships
    club = Club(name="Robotics Club", description="Robotics")
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)

    m_pres = Membership(user_id=president.id, club_id=club.id, role="president")
    m_mem = Membership(user_id=member.id, club_id=club.id, role="member")
    db_session.add_all([m_pres, m_mem])
    db_session.commit()

    # 3. Create event and task assigned to member
    event = Event(
        club_id=club.id,
        title="Hackathon",
        description="Coding",
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc)
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)

    task = EventTask(
        event_id=event.id,
        assigned_to=member.id,
        assigned_by=president.id,
        title="Fix UI bugs",
        status="pending",
        priority="medium"
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # Verify task is initially assigned to member
    assert task.assigned_to == member.id

    # 4. President removes member
    headers = auth_header_for_user(president)
    res = client.delete(f"/clubs/{club.id}/members/{member.id}", headers=headers)
    assert res.status_code == 204

    # 5. Verify membership is gone and task is unassigned (assigned_to = None)
    assert db_session.query(Membership).filter(Membership.club_id == club.id, Membership.user_id == member.id).first() is None
    db_session.refresh(task)
    assert task.assigned_to is None


def test_leave_club_unassigns_tasks(db_session, client):
    from app.models.club import Club
    from app.models.membership import Membership
    from app.models.event import Event
    from app.models.event_task import EventTask

    # 1. Create president and member
    president = User(username="president2", email="pres2@test.com", password=hash_password("pass123"))
    member = User(username="member2", email="member2@test.com", password=hash_password("pass123"))
    db_session.add_all([president, member])
    db_session.commit()
    db_session.refresh(president)
    db_session.refresh(member)

    # 2. Create club and memberships
    club = Club(name="Art Club", description="Art")
    db_session.add(club)
    db_session.commit()
    db_session.refresh(club)

    m_pres = Membership(user_id=president.id, club_id=club.id, role="president")
    m_mem = Membership(user_id=member.id, club_id=club.id, role="member")
    db_session.add_all([m_pres, m_mem])
    db_session.commit()

    # 3. Create event and task assigned to member
    event = Event(
        club_id=club.id,
        title="Art Exhibition",
        description="Paintings",
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc)
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)

    task = EventTask(
        event_id=event.id,
        assigned_to=member.id,
        assigned_by=president.id,
        title="Setup Gallery",
        status="pending",
        priority="medium"
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # Verify task is initially assigned to member
    assert task.assigned_to == member.id

    # 4. Member leaves club
    headers = auth_header_for_user(member)
    res = client.delete(f"/clubs/{club.id}/leave", headers=headers)
    assert res.status_code == 200

    # 5. Verify membership is gone and task is unassigned
    assert db_session.query(Membership).filter(Membership.club_id == club.id, Membership.user_id == member.id).first() is None
    db_session.refresh(task)
    assert task.assigned_to is None
