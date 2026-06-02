import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Product).where(Product.name.like("%Antique%"))
        result = await session.execute(stmt)
        prods = result.scalars().all()
        for p in prods:
            print(f"Product: {p.name}, ref: {p.ref_key}, price: {p.price}")

asyncio.run(main())
