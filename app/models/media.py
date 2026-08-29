from sqlalchemy import String, LargeBinary, DateTime, text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class MediaFile(Base):
    __tablename__ = "media_files"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=text('now()'), nullable=False)
