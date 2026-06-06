import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

search_terms = [
    "2050 369", "2050 390", "2050 3063", "2050 3019", "2050 3023",
    "2200-Y 248", "2200-Y 397", "3771 248", "3771 723", "3771 734",
    "3783 231", "3783 3037", "3783 3019", "5014 248", "3783-B 3037",
    "2050-A 3019", "2050-B 3019", "2050-B 3023", "3771 3011", "3783 3029",
    "3783-A 3029", "3783-B 3029", "3821-A 3016", "3821-A 3029"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.connect() as conn:
        print("Searching for AGT profiles...")
        for term in search_terms:
            # We want to search for products whose name matches the term
            # Like '%2050%' and '%369%'
            words = term.split()
            conditions = " AND ".join([f"name ILIKE '%{w}%'" for w in words])
            query = f"SELECT id, name, sku, price, image_url FROM product WHERE {conditions}"
            result = await conn.execute(text(query))
            rows = result.fetchall()
            print(f"\n--- Search for: {term} ---")
            if not rows:
                print("No products found")
            for row in rows:
                print(f"ID: {row.id} | Name: {row.name} | SKU: {row.sku} | Image: {row.image_url}")

asyncio.run(main())
