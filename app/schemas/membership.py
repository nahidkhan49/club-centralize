from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class MembershipRole(str, Enum):
    president = "president"
    vice_president = "vice_president"
    secretary = "secretary"
    treasurer = "treasurer"
    member = "member"


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
