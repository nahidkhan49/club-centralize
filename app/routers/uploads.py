import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/uploads",
    tags=["Uploads"]
)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_APK_EXTENSIONS = {".apk", ".zip"}
MAX_APK_SIZE = 150 * 1024 * 1024  # 150 MB

UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an image file (club logo, event photo, avatar, etc.)."""
    filename = file.filename or "image.png"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        contents = await file.read()
        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image too large. Maximum allowed size is 10MB."
            )

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )
    finally:
        await file.close()

    image_url = f"/static/uploads/{unique_filename}"
    return {"url": image_url, "filename": unique_filename}


@router.post("/apk")
async def upload_apk(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload an Android mobile application (.apk) file."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload the mobile app package."
        )

    filename = file.filename or "app.apk"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_APK_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported package format '{ext}'. Please upload an .apk file."
        )

    unique_filename = f"club-centralize-{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        contents = await file.read()
        if len(contents) > MAX_APK_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="APK package too large. Maximum allowed size is 150MB."
            )

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload APK: {str(e)}"
        )
    finally:
        await file.close()

    apk_url = f"/static/uploads/{unique_filename}"
    return {"url": apk_url, "filename": unique_filename}
