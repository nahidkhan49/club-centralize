import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.db.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.clubs import router as clubs_router
from app.routers.events import router as events_router
from app.routers.announcements import router as announcements_router
from app.routers.uploads import router as uploads_router

app = FastAPI(
    title="Club Centralize API",
    version="1.0.0"
)

# Ensure static/uploads exists
os.makedirs(os.path.join(os.getcwd(), "static", "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins; adjust for production
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