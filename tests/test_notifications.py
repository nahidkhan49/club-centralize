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
