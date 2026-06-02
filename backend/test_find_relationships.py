import asyncio
from app.db.session import engine
from sqlalchemy import text

async def main():
    async with engine.begin() as conn:
        # Find top 10 categories by product count
        res = await conn.execute(text("""
            SELECT c.id, c.name, COUNT(p.id) AS prod_count 
            FROM category c
            JOIN product p ON p.category_id = c.id
            WHERE p.is_active = true
            GROUP BY c.id, c.name
            ORDER BY prod_count DESC
            LIMIT 15;
        """))
        print("=== CATEGORIES WITH ACTIVE PRODUCTS ===")
        categories_with_products = []
        for row in res:
            print(f"ID: {row[0]}, Name: {row[1]}, Product Count: {row[2]}")
            categories_with_products.append(row[0])
            
        # Let's list 5 products from the first category
        if categories_with_products:
            cat_id = categories_with_products[0]
            res_p = await conn.execute(text(f"""
                SELECT id, name, price FROM product 
                WHERE category_id = {cat_id} AND is_active = true 
                LIMIT 5;
            """))
            print(f"\n=== PRODUCTS IN CATEGORY {cat_id} ===")
            for row in res_p:
                print(f"Product ID: {row[0]}, Name: {row[1]}, Price: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
