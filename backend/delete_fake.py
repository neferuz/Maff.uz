import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select, delete

async def main():
    async with AsyncSessionLocal() as session:
        stmt = delete(Product).where(Product.ref_key.not_like('%-%'))
        result = await session.execute(stmt)
        await session.commit()
        print(f"Deleted {result.rowcount} fake products")

asyncio.run(main())
