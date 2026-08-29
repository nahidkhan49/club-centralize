from datetime import datetime, timedelta
from pydantic import BaseModel, ConfigDict, Field, model_validator


class EventBase(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    date: datetime | None = None
    is_active: bool | None = True

    model_config = ConfigDict(from_attributes=True)


class EventCreate(EventBase):
    club_id: int

    @model_validator(mode='after')
    def set_start_end_time(self):
        if not self.start_time:
            if self.date:
                self.start_time = self.date
            else:
                self.start_time = datetime.now()
        if not self.end_time:
            self.end_time = self.start_time + timedelta(hours=2)
        return self


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    date: datetime | None = None
    is_active: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class EventResponse(BaseModel):
    id: int
    club_id: int
    title: str
    description: str | None = None
    location: str | None = None
    image_url: str | None = None
    start_time: datetime
    end_time: datetime
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
