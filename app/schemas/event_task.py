from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EventTaskCreate(BaseModel):
    title: str
    description: str | None = None
    assigned_to: int | None = None
    status: str = "pending"
    priority: str = "medium"
    category: str | None = None
    due_date: datetime | None = None


class EventTaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assigned_to: int | None = None
    status: str | None = None
    priority: str | None = None
    category: str | None = None
    due_date: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class EventTaskResponse(BaseModel):
    id: int
    event_id: int
    assigned_to: int | None = None
    assigned_by: int | None = None
    title: str
    description: str | None = None
    status: str = "pending"
    priority: str = "medium"
    category: str | None = None
    due_date: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    # Enriched fields from joins
    assignee_name: str | None = None
    assignee_email: str | None = None
    assignee_avatar: str | None = None
    assigner_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
