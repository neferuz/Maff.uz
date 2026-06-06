import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

search_terms = [
    "80194", "4582", "4525", "4590", "80184", "3884", "4589", "4567",
    "4920", "3941", "4579", "3280", "3787", "3486", "3749", "3340",
    "4531", "3310", "3710", "4924"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        print("Searching for Swiss Krono laminates...")
        for term in search_terms:
            # Search by SKU (either exact or with 'D') or name containing the number
            query = f"SELECT id, name, sku, price, image_url FROM product WHERE sku ILIKE '%{term}%' OR name ILIKE '%{term}%'"
            result = await conn.execute(text(query))
            rows = result.fetchall()
            print(f"\n--- Search for: {term} ---")
            if not rows:
                print("No products found")
            for row in rows:
                print(f"ID: {row.id} | Name: {row.name} | SKU: {row.sku} | Image: {row.image_url}")

asyncio.run(main())
