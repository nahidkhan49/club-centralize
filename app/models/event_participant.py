from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.database import Base

# Association table for many-to-many relationship between Users and Events
event_participants = Table(
    "event_participants",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)
