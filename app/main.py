import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from app.db.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.media import MediaFile
from app.core.security import hash_password
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.clubs import router as clubs_router
from app.routers.events import router as events_router
from app.routers.announcements import router as announcements_router
from app.routers.uploads import router as uploads_router
from app.routers.settings import router as settings_router
from app.routers.event_tasks import router as event_tasks_router

from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist
    Base.metadata.create_all(bind=engine)

    # Auto-add missing columns & widen URL fields to TEXT in Postgres tables
    try:
        with engine.begin() as conn:
            # Safe table creation for media_files
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS media_files (
                    id VARCHAR(64) PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    content_type VARCHAR(100) NOT NULL,
                    file_size INTEGER NOT NULL DEFAULT 0,
                    data BYTEA NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                );
            """))

            # Safe column additions & type adjustments for clubs table
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS cover_url TEXT;"))
            conn.execute(text("ALTER TABLE clubs ALTER COLUMN logo_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE clubs ALTER COLUMN cover_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS meeting_location VARCHAR(255);"))
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS meeting_time VARCHAR(255);"))
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS gallery TEXT;"))
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100);"))
            conn.execute(text("ALTER TABLE clubs ADD COLUMN IF NOT EXISTS category VARCHAR(50);"))

            # Safe column adjustments for users & events
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;"))
            conn.execute(text("ALTER TABLE events ALTER COLUMN image_url TYPE TEXT;"))

            # Safe column additions for announcements table
            conn.execute(text("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS announcement_type VARCHAR(50) DEFAULT 'General';"))

            # Create event_tasks table if not exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS event_tasks (
                    id SERIAL PRIMARY KEY,
                    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    status VARCHAR(30) NOT NULL DEFAULT 'pending',
                    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                    category VARCHAR(50),
                    due_date TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_tasks_event_id ON event_tasks(event_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_event_tasks_assigned_to ON event_tasks(assigned_to);"))
    except Exception as e:
        print(f"Startup DDL column migration warning: {e}")

    # Auto promote or seed admin user
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username.ilike("admin")).first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@clubcentralize.com",
                password=hash_password("admin123"),
                is_superuser=True
            )
            db.add(admin_user)
        else:
            admin_user.is_superuser = True
            admin_user.password = hash_password("admin123")
        db.commit()

        nahid_user = db.query(User).filter(User.username.ilike("nahid")).first()
        if nahid_user:
            nahid_user.is_superuser = True
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

# Ensure static/uploads exists on disk
UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Database fallback route for /static/uploads/{filename} if file was erased on container restart
@app.get("/static/uploads/{filename:path}")
def serve_static_upload_with_db_fallback(filename: str):
    disk_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(disk_path):
        with open(disk_path, "rb") as f:
            data = f.read()
        ext = os.path.splitext(filename)[1].lower()
        ext_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".gif": "image/gif",
            ".apk": "application/vnd.android.package-archive",
            ".zip": "application/zip",
        }
        media_type = ext_map.get(ext, "application/octet-stream")
        return Response(content=data, media_type=media_type, headers={"Cache-Control": "public, max-age=31536000"})

    # Fallback to database
    clean_id = os.path.splitext(filename)[0]
    db = SessionLocal()
    try:
        media = db.query(MediaFile).filter(MediaFile.filename == filename).first()
        if not media:
            media = db.query(MediaFile).filter(MediaFile.id == clean_id).first()
        if not media:
            raise HTTPException(status_code=404, detail="File not found")

        # Cache back to disk
        try:
            with open(disk_path, "wb") as f:
                f.write(media.data)
        except Exception:
            pass

        return Response(
            content=media.data,
            media_type=media.content_type,
            headers={"Cache-Control": "public, max-age=31536000"}
        )
    finally:
        db.close()


app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(clubs_router)
app.include_router(events_router)
app.include_router(announcements_router)
app.include_router(uploads_router)
app.include_router(settings_router)
app.include_router(event_tasks_router)