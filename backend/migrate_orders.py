import asyncio
from app.db.session import engine
from app.models.base import Base

# Important: Need to import all models so Base knows about them
from app.models import order

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Models synced")

if __name__ == "__main__":
    asyncio.run(init_models())
