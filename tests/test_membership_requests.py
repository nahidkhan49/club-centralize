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
from app.models.club import Club
from app.models.membership import Membership
from app.models.membership_request import MembershipRequest, RequestStatus
from app.core.security import hash_password, create_access_token


# Setup in-memory SQLite database for automated testing
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
    # Pass lifespan='off' to prevent connecting to production DB during in-memory tests
    with TestClient(app, raise_server_exceptions=True) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def auth_header_for_user(user: User) -> dict:
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


def setup_test_environment(db):
    """
    Creates:
    - user1 (normal student)
    - user_pres_a (president of Club A)
    - user_sec_a (secretary of Club A)
    - user_sec_b (secretary of Club B)
    - user_multi (president of Club A, secretary of Club B)
    - club_a, club_b, club_c
    """
    u_normal = User(username="alice", email="alice@test.com", password=hash_password("pass123"), is_superuser=False)
    u_pres_a = User(username="pres_a", email="pres_a@test.com", password=hash_password("pass123"), is_superuser=False)
    u_sec_a = User(username="sec_a", email="sec_a@test.com", password=hash_password("pass123"), is_superuser=False)
    u_sec_b = User(username="sec_b", email="sec_b@test.com", password=hash_password("pass123"), is_superuser=False)
    u_multi = User(username="multi_officer", email="multi@test.com", password=hash_password("pass123"), is_superuser=False)
    admin_u = User(username="sysadmin", email="admin@test.com", password=hash_password("pass123"), is_superuser=True)

    db.add_all([u_normal, u_pres_a, u_sec_a, u_sec_b, u_multi, admin_u])
    db.commit()

    club_a = Club(name="Robotics Club", description="Robotics", is_active=True)
    club_b = Club(name="Debate Club", description="Debate", is_active=True)
    club_c = Club(name="Chess Club", description="Chess", is_active=True)
    db.add_all([club_a, club_b, club_c])
    db.commit()

    # Assign leadership roles
    m_pres_a = Membership(user_id=u_pres_a.id, club_id=club_a.id, role="president")
    m_sec_a = Membership(user_id=u_sec_a.id, club_id=club_a.id, role="secretary")
    m_sec_b = Membership(user_id=u_sec_b.id, club_id=club_b.id, role="secretary")
    m_multi_a = Membership(user_id=u_multi.id, club_id=club_a.id, role="president")
    m_multi_b = Membership(user_id=u_multi.id, club_id=club_b.id, role="secretary")

    db.add_all([m_pres_a, m_sec_a, m_sec_b, m_multi_a, m_multi_b])
    db.commit()

    return {
        "alice": u_normal,
        "pres_a": u_pres_a,
        "sec_a": u_sec_a,
        "sec_b": u_sec_b,
        "multi": u_multi,
        "admin": admin_u,
        "club_a": club_a,
        "club_b": club_b,
        "club_c": club_c,
    }


