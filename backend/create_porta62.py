import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

new_products = [
    {
        "name": "Порта-62 Cappuccino Veralinga",
        "image_url": "/static/uploads/doors/porta_missing_порта_62_cappuccino_veralinga.jpg"
    },
    {
        "name": "Порта-62 Wenge Veralinga",
        "image_url": "/static/uploads/doors/porta_missing_порта_62_wenge_veralinga.jpg"
    },
    {
        "name": "Порта-62 Alaska",
        "image_url": "/static/uploads/doors/porta_missing_порта_62_alaska.jpg"
    }
]

async def create_products():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for p in new_products:
            # Generate a new random ref_key UUID to mimic 1C format
            ref_key = str(uuid.uuid4())
            
            sql = text("""
                INSERT INTO product 
                (name, price, stock, ref_key, is_active, category_id, brand, country, image_url, specifications, in_stock) 
                VALUES 
                (:name, 0.0, 0.0, :ref_key, true, 428, 'Portika', 'Россия', :image_url, '{}'::jsonb, 0)
            """)
            
            await conn.execute(sql, {
                "name": p["name"],
                "ref_key": ref_key,
                "image_url": p["image_url"]
            })
            print(f"Created {p['name']} with price 0 and its image!")

asyncio.run(create_products())
