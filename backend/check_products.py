import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Product).limit(30)
        result = await session.execute(stmt)
        products = result.scalars().all()
        
        print(f"Total products in sample: {len(products)}")
        print("-" * 80)
        for p in products:
            print(f"ID: {p.id}")
            print(f"Name: {p.name}")
            print(f"SKU: {p.sku}")
            print(f"Brand: {p.brand}")
            print(f"Country: {p.country}")
            print(f"Grade: {p.grade}")
            print(f"Thickness: {p.thickness}")
            print("-" * 80)

if __name__ == "__main__":
    asyncio.run(main())