def test_scenario_1_normal_user_join_request_pending(client, db_session):
    """
    Scenario 1:
    Normal user requests to join a club.
    Expected: Status becomes PENDING and no active member permissions are granted in Membership.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    club_a = data["club_a"]

    headers = auth_header_for_user(alice)
    res = client.post(f"/clubs/{club_a.id}/join", headers=headers)
    assert res.status_code == 201, res.text
    res_data = res.json()
    assert res_data["status"] == "PENDING"
    assert res_data["club_id"] == club_a.id
    assert res_data["user_id"] == alice.id

    # Verify no record in memberships table
    membership = db_session.query(Membership).filter(
        Membership.user_id == alice.id,
        Membership.club_id == club_a.id
    ).first()
    assert membership is None

    # Check status endpoint
    status_res = client.get(f"/clubs/{club_a.id}/my-request", headers=headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "PENDING"
    assert status_res.json()["is_member"] is False


def test_scenario_2_president_approves_request(client, db_session):
    """
    Scenario 2:
    President approves the request.
    Expected: User becomes an active MEMBER of that club.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    pres_a = data["pres_a"]
    club_a = data["club_a"]

    # Alice submits join request
    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]

    # President A views requests and approves
    pres_headers = auth_header_for_user(pres_a)
    list_res = client.get(f"/clubs/{club_a.id}/requests", headers=pres_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    approve_res = client.post(f"/clubs/{club_a.id}/requests/{req_id}/approve", headers=pres_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"
    assert approve_res.json()["reviewed_by_id"] == pres_a.id

    # Verify Alice is now an active member in memberships table
    membership = db_session.query(Membership).filter(
        Membership.user_id == alice.id,
        Membership.club_id == club_a.id
    ).first()
    assert membership is not None
    assert membership.role == "member"

    # Alice checks status
    status_res = client.get(f"/clubs/{club_a.id}/my-request", headers=auth_header_for_user(alice))
    assert status_res.json()["is_member"] is True
    assert status_res.json()["role"] == "member"


def test_scenario_3_secretary_approves_request(client, db_session):
    """
    Scenario 3:
    Secretary approves the request.
    Expected: User becomes an active MEMBER of that club.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    sec_a = data["sec_a"]
    club_a = data["club_a"]

    # Alice requests to join
    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]

    # Secretary A approves
    sec_headers = auth_header_for_user(sec_a)
    approve_res = client.post(f"/clubs/{club_a.id}/requests/{req_id}/approve", headers=sec_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # Alice is now an active member
    membership = db_session.query(Membership).filter(
        Membership.user_id == alice.id,
        Membership.club_id == club_a.id
    ).first()
    assert membership is not None
    assert membership.role == "member"


def test_scenario_4_president_rejects_request(client, db_session):
    """
    Scenario 4:
    President rejects the request.
    Expected: User does not become a member; request status is REJECTED.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    pres_a = data["pres_a"]
    club_a = data["club_a"]

    # Alice requests to join
    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]

    # President A rejects
    pres_headers = auth_header_for_user(pres_a)
    reject_res = client.post(f"/clubs/{club_a.id}/requests/{req_id}/reject", headers=pres_headers)
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"

    # Verify not in memberships
    membership = db_session.query(Membership).filter(
        Membership.user_id == alice.id,
        Membership.club_id == club_a.id
    ).first()
    assert membership is None

    # Alice checks status
    status_res = client.get(f"/clubs/{club_a.id}/my-request", headers=auth_header_for_user(alice))
    assert status_res.json()["status"] == "REJECTED"
    assert status_res.json()["is_member"] is False


def test_scenario_5_cross_club_secretary_cannot_approve(client, db_session):
    """
    Scenario 5:
    Secretary of another club attempts to approve the request.
    Expected: 403 Forbidden.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    sec_b = data["sec_b"]  # Secretary of Club B
    club_a = data["club_a"]  # Request is for Club A

    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]

    # Secretary of Club B attempts to approve Club A request
    sec_b_headers = auth_header_for_user(sec_b)
    approve_res = client.post(f"/clubs/{club_a.id}/requests/{req_id}/approve", headers=sec_b_headers)
    assert approve_res.status_code == 403

    # Secretary of Club B attempts to view Club A requests
    list_res = client.get(f"/clubs/{club_a.id}/requests", headers=sec_b_headers)
    assert list_res.status_code == 403


def test_scenario_6_duplicate_pending_request_prevented(client, db_session):
    """
    Scenario 6:
    User already has a pending request and submits another request.
    Expected: Duplicate request is prevented with 400 Bad Request.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    club_a = data["club_a"]

    headers = auth_header_for_user(alice)
    res1 = client.post(f"/clubs/{club_a.id}/join", headers=headers)
    assert res1.status_code == 201

    # Second submission while still pending
    res2 = client.post(f"/clubs/{club_a.id}/join", headers=headers)
    assert res2.status_code == 400
    assert "pending join request" in res2.json()["detail"].lower()


def test_scenario_7_approved_member_cannot_join_again(client, db_session):
    """
    Scenario 7:
    User is already an approved member and attempts to join again.
    Expected: Duplicate membership is prevented with 400 Bad Request.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    pres_a = data["pres_a"]
    club_a = data["club_a"]

    # Join and approve
    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]
    client.post(f"/clubs/{club_a.id}/requests/{req_id}/approve", headers=auth_header_for_user(pres_a))

    # Attempt to join again
    second_join = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    assert second_join.status_code == 400
    assert "already an active member" in second_join.json()["detail"].lower()


def test_scenario_8_multi_club_role_isolation(client, db_session):
    """
    Scenario 8:
    Same user is President of Club A, Secretary of Club B, and requests membership in Club C.
    Expected: All roles and permissions remain isolated by club.
    """
    data = setup_test_environment(db_session)
    multi = data["multi"]
    club_a = data["club_a"]
    club_b = data["club_b"]
    club_c = data["club_c"]

    multi_headers = auth_header_for_user(multi)

    # Multi user is President in Club A -> can access Club A requests
    res_a = client.get(f"/clubs/{club_a.id}/requests", headers=multi_headers)
    assert res_a.status_code == 200

    # Multi user is Secretary in Club B -> can access Club B requests
    res_b = client.get(f"/clubs/{club_b.id}/requests", headers=multi_headers)
    assert res_b.status_code == 200

    # Multi user is NOT an officer in Club C -> cannot access Club C requests (403)
    res_c_officer = client.get(f"/clubs/{club_c.id}/requests", headers=multi_headers)
    assert res_c_officer.status_code == 403

    # Multi user requests to join Club C as normal user
    join_c = client.post(f"/clubs/{club_c.id}/join", headers=multi_headers)
    assert join_c.status_code == 201
    assert join_c.json()["status"] == "PENDING"

    # Multi user cannot approve their own request in Club C
    req_c_id = join_c.json()["id"]
    approve_c = client.post(f"/clubs/{club_c.id}/requests/{req_c_id}/approve", headers=multi_headers)
    assert approve_c.status_code == 403


def test_reapply_after_rejection(client, db_session):
    """
    Test user re-applying after a previous rejection resets status to PENDING.
    """
    data = setup_test_environment(db_session)
    alice = data["alice"]
    pres_a = data["pres_a"]
    club_a = data["club_a"]

    # 1. Alice applies
    join_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    req_id = join_res.json()["id"]

    # 2. Pres rejects
    client.post(f"/clubs/{club_a.id}/requests/{req_id}/reject", headers=auth_header_for_user(pres_a))

    # 3. Alice re-applies
    reapply_res = client.post(f"/clubs/{club_a.id}/join", headers=auth_header_for_user(alice))
    assert reapply_res.status_code == 201
    assert reapply_res.json()["status"] == "PENDING"

    # 4. Pres approves
    approve_res = client.post(f"/clubs/{club_a.id}/requests/{req_id}/approve", headers=auth_header_for_user(pres_a))
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"
