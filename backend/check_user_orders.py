import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT id, email, full_name FROM "user"'))
        users = res.fetchall()
        print("Users:", users)
        
        res = await conn.execute(text("SELECT id, user_id FROM orders"))
        orders = res.fetchall()
        print("Orders:", orders)

asyncio.run(main())
