from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Super Admin
    SUPER_ADMIN_EMAIL: str
    SUPER_ADMIN_PASSWORD: str
    SUPER_ADMIN_USERNAME: str
    
    # Default Staff Password
    DEFAULT_STAFF_PASSWORD: str
    
    # App
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()