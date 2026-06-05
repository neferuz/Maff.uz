import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, user_id FROM orders"))
        print("Orders:", res.fetchall())
        res = await conn.execute(text('SELECT id FROM "user"'))
        print("Users:", res.fetchall())

asyncio.run(main())
