import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = 4)"))
            await conn.execute(text("DELETE FROM orders WHERE user_id = 4"))
            await conn.execute(text("DELETE FROM \"user\" WHERE id = 4"))
            print("User 4 and their orders deleted successfully.")
        except Exception as e:
            print("Failed to delete user 4:", e)

if __name__ == "__main__":
    asyncio.run(main())
