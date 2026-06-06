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
        # Check what is currently inside "Порта" (category 428)
        res1 = await conn.execute(text("SELECT name FROM product WHERE category_id = 428;"))
        print("Currently in 'Порта':", [r[0] for r in res1.fetchall()])
        
        # Move all "Порта-%" products that are in "Двери Portika" (323) into "Порта" (428), except Invisible
        sql = """
        UPDATE product 
        SET category_id = 428 
        WHERE name ILIKE 'Порта-%' 
          AND name NOT ILIKE '%Invisible%' 
          AND category_id = 323;
        """
        result = await conn.execute(text(sql))
        print(f"Moved {result.rowcount} Porta products into the correct category.")

asyncio.run(main())
