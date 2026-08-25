import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.db.database import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import hash_password
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.clubs import router as clubs_router
from app.routers.events import router as events_router
from app.routers.announcements import router as announcements_router
from app.routers.uploads import router as uploads_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Auto promote or seed admin user
    db = SessionLocal()
    try:
        # If user 'nahid' exists, ensure superuser is True
        nahid_user = db.query(User).filter(User.username.ilike("nahid")).first()
        if nahid_user:
            nahid_user.is_superuser = True
            db.commit()

        # If no superuser exists at all, promote first registered user or create default admin
        admin_exists = db.query(User).filter(User.is_superuser == True).first()
        if not admin_exists:
            first_user = db.query(User).first()
            if first_user:
                first_user.is_superuser = True
                db.commit()
            else:
                default_admin = User(
                    username="admin",
                    email="admin@clubcentralize.com",
                    password=hash_password("admin123"),
                    is_superuser=True
                )
                db.add(default_admin)
                db.commit()
    except Exception as e:
        print(f"Startup admin initialization error: {e}")
        db.rollback()
    finally:
        db.close()

    yield


app = FastAPI(
    title="Club Centralize API",
    version="1.0.0",
    lifespan=lifespan
)

# Ensure static/uploads exists
os.makedirs(os.path.join(os.getcwd(), "static", "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(clubs_router)
app.include_router(events_router)
app.include_router(announcements_router)
app.include_router(uploads_router)