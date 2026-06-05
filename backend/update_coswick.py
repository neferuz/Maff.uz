import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings
import uuid

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Move 7017, 7011, 7019 to category 406
        await session.execute(text("UPDATE product SET category_id = 406 WHERE id IN (7017, 7011, 7019)"))
        
        # Create Молочный Шоколад by copying 7020
        res = await session.execute(text("SELECT name, description, price, is_active, external_id, in_stock, unit, brand_id, country, brand, article FROM product WHERE id = 7020"))
        p = res.fetchone()
        if p:
            new_name = "Паркет 3-х сл T&G Дуб ШМ 15.00x190.00х600-2100мм ШМ Черектер Молочный Шоколад"
            new_external_id = str(uuid.uuid4())
            new_article = "Молочный Шоколад"
            
            insert_query = """
                INSERT INTO product (name, description, price, category_id, image_url, is_active, external_id, in_stock, unit, brand_id, country, brand, article)
                VALUES (:name, :desc, :price, :cat, :img, :active, :ext, :stock, :unit, :brand_id, :country, :brand_name, :article)
                RETURNING id
            """
            res_insert = await session.execute(text(insert_query), {
                "name": new_name,
                "desc": p[1],
                "price": p[2],
                "cat": 406,
                "img": None,
                "active": p[3],
                "ext": new_external_id,
                "stock": p[5],
                "unit": p[6],
                "brand_id": p[7],
                "country": p[8],
                "brand_name": p[9],
                "article": new_article
            })
            new_id = res_insert.scalar()
            print(f"Created Молочный Шоколад with ID {new_id}")
            
        await session.commit()
        print("Updated Coswick category.")

if __name__ == "__main__":
    asyncio.run(main())
