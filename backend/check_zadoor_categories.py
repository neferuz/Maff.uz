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
        print("Finding categories containing active doors...")
        query = """
            SELECT DISTINCT p.category_id, c.name, count(*) 
            FROM product p
            JOIN category c ON p.category_id = c.id
            WHERE p.is_active = True
            AND (p.name ILIKE '%двер%' OR p.name ILIKE '%пг%' OR p.name ILIKE '%по%' OR c.name ILIKE '%двер%')
            GROUP BY p.category_id, c.name
            ORDER BY count(*) DESC
        """
        res = await conn.execute(text(query))
        for row in res.fetchall():
            print(f"Cat ID={row[0]} | Name='{row[1]}' | Active Product Count={row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
