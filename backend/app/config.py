import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "RefundShield API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "refundshield")
    AI_MODEL_MODE: str = os.getenv("AI_MODEL_MODE", "demo")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))

settings = Settings()
