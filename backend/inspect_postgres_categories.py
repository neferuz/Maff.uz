import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    print("Database URL:", settings.DATABASE_URL)
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all categories
        res = await session.execute(text("SELECT id, name, parent_id, is_active FROM category ORDER BY id ASC"))
        categories = res.fetchall()
        
        print("\nALL POSTGRES CATEGORIES:")
        cat_map = {c[0]: {"name": c[1], "parent_id": c[2], "is_active": c[3]} for c in categories}
        for cid, info in sorted(cat_map.items()):
            print(f"ID: {cid}, Name: '{info['name']}', Parent ID: {info['parent_id']}, Active: {info['is_active']}")

        EXCLUDED_IDS = {427, 449, 457, 464}
        print("\nEXCLUDED CATEGORIES IN POSTGRES DB:")
        for eid in EXCLUDED_IDS:
            if eid in cat_map:
                print(f"Excluded parent -> ID: {eid}, Name: '{cat_map[eid]['name']}', Parent ID: {cat_map[eid]['parent_id']}")

        print("\nCHILDREN OF EXCLUDED CATEGORIES IN POSTGRES DB:")
        for cid, info in cat_map.items():
            if info['parent_id'] in EXCLUDED_IDS:
                print(f"Child category -> ID: {cid}, Name: '{info['name']}', Parent ID: {info['parent_id']}")

if __name__ == "__main__":
    asyncio.run(main())
