import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        # Fetch some categories
        res_cats = await conn.execute(text("SELECT id, name, parent_id, is_active FROM category LIMIT 20;"))
        print("=== CATEGORIES ===")
        for row in res_cats:
            print(f"ID: {row[0]}, Name: {row[1]}, Parent: {row[2]}, Active: {row[3]}")
        
        # Fetch some products
        res_prods = await conn.execute(text("SELECT id, name, category_id, is_active, price FROM product LIMIT 20;"))
        print("\n=== PRODUCTS ===")
        for row in res_prods:
            print(f"ID: {row[0]}, Name: {row[1]}, Category ID: {row[2]}, Active: {row[3]}, Price: {row[4]}")

if __name__ == "__main__":
    asyncio.run(main())
