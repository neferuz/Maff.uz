import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT id FROM "user" LIMIT 1'))
        user_row = res.fetchone()
        if user_row:
            user_id = user_row[0]
            await conn.execute(text(f"UPDATE orders SET user_id = {user_id} WHERE id = 1"))
            print(f"Order 1 linked to user {user_id}")
        else:
            print("No users found")

asyncio.run(main())
