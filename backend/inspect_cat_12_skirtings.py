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
        print("Checking Category 12 (Плинтус) and its subcategories...")
        # Get all categories
        res_cats = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res_cats.fetchall()
        
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
            
        all_skirting_cat_ids = [12] + get_all_descendants(12)
        print(f"Total categories under plinths: {len(all_skirting_cat_ids)}")
        
        for sc_id in all_skirting_cat_ids:
            sc_name = category_names.get(sc_id, f"ID={sc_id}")
            
            # Active total
            res_tot = await conn.execute(text(f"SELECT count(*) FROM product WHERE category_id = {sc_id} AND is_active = True"))
            total = res_tot.scalar()
            
            # Active with photo
            res_photo = await conn.execute(text(f"""
                SELECT count(*) FROM product 
                WHERE category_id = {sc_id} 
                AND is_active = True 
                AND image_url IS NOT NULL 
                AND image_url != ''
                AND image_url NOT LIKE '%zadoor%'
                AND image_url NOT LIKE '/images/products/%'
            """))
            with_photo = res_photo.scalar()
            
            no_photo = total - with_photo
            
            print(f"Cat ID={sc_id} | Name='{sc_name}' | Active Total={total} | With Real Photo={with_photo} | No Photo={no_photo}")
            
            if no_photo > 0:
                res_samples = await conn.execute(text(f"""
                    SELECT id, name, sku, image_url 
                    FROM product 
                    WHERE category_id = {sc_id} 
                    AND is_active = True
                    LIMIT 5
                """))
                samples = res_samples.fetchall()
                for s in samples:
                    print(f"  Sample No-Photo: ID={s.id} | SKU={s.sku} | Name='{s.name}' | Image={s.image_url}")

if __name__ == "__main__":
    asyncio.run(main())
