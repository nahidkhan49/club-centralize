import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.media import MediaFile

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"]
)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"}
MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB

ALLOWED_APK_EXTENSIONS = {".apk", ".zip"}
MAX_APK_SIZE = 150 * 1024 * 1024  # 150 MB

UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_content_type(ext: str) -> str:
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
    return ext_map.get(ext.lower(), "application/octet-stream")


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an image file (logo, cover, event photo, avatar, etc.) stored persistently in the database."""
    filename = file.filename or "image.png"
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = ".png"

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    try:
        contents = await file.read()
        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image too large. Maximum allowed size is 15MB."
            )

        media_id = uuid.uuid4().hex
        content_type = file.content_type or _get_content_type(ext)
        disk_filename = f"{media_id}{ext}"

        # 1. Save persistently in PostgreSQL database
        media_record = MediaFile(
            id=media_id,
            filename=disk_filename,
            content_type=content_type,
            file_size=len(contents),
            data=contents
        )
        db.add(media_record)
        db.commit()

        # 2. Also cache to disk for fast static serving
        try:
            disk_path = os.path.join(UPLOAD_DIR, disk_filename)
            with open(disk_path, "wb") as buffer:
                buffer.write(contents)
        except Exception:
            pass

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload media file: {str(e)}"
        )
    finally:
        await file.close()

    media_url = f"/uploads/media/{media_id}"
    return {
        "url": media_url,
        "id": media_id,
        "filename": disk_filename,
        "content_type": content_type
    }


@router.get("/media/{media_id}")
def get_media(media_id: str, db: Session = Depends(get_db)):
    """Retrieve media directly from PostgreSQL database."""
    # Clean media_id of file extension if passed as uuid.ext
    clean_id = os.path.splitext(media_id)[0]

    media = db.query(MediaFile).filter(MediaFile.id == clean_id).first()
    if not media:
        media = db.query(MediaFile).filter(MediaFile.filename == media_id).first()
    if not media:
        # Check disk fallback
        disk_path = os.path.join(UPLOAD_DIR, media_id)
        if os.path.exists(disk_path):
            with open(disk_path, "rb") as f:
                data = f.read()
            ext = os.path.splitext(media_id)[1].lower()
            return Response(content=data, media_type=_get_content_type(ext))
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

    return Response(
        content=media.data,
        media_type=media.content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Disposition": f'inline; filename="{media.filename}"'
        }
    )


@router.post("/apk")
async def upload_apk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload an Android mobile application (.apk) package and store persistently in the database."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload the mobile app package."
        )

    filename = file.filename or "app.apk"
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        ext = ".apk"

    if ext not in ALLOWED_APK_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported package format '{ext}'. Please upload an .apk file."
        )

    try:
        contents = await file.read()
        if len(contents) > MAX_APK_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="APK package too large. Maximum allowed size is 150MB."
            )

        media_id = f"apk_{uuid.uuid4().hex[:12]}"
        disk_filename = f"club-centralize-{media_id[:8]}{ext}"

        # Save to database
        media_record = MediaFile(
            id=media_id,
            filename=disk_filename,
            content_type="application/vnd.android.package-archive",
            file_size=len(contents),
            data=contents
        )
        db.add(media_record)
        db.commit()

        # Cache to disk
        try:
            disk_path = os.path.join(UPLOAD_DIR, disk_filename)
            with open(disk_path, "wb") as buffer:
                buffer.write(contents)
        except Exception:
            pass

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload APK package: {str(e)}"
        )
    finally:
        await file.close()

    apk_url = f"/uploads/media/{media_id}"
    return {"url": apk_url, "filename": disk_filename}
