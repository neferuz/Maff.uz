import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Joss Beaumont search
        res_jb = await session.execute(text("""
            SELECT id, name, image_url, sku, category_id 
            FROM product 
            WHERE name ILIKE '%Mirabo%' OR name ILIKE '%Мирабо%'
               OR name ILIKE '%Aragon%' OR name ILIKE '%Арагон%'
               OR name ILIKE '%Kipiani%' OR name ILIKE '%Кипиани%'
               OR name ILIKE '%Goyer%' OR name ILIKE '%Гойер%'
               OR name ILIKE '%Romanoff%' OR name ILIKE '%Романофф%'
               OR name ILIKE '%Cassini%' OR name ILIKE '%Кассини%'
               OR name ILIKE '%Profitrole%' OR name ILIKE '%Профитроль%'
               OR name ILIKE '%Ravachol%' OR name ILIKE '%Равашоль%'
               OR name ILIKE '%Milfei%' OR name ILIKE '%Милфей%'
               OR name ILIKE '%Chaudeau%' OR name ILIKE '%Шодо%'
               OR name ILIKE '%Macaron%' OR name ILIKE '%Макарон%'
               OR name ILIKE '%Galois%' OR name ILIKE '%Галуа%'
               OR name ILIKE '%Jourman%' OR name ILIKE '%Журман%'
               OR image_url LIKE '%jossbeaumont%'
        """))
        print("--- Joss Beaumont Candidates ---")
        for row in res_jb.fetchall():
            print(f"ID: {row[0]} | Name: {row[1]} | Image: {row[2]} | SKU: {row[3]} | Cat: {row[4]}")
            
        # Kronospan search
        print("\n--- Kronospan/EuroHome Candidates ---")
        # Let's search by article/SKU or name patterns
        patterns = [
            "K407", "5542", "8630", "8634", "K336", "K484", "U602", "K001", "U613", "K039",
            "2625", "2621", "7240", "K064", "2636", "K405", "U610", "K411", "K277", "K451",
            "5943", "8155", "3771", "5947"
        ]
        
        for pat in patterns:
            res_k = await session.execute(
                text("SELECT id, name, image_url, sku, category_id FROM product WHERE name LIKE :pat OR sku LIKE :pat"),
                {"pat": f"%{pat}%"}
            )
            rows = res_k.fetchall()
            if rows:
                print(f"\nPattern '{pat}':")
                for r in rows:
                    print(f"  ID: {r[0]} | Name: {r[1]} | Image: {r[2]} | SKU: {r[3]} | Cat: {r[4]}")

if __name__ == "__main__":
    asyncio.run(main())
