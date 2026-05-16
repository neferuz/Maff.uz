import asyncio
from app.db.session import engine
from app.models.base import Base
import app.models # ensure all models are imported

async def init_db():
    async with engine.begin() as conn:
        # This will create all tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
