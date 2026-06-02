import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Product).where(Product.category_id == 8)
        res = await session.execute(stmt)
        prods = res.scalars().all()
        print(f"Total products in Category 8 (Паркетная доска): {len(prods)}")
        for i, p in enumerate(prods):
            print(f"{i+1:3d}. ID: {p.id} | Name: {p.name} | SKU: {p.sku} | Brand: {p.brand} | RefKey: {p.ref_key}")

if __name__ == "__main__":
    asyncio.run(main())
