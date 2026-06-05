import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category 143 children
        res = await session.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        def get_all_child_ids(cat_id):
            ids = [cat_id]
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    ids.extend(get_all_child_ids(cid))
            return list(set(ids))
            
        handle_cat_ids = get_all_child_ids(143)
        
        print("Categories under 143:")
        for cid in sorted(handle_cat_ids):
            name, parent_id = all_cats[cid]
            parent_name = all_cats[parent_id][0] if parent_id in all_cats else "None"
            print(f"ID={cid} | Parent={parent_id} ({parent_name}) | Name='{name}'")

if __name__ == "__main__":
    asyncio.run(main())
