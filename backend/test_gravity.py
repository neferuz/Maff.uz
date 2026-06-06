import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id, name, category_id FROM product WHERE name ILIKE '%Gravity%'"))
        rows = res.fetchall()
        
    print(f"Found {len(rows)} Gravity products.")
    if rows:
        print(f"[{rows[0].id}] {rows[0].name} (Cat: {rows[0].category_id})")

asyncio.run(main())
