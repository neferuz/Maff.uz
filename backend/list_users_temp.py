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
        res = await conn.execute(text("SELECT id, email, full_name, phone, is_active, hashed_password FROM \"user\""))
        users = res.fetchall()
        for u in users:
            print(u)

if __name__ == "__main__":
    asyncio.run(main())
