import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

colors = ["Миндальный", "Натуральный", "Пастель рустикальная", "Сиена натуральная", "Титановый буфф", "Кедр", "Молочный Шоколад", "Каменный Ручей", "Соломенный"]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        for c in colors:
            res = await conn.execute(text("SELECT id, name, category_id, is_active FROM product WHERE category_id = 406 AND name ILIKE :query AND name NOT ILIKE '%Щит рекл%' AND name NOT ILIKE '%Образец%'"), {"query": f"%{c}%"})
            products = res.fetchall()
            print(f"--- Color: {c} ---")
            for p in products:
                print(f"  ID={p[0]} | Active={p[3]} | {p[1]}")

asyncio.run(main())
