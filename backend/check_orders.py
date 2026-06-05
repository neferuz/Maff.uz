import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id, user_id, full_name, phone FROM orders"))
        rows = result.fetchall()
        for r in rows:
            print(r)

asyncio.run(main())
