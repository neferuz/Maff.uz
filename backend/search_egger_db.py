import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

skus = [
    "EPL146", "EPL188", "EPL218", "EPL168", "EPL039", "EPL136", "EPL191", "EPL216",
    "EPL177", "EPL166", "EPL242", "EPL225", "EPL239", "EPL219", "EPL212", "EPL203",
    "EPL205", "EPL209", "EPL139", "EPL153", "EPL182", "EPL221", "EPL015"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Searching for Egger products in DB...")
        for sku in skus:
            query = "SELECT id, name, sku, category_id, image_url, is_active FROM product WHERE sku ILIKE :sku OR name ILIKE :sku"
            res = await conn.execute(text(query), {"sku": f"%{sku}%"})
            rows = res.fetchall()
            print(f"\n--- SKU: {sku} ---")
            if not rows:
                print("No products found")
            for r in rows:
                print(f"ID={r.id} | SKU={r.sku} | Cat={r.category_id} | Active={r.is_active} | Name='{r.name}' | Image='{r.image_url}'")

if __name__ == "__main__":
    asyncio.run(main())
