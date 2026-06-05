import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category 356 children
        res = await session.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res.fetchall()
        
        all_cats = {row[0]: (row[1], row[2]) for row in categories}
        
        def get_all_child_ids(cat_id):
            ids = [cat_id]
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    ids.extend(get_all_child_ids(cid))
            return list(set(ids))
            
        handle_cat_ids = get_all_child_ids(356)
        print(f"Handle category IDs: {handle_cat_ids}")
        
        # Get all products in these categories
        res = await session.execute(
            text("SELECT id, name, category_id, image_url, sku, is_active FROM product WHERE category_id = ANY(:cat_ids)"),
            {"cat_ids": handle_cat_ids}
        )
        products = res.fetchall()
        print(f"Total handle products: {len(products)}")
        
        # Group by category
        by_cat = {}
        for row in products:
            by_cat.setdefault(row[2], []).append(row)
            
        for cat_id in sorted(by_cat.keys()):
            cat_name = all_cats[cat_id][0]
            items = by_cat[cat_id]
            print(f"\nCategory: {cat_name} (ID={cat_id}) - {len(items)} products:")
            for p in items[:5]:
                print(f"  ID={p[0]} | SKU={p[4]} | Image={p[3]} | Name={p[1]}")
            if len(items) > 5:
                print(f"  ... and {len(items)-5} more")

if __name__ == "__main__":
    asyncio.run(main())
