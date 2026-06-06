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
        categories = [
            (242, "Decorative Wall Decors"),
            (398, "FRENTE"),
            (399, "DECOPRO WPC")
        ]
        
        for cid, cat_name in categories:
            res = await conn.execute(text("SELECT id, name, parent_id FROM category"))
            all_cats = res.fetchall()
            
            children_map = {}
            for c in all_cats:
                if c.parent_id:
                    if c.parent_id not in children_map:
                        children_map[c.parent_id] = []
                    children_map[c.parent_id].append(c.id)
                    
            def get_all_descendants(c_id):
                desc = []
                for child in children_map.get(c_id, []):
                    desc.append(child)
                    desc.extend(get_all_descendants(child))
                return desc
                
            sub_ids = [cid] + get_all_descendants(cid)
            
            total_res = await conn.execute(text(f"SELECT COUNT(*), SUM(CASE WHEN is_active THEN 1 ELSE 0 END) FROM product WHERE category_id IN ({','.join(map(str, sub_ids))})"))
            total_cnt, active_cnt = total_res.fetchone()
            
            img_res = await conn.execute(text(f"SELECT COUNT(*) FROM product WHERE category_id IN ({','.join(map(str, sub_ids))}) AND is_active = True AND image_url IS NOT NULL AND image_url != ''"))
            with_img_cnt = img_res.fetchone()[0]
            
            print(f"Category {cid} ('{cat_name}') and subcategories:")
            print(f"  Total count: {total_cnt}")
            print(f"  Active count: {active_cnt}")
            print(f"  Active with image: {with_img_cnt}")
            
            sample_res = await conn.execute(text(f"SELECT id, name, sku, image_url, is_active FROM product WHERE category_id IN ({','.join(map(str, sub_ids))}) LIMIT 10"))
            samples = sample_res.fetchall()
            print("  Samples:")
            for s in samples:
                print(f"    - ID={s.id} | Name='{s.name}' | SKU='{s.sku}' | Image='{s.image_url}' | Active={s.is_active}")
            print()

asyncio.run(main())
