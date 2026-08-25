from pydantic_settings import BaseSettings,SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str | None = None
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "club_centralize"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    JWT_SECRET_KEY: str = "change-this-to-a-long-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
settings = Settings()