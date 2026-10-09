import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.database.mock_db import mock_db

logger = logging.getLogger("refundshield.db")

client: AsyncIOMotorClient = None
db = None
use_mongo = False

async def connect_to_mongo():
    global client, db, use_mongo
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Verify connection
        await client.admin.command('ping')
        db = client[settings.DATABASE_NAME]
        use_mongo = True
        logger.info(f"Successfully connected to MongoDB at {settings.MONGODB_URI}")
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to in-memory MockDatabase.")
        use_mongo = False

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("Closed MongoDB connection.")

def get_db():
    if use_mongo and db is not None:
        return db
    return mock_db
