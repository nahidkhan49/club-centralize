from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    avatar_url: str | None = None
    is_superuser: bool = False
    full_name: str | None = None
    department: str | None = None
    contact: str | None = None
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None
    full_name: str | None = None
    department: str | None = None
    contact: str | None = None
    bio: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
