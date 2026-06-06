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
        print("Checking all subcategories of category 1...")
        query = """
            SELECT id, name FROM category 
            WHERE parent_id = 1 OR id = 1
            ORDER BY name
        """
        res = await conn.execute(text(query))
        subcats = res.fetchall()
        
        for sc in subcats:
            # Check active products count
            res_total = await conn.execute(text(
                f"SELECT count(*) FROM product WHERE category_id = {sc.id} AND is_active = True"
            ))
            total = res_total.scalar()
            
            # Check active products with photos count
            res_photos = await conn.execute(text(
                f"SELECT count(*) FROM product WHERE category_id = {sc.id} AND is_active = True AND image_url IS NOT NULL AND image_url != ''"
            ))
            with_photo = res_photos.scalar()
            
            no_photo = total - with_photo
            
            print(f"Subcat ID={sc.id} | Name='{sc.name}' | Active Total={total} | With Photo={with_photo} | No Photo={no_photo}")

if __name__ == "__main__":
    asyncio.run(main())
