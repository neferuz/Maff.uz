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
        result = await conn.execute(text("""
            SELECT name, image_url 
            FROM product 
            WHERE name ILIKE '%Zadoor%' OR category_id IN (
                SELECT id FROM category WHERE name ILIKE '%Zadoor%' OR name ILIKE '%Art Lite%' OR name ILIKE '%Classic Baguette%'
            )
            LIMIT 20;
        """))
        for row in result.fetchall():
            print(f"{row[0]} | {row[1]}")

asyncio.run(main())
