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
        # Get all active categories
        res = await conn.execute(text("SELECT id, name, parent_id FROM category WHERE is_active = True"))
        categories = res.fetchall()
        
        # Build tree mapping parent -> child
        children_map = {}
        category_names = {}
        for c in categories:
            category_names[c.id] = c.name
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

        print("Laminate Subcategory Hierarchy & Product Count with/without photo:")
        laminate_subcats = [c.id for c in categories if c.parent_id == 1]
        
        for sub_id in laminate_subcats:
            sub_name = category_names[sub_id]
            all_ids = [sub_id] + get_all_descendants(sub_id)
            
            # Count active products in these categories
            res_total = await conn.execute(text(f"""
                SELECT count(*) FROM product 
                WHERE category_id IN ({','.join(map(str, all_ids))}) 
                AND is_active = True
            """))
            total = res_total.scalar()
            
            # Count active products with photos in these categories
            res_photos = await conn.execute(text(f"""
                SELECT count(*) FROM product 
                WHERE category_id IN ({','.join(map(str, all_ids))}) 
                AND is_active = True 
                AND image_url IS NOT NULL 
                AND image_url != ''
            """))
            with_photo = res_photos.scalar()
            
            no_photo = total - with_photo
            
            print(f"Parent: {sub_name} (ID={sub_id}) | Descendant Categories Count={len(all_ids)} | Active Total={total} | With Photo={with_photo} | No Photo={no_photo}")
            
            if no_photo > 0:
                # Print sample products without photos under this subcategory tree
                res_samples = await conn.execute(text(f"""
                    SELECT id, name, sku, category_id, image_url FROM product 
                    WHERE category_id IN ({','.join(map(str, all_ids))}) 
                    AND is_active = True 
                    AND (image_url IS NULL OR image_url = '')
                    LIMIT 10
                """))
                samples = res_samples.fetchall()
                print(f"  Samples of products without photos:")
                for s in samples:
                    print(f"    ID={s.id} | SKU={s.sku} | Cat={category_names.get(s.category_id, s.category_id)} | '{s.name}'")

if __name__ == "__main__":
    asyncio.run(main())
