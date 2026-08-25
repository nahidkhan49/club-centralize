from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    club_id: int | None = None
    club_name: str | None = None
    source_location: str | None = None
    is_published: bool = True


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    club_name: str | None = None
    source_location: str | None = None
    is_published: bool | None = None


class AnnouncementResponse(BaseModel):
    id: int
    club_id: int | None = None
    author_id: int
    title: str
    content: str
    is_published: bool
    club_name: str | None = None
    source_location: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
