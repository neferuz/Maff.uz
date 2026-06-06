import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def test():
    async with AsyncSessionLocal() as db:
        try:
            res = await db.execute(text("SELECT count(*) FROM product;"))
            print("Total products:", res.scalar())
        except Exception as e:
            print("DB Error:", e)

asyncio.run(test())
