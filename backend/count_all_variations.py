import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

allowed_models = [
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
    "Порта-58 4AB ПП Grey Oak"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for allowed in allowed_models:
            search = f"%{allowed}%"
            res = await conn.execute(text("SELECT id, name, is_active FROM product WHERE category_id = 428 AND name ILIKE :search;"), {"search": search})
            rows = res.fetchall()
            print(f"{allowed}: found {len(rows)} items (Active: {sum(1 for r in rows if r[2])})")

asyncio.run(main())
