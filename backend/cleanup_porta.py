import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

whitelist = [
    "Порта-1 ПП Alaska",
    "Порта-1 ПП Nardo Grey",
    "Порта-50 4AB Эксимер Keramik Valse",
    "Порта-50 4AB Эксимер Keramik Brown",
    "Порта-50.1 4AB ПП Natural Oak",
    "Порта-50 B ПП Rocks Beige",
    "Порта-50 B ПП Rocks Pearl",
    "Порта-50.11 4AB ПП Alpik Oak",
    "Порта-51 4AB ПП Alaska Black Star",
    "Порта-51 4AB ПП Alpik Oak Black Star",
    "Порта-50.10 B ПП Rocks Beige",
    "Порта-50.10 B ПП Rocks Pearl",
    "Порта-50.1 4AB ПП White Oak",
    "Порта-50.1 4AB ПП Grey Oak",
    "Порта-62 Cappuccino",
    "Порта-62 Wenge",
    "Порта-62 Alaska",
    "Порта-62 ЭКО Light Sonoma",
    "Порта-25.3 Light Sonoma",
    "Порта-29.3 Light Sonoma"
]

new_products = [
    ("Порта-50 4AB Эксимер Keramik Valse (Черный: М) Стандарт", "/static/uploads/doors/porta_50_4ab_keramik_valse_black_official.jpg"),
    ("Порта-50 4AB Эксимер Keramik Brown (Черный: М) Стандарт", "/static/uploads/doors/porta_50_4ab_keramik_brown_black_official.jpg"),
    ("Порта-50 4AB Эксимер Keramik Valse (Черный: М) Нестандарт", "/static/uploads/doors/porta_50_4ab_keramik_valse_black_official.jpg"),
    ("Порта-50 4AB Эксимер Keramik Brown (Черный: М) Нестандарт", "/static/uploads/doors/porta_50_4ab_keramik_brown_black_official.jpg"),
]

async def process_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # 1. Update missing Alpik Oak photo
        sql = text("UPDATE product SET image_url = '/static/uploads/doors/porta-51_4ab_pp_alpik_oak_black_star_image_1009476925_9.jpg' WHERE name ILIKE '%Порта-51 4AB ПП Alpik Oak Black Star%';")
        res = await conn.execute(sql)
        print(f"Updated {res.rowcount} Alpik Oak Black Star models with photo.")

        # 2. Create missing Keramik models
        for name, img in new_products:
            ref_key = str(uuid.uuid4())
            sql = text("""
                INSERT INTO product 
                (name, price, stock, ref_key, is_active, category_id, brand, country, image_url, specifications, in_stock) 
                VALUES 
                (:name, 0.0, 0.0, :ref_key, true, 428, 'Portika', 'Россия', :image_url, '{}'::jsonb, 0)
            """)
            await conn.execute(sql, {"name": name, "ref_key": ref_key, "image_url": img})
            print(f"Created new product '{name}'")
        
        # 3. Find all active products in category 428
        res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 428 AND is_active = true;"))
        active_products = res.fetchall()
        
        archive_ids = []
        for p in active_products:
            p_id, p_name = p
            # Check if this product name contains ANY string from the whitelist
            matched = False
            for w in whitelist:
                # We do a basic substring check
                if w.replace(" (Черный: М)", "").lower() in p_name.lower():
                    matched = True
                    break
            
            if not matched:
                archive_ids.append(p_id)
                print(f"Archiving: {p_name}")
        
        if archive_ids:
            # Deactivate them
            ids_str = ",".join(map(str, archive_ids))
            await conn.execute(text(f"UPDATE product SET is_active = false WHERE id IN ({ids_str});"))
            print(f"Archived {len(archive_ids)} extra Porta products.")
        else:
            print("No extra products to archive.")

asyncio.run(process_db())
