from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    start_time: datetime
    end_time: datetime
    is_active: bool | None = True

    model_config = ConfigDict(from_attributes=True)


class EventCreate(EventBase):
    club_id: int


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_active: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class EventResponse(EventBase):
    id: int
    club_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
