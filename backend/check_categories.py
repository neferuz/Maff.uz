import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Category
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Category)
        result = await session.execute(stmt)
        categories = result.scalars().all()
        
        print(f"Total categories: {len(categories)}")
        print("-" * 80)
        cat_map = {c.id: c for c in categories}
        for c in categories:
            parent_name = cat_map[c.parent_id].name if c.parent_id in cat_map else "None"
            print(f"ID: {c.id} | Name: {c.name} | Parent ID: {c.parent_id} ({parent_name})")
        print("-" * 80)

if __name__ == "__main__":
    asyncio.run(main())
