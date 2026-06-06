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
        res = await conn.execute(text("""
            SELECT id, name, category_id, image_url, is_active 
            FROM product 
            WHERE category_id IN (398, 244) AND is_active = True
        """))
        rows = res.fetchall()
        print("Active decor product images:")
        for r in rows:
            print(f"  ID={r.id} | Name='{r.name}' | Cat={r.category_id} | Image='{r.image_url}'")

if __name__ == "__main__":
    asyncio.run(main())
