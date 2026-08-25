from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,DeclarativeBase

from app.core.config import settings


DATABASE_URL=(
    f"postgresql+psycopg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
)

engine=create_engine(DATABASE_URL,echo=True)

SessionLocal=sessionmaker(bind=engine,autocommit=False,autoflush=False)

class Base(DeclarativeBase):
    pass