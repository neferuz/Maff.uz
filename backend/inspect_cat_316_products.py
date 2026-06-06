import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Fetching all category IDs recursively under category 316...")
        res_cats = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res_cats.fetchall()
        
        children_map = {}
        for c in categories:
            if c.parent_id:
                if c.parent_id not in children_map:
                    children_map[c.parent_id] = []
                children_map[c.parent_id].append(c.id)
                
        def get_all_descendants(cat_id):
            descendants = []
            children = children_map.get(cat_id, [])
            for child in children:
                descendants.append(child)
                descendants.extend(get_all_descendants(child))
            return descendants
            
        all_cat_ids = [316] + get_all_descendants(316)
        
        print(f"Finding all active products under these {len(all_cat_ids)} categories...")
        query = f"""
            SELECT id, name, sku, category_id, image_url
            FROM product
            WHERE category_id IN ({','.join(map(str, all_cat_ids))})
            AND is_active = True
            ORDER BY category_id, name
        """
        res_prods = await conn.execute(text(query))
        products = res_prods.fetchall()
        
        print(f"\nFound {len(products)} active product(s):")
        for p in products:
            print(f"  ID={p.id} | SKU={p.sku} | Cat={p.category_id} | Name='{p.name}' | Image='{p.image_url}'")

if __name__ == "__main__":
    asyncio.run(main())
