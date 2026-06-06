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
        # Check all products under the category
        sql = "SELECT p.name, p.image_url FROM product p JOIN category c ON p.category_id = c.id WHERE c.name ILIKE '%Portika%' AND p.name ILIKE 'Порта%';"
        result = await conn.execute(text(sql))
        rows = result.fetchall()
        
        print(f"Total Porta models in DB: {len(rows)}")
        with_img = [r for r in rows if r[1] and r[1].strip() != ""]
        print(f"With image: {len(with_img)}")
        
        # Show first 10 with image and without
        print("\n--- FIRST 5 WITH IMAGE ---")
        for r in with_img[:5]: print(r[0], "->", r[1])
            
        print("\n--- FIRST 5 WITHOUT IMAGE ---")
        without_img = [r for r in rows if not r[1] or r[1].strip() == ""]
        for r in without_img[:5]: print(r[0])

asyncio.run(main())
