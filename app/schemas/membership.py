from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class MembershipRole(str, Enum):
    president = "president"
    vice_president = "vice_president"
    secretary = "secretary"
    treasurer = "treasurer"
    member = "member"


class MembershipRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class MembershipResponse(BaseModel):
    id: int
    user_id: int
    club_id: int
    role: MembershipRole

    model_config = ConfigDict(from_attributes=True)


class ClubMemberResponse(BaseModel):
    user_id: int
    username: str
    email: str
    role: MembershipRole

    model_config = ConfigDict(from_attributes=True)


class MembershipRoleUpdate(BaseModel):
    role: MembershipRole = Field(
        ...,
        description="The role to assign to the member.",
        examples=["president"]
    )


class MembershipRequestResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    username: str | None = None
    user_email: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    reviewed_by_id: int | None = None
    reviewed_by_username: str | None = None
    reviewed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class MyMembershipRequestStatusResponse(BaseModel):
    club_id: int
    status: str | None = None  # PENDING, APPROVED, REJECTED, or None
    is_member: bool = False
    role: str | None = None
    request_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
