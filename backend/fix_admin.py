import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        # Check user 4 superuser status
        res = await conn.execute(text('SELECT id, is_superuser FROM "user" WHERE id = 4'))
        print("User 4:", res.fetchall())
        
        # Link both orders to User 4 so they can see it in profile
        await conn.execute(text("UPDATE orders SET user_id = 4 WHERE id IN (1, 2)"))
        
        # Make User 4 a superuser so they can use the Admin panel
        await conn.execute(text('UPDATE "user" SET is_superuser = true WHERE id = 4'))

asyncio.run(main())
