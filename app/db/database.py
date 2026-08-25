from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase

from app.core.config import settings


def get_database_url() -> str:
    db_url = settings.DATABASE_URL
    if db_url:
        # Render provides postgres:// or postgresql://
        # Convert to postgresql+psycopg:// for SQLAlchemy 2 + psycopg 3
        if db_url.startswith("postgres://"):
            return db_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+psycopg://"):
            return db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return db_url
    return (
        f"postgresql+psycopg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@"
        f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    )

DATABASE_URL = get_database_url()

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass