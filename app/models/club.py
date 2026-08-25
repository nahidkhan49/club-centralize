from sqlalchemy import Boolean, String, Text, DateTime, text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # New optional fields
    contact_email: Mapped[str | None] = mapped_column(String(100), nullable=True)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Timestamps
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=text('now()'), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=text('now()'), onupdate=func.now(), nullable=False)
    # Relationship to events
    events: Mapped[list["Event"]] = relationship("Event", back_populates="club", cascade="all, delete-orphan")
