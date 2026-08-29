from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ClubCreate(BaseModel):
    name: str
    description: str | None = None
    logo_url: str | None = None
    cover_url: str | None = None
    meeting_location: str | None = None
    meeting_time: str | None = None
    gallery: str | None = None
    contact_email: str | None = None
    category: str | None = None


class ClubUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    logo_url: str | None = None
    cover_url: str | None = None
    meeting_location: str | None = None
    meeting_time: str | None = None
    gallery: str | None = None
    is_active: bool | None = None
    contact_email: str | None = None
    category: str | None = None


class ClubResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    logo_url: str | None = None
    cover_url: str | None = None
    meeting_location: str | None = None
    meeting_time: str | None = None
    gallery: str | None = None
    is_active: bool
    contact_email: str | None = None
    category: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
