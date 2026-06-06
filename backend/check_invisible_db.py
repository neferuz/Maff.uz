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
        result = await conn.execute(text("SELECT id, name, image_url FROM product WHERE name ILIKE '%Порта Invisible 4AB Праймер White%(Черный: М/B2B)%';"))
        for row in result.fetchall():
            print(f"ID: {row[0]}, Name: {row[1]}")

asyncio.run(main())
