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
        print("Checking plinth product prices...")
        query = """
            SELECT id, name, sku, price, category_id 
            FROM product 
            WHERE category_id IN (
                SELECT id FROM category WHERE parent_id = 12 OR id = 12
            )
            AND is_active = True
            LIMIT 15;
        """
        res = await conn.execute(text(query))
        for row in res.fetchall():
            print(f"ID={row.id} | Name='{row.name}' | Price={row.price} | SKU='{row.sku}'")

if __name__ == "__main__":
    asyncio.run(main())
