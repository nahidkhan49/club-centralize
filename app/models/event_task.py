from sqlalchemy import String, Text, DateTime, ForeignKey, text, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class EventTask(Base):
    __tablename__ = "event_tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="pending", server_default="pending", nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", server_default="medium", nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    due_date: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=text('now()'), nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=text('now()'), onupdate=func.now(), nullable=False)

    # Relationships
    event: Mapped["Event"] = relationship("Event", backref="tasks")
    assignee: Mapped["User"] = relationship("User", foreign_keys=[assigned_to], backref="assigned_tasks")
    assigner: Mapped["User"] = relationship("User", foreign_keys=[assigned_by])
