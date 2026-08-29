import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.setting import SystemSetting
from app.models.user import User

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

DEFAULT_BRANDING = {
    "site_name": "Club Centralize",
    "site_logo": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=200&q=80",
    "tagline": "Empowering Campus Student Organizations",
    "apk_url": "/static/uploads/club-centralize.apk",
    "app_version": "1.0.0"
}


class BrandingSettings(BaseModel):
    site_name: str
    site_logo: str | None = None
    tagline: str | None = None
    apk_url: str | None = None
    app_version: str | None = None


@router.get("/branding", response_model=BrandingSettings)
def get_branding(db: Session = Depends(get_db)):
    """Public endpoint to get site name, logo, tagline, and mobile APK download URL."""
    setting = db.query(SystemSetting).filter(SystemSetting.key == "branding").first()
    if not setting:
        return BrandingSettings(**DEFAULT_BRANDING)
    try:
        data = json.loads(setting.value)
        return BrandingSettings(**{**DEFAULT_BRANDING, **data})
    except Exception:
        return BrandingSettings(**DEFAULT_BRANDING)


@router.put("/branding", response_model=BrandingSettings)
def update_branding(
    payload: BrandingSettings,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin-only endpoint to update site name, logo, tagline, and APK download link."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can customize site branding and mobile packages."
        )

    setting = db.query(SystemSetting).filter(SystemSetting.key == "branding").first()
    data_json = json.dumps(payload.model_dump() if hasattr(payload, "model_dump") else payload.dict())

    if not setting:
        setting = SystemSetting(key="branding", value=data_json)
        db.add(setting)
    else:
        setting.value = data_json

    db.commit()
    return payload
