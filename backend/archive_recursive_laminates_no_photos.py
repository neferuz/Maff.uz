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
        print("Fetching all categories recursively under category 1 (Laminates)...")
        # Get all categories
        res_cats = await conn.execute(text("SELECT id, name, parent_id FROM category"))
        categories = res_cats.fetchall()
        
        # Build category mappings
        children_map = {}
        category_names = {}
        for c in categories:
            category_names[c.id] = c.name
            if c.parent_id:
                if c.parent_id not in children_map:
                    children_map[c.parent_id] = []
                children_map[c.parent_id].append(c.id)
        
        # Recursive function to gather all descendant category IDs
        def get_all_descendants(cat_id):
            descendants = []
            children = children_map.get(cat_id, [])
            for child in children:
                descendants.append(child)
                descendants.extend(get_all_descendants(child))
            return descendants
            
        all_laminate_cat_ids = [1] + get_all_descendants(1)
        print(f"Total categories in laminate hierarchy: {len(all_laminate_cat_ids)}")
        
        # Query active products under these categories with no photos
        query = f"""
            SELECT id, name, sku, category_id
            FROM product
            WHERE category_id IN ({','.join(map(str, all_laminate_cat_ids))})
            AND is_active = True
            AND (image_url IS NULL OR image_url = '')
        """
        res_prods = await conn.execute(text(query))
        products = res_prods.fetchall()
        
        to_archive = [p.id for p in products]
        
        if to_archive:
            print(f"\nFound {len(to_archive)} active laminate products without photos across all subcategories.")
            print("Deactivating them in the database...")
            
            archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"
            result = await conn.execute(text(archive_query))
            print(f"Successfully deactivated {result.rowcount} product(s) without photos.")
        else:
            print("\nNo active laminate products without photos found in the recursive tree.")

if __name__ == "__main__":
    asyncio.run(main())
