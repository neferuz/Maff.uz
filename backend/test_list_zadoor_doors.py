import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("""
            SELECT id, name, price FROM product 
            WHERE category_id = 176 AND is_active = true 
            LIMIT 5;
        """))
        print("=== PRODUCTS IN CATEGORY 176 (Двери ZADOOR) ===")
        for row in res:
            print(f"Product ID: {row[0]}, Name: {row[1]}, Price: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
