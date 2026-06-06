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
        res = await conn.execute(text("SELECT id, name, image_url, is_active FROM product WHERE category_id = 1 AND is_active = True"))
        products = res.fetchall()
        no_photo = [p for p in products if not p[2]]
        has_photo = [p for p in products if p[2]]
        print(f"Total products in Cat 1: {len(products)}")
        print(f"Products WITH photo: {len(has_photo)}")
        print(f"Products WITHOUT photo: {len(no_photo)}")
        print("\nExamples without photo:")
        for p in no_photo[:10]:
            print(f"  ID={p[0]} | {p[1]}")

asyncio.run(main())
