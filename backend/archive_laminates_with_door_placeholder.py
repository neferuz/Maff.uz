import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

target_image = "4luduzxj155pp1ut0vbue628mb3dxxow.jpg"

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        print("Finding laminate categories recursively...")
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
            
        all_laminate_cat_ids = [1] + get_all_descendants(1)
        
        print(f"Searching for laminate products with image: '{target_image}'...")
        query = f"""
            SELECT id, name, sku, category_id, image_url
            FROM product
            WHERE category_id IN ({','.join(map(str, all_laminate_cat_ids))})
            AND is_active = True
            AND image_url LIKE :img
        """
        res_prods = await conn.execute(text(query), {"img": f"%{target_image}%"})
        products = res_prods.fetchall()
        
        to_archive = [p.id for p in products]
        
        if to_archive:
            print(f"Found {len(to_archive)} active laminate product(s) with this door placeholder image to archive:\n")
            for p in products:
                print(f"  ID={p.id} | SKU={p.sku} | Cat={p.category_id} | '{p.name}'")
                
            print(f"\nArchiving {len(to_archive)} product(s)...")
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully deactivated {result.rowcount} product(s).")
        else:
            print("No active laminate products found with this placeholder image.")

if __name__ == "__main__":
    asyncio.run(main())
