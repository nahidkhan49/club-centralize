from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ClubMessageCreate(BaseModel):
    content: str
    user_id: int | None = None  # Mandatory if officer is sending; optional for member (defaults to self)


class ClubMessageResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    sender_id: int
    sender_name: str | None = None
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClubChatParticipant(BaseModel):
    user_id: int
    username: str
    avatar_url: str | None = None
    last_message: str | None = None
    last_message_time: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
