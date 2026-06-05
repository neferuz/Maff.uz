import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Move 7017, 7011, 7019 to category 406
        await session.execute(text("UPDATE product SET category_id = 406 WHERE id IN (7017, 7011, 7019)"))
        
        # Create Молочный Шоколад
        res = await session.execute(text("SELECT description, price, is_active, in_stock, unit, brand_id, country, brand FROM product WHERE id = 7020"))
        p = res.fetchone()
        if p:
            new_name = "Паркет 3-х сл T&G Дуб ШМ 15.00x190.00х600-2100мм ШМ Черектер Молочный Шоколад"
            
            insert_query = """
                INSERT INTO product (name, description, price, category_id, image_url, is_active, in_stock, unit, brand_id, country, brand)
                VALUES (:name, :desc, :price, :cat, :img, :active, :stock, :unit, :brand_id, :country, :brand_name)
            """
            await session.execute(text(insert_query), {
                "name": new_name,
                "desc": p[0],
                "price": p[1],
                "cat": 406,
                "img": None,
                "active": p[2],
                "stock": p[3],
                "unit": p[4],
                "brand_id": p[5],
                "country": p[6],
                "brand_name": p[7]
            })
            print("Created Молочный Шоколад")
            
        await session.commit()
        print("Updated Coswick category.")

if __name__ == "__main__":
    asyncio.run(main())
