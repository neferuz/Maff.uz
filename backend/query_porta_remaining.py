import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

porta_list = [
    "Порта-1 ПП Alaska",
    "Порта-1 ПП Nardo Grey",
    "Порта-50 4AB Эксимер Keramik Valse (Черный: М) Стандарт",
    "Порта-50 4AB Эксимер Keramik Brown (Черный: М) Стандарт",
    "Порта-50.1 4AB ПП Natural Oak",
    "Порта-50 B ПП Rocks Beige (Черный: М)",
    "Порта-50 B ПП Rocks Pearl (Черный: М)",
    "Порта-50.11 4AB ПП Alpik Oak (Черный: М)",
    "Порта-51 4AB ПП Alaska Black Star",
    "Порта-50 4AB Эксимер Keramik Valse (Черный: М) Нестандарт",
    "Порта-50 4AB Эксимер Keramik Brown (Черный: М) Нестандарт",
    "Порта-51 4AB ПП Alpik Oak Black Star",
    "Порта-50.10 B ПП Rocks Beige (Черный: М)",
    "Порта-50.10 B ПП Rocks Pearl (Черный: М)"
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for p in porta_list:
            sql = text("SELECT id, name, image_url, is_active FROM product WHERE name ILIKE :name")
            result = await conn.execute(sql, {"name": f"%{p}%"})
            rows = result.fetchall()
            print(f"--- Query: {p} ---")
            if not rows:
                print("  NOT FOUND in DB!")
            for r in rows:
                print(f"  ID: {r[0]} | Name: {r[1]} | Img: {r[2]} | Active: {r[3]}")

asyncio.run(main())
