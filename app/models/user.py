from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from .event_participant import event_participants


class User(Base):
    __tablename__="users"
    
    id:Mapped[int]=mapped_column(primary_key=True,index=True)
    username:Mapped[str]=mapped_column(String(50),unique=True,nullable=False)
    email:Mapped[str]=mapped_column(String(100),unique=True,nullable=False)
    password:Mapped[str]=mapped_column(String(255),nullable=False)
    is_superuser:Mapped[bool]=mapped_column(default=False, server_default='false', nullable=False)
    joined_events: Mapped[list["Event"]] = relationship(
        "Event",
        secondary=event_participants,
        back_populates="participants",
    )