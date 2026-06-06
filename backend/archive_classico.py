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
            UPDATE product 
            SET is_active = false 
            WHERE (name ILIKE '%Классико-33 ПП Alaska White%' 
               OR name ILIKE '%Классико-83 ПП Alaska White%')
            AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Классико%');
        """))
        print(f"Archived {result.rowcount} repeating products (33 and 83 Alaska White Crystal).")

asyncio.run(main())
