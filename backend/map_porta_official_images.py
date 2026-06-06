import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

mappings = [
    ("Порта-1 ПП Alaska", "porta_1_alaska_official.jpg"),
    ("Порта-1 ПП Nardo Grey", "porta_1_nardo_grey_official.jpg"),
    ("Порта-50.1 4AB ПП Natural Oak", "porta_50_1_4ab_natural_oak_official.jpg"),
    ("Порта-50 4AB Эксимер Keramik Brown", "porta_50_4ab_keramik_brown_black_official.jpg"),
    ("Порта-50 4AB Эксимер Keramik Valse", "porta_50_4ab_keramik_valse_black_official.jpg"),
    ("Порта-50 B ПП Rocks Beige", "porta_50_b_rocks_beige_official.jpg"),
    ("Порта-50 B ПП Rocks Pearl", "porta_50_b_rocks_pearl_official.jpg"),
    ("Порта-51 4AB ПП Alaska Black Star", "porta_51_4ab_alaska_black_star_official.jpg"),
    ("Порта-52 4AB Флекс Эмаль Shellac Cream", "porta_52_4ab_shellac_cream_official.png"),
    ("Порта-54 4AB ПП Nardo Grey", "porta_54_4ab_nardo_grey_official.jpg"),
    ("Порта-58 4AB ПП Grey Oak", "porta_58_4ab_grey_oak_official.jpg"),
    ("Порта-58 4AB ПП Natural Oak", "porta_58_4ab_natural_oak_official.jpg"),
    ("Порта-50.11 4AB ПП Alpik Oak", "porta_50_11_4ab_alpik_oak_chernyy_m_image_1009476925_11.jpg"), # Wait, let me check the list again...
]

async def update_db():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for prefix, filename in mappings:
            db_path = f"/static/uploads/doors/{filename}"
            # Replace spaces with % for robust matching
            search_name = prefix.replace(" ", "%").replace("(", "%").replace(")", "%")
            sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '{search_name}%';"
            result = await conn.execute(text(sql))
            print(f"Updated {result.rowcount} rows for '{prefix}' with {filename}")

asyncio.run(update_db())
