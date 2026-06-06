import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    async with engine.begin() as conn:
        res = await conn.execute(text("UPDATE product SET is_active = False WHERE brand ILIKE '%Silkwood%' OR name ILIKE '%Silkwood%' OR name ILIKE '%Демонтаж%'"))
        print(f"Archived {res.rowcount} products.")

asyncio.run(main())
