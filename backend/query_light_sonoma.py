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
        sql = "SELECT id, name FROM product WHERE name ILIKE '%Light Sonoma%';"
        result = await conn.execute(text(sql))
        rows = result.fetchall()
        for r in rows:
            print(f"ID: {r[0]} | Name: {r[1]}")

asyncio.run(main())
