import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    names_to_find = [
        "Каменный Ручей", "Кедр", "Миндальный", "Молочный Шоколад",
        "Натуральный", "Пастель", "Сиена", "Соломенный", "Титановый буфф"
    ]
    
    async with async_session() as session:
        for name in names_to_find:
            q = f"SELECT id, name, category_id, image_url FROM product WHERE name ILIKE '%{name}%' AND (name ILIKE '%Coswick%' OR name ILIKE '%Косвик%' OR name ILIKE '%T&G Дуб%') AND name NOT ILIKE '%Щит%' AND name NOT ILIKE '%Образец%'"
            res = await session.execute(text(q))
            products = res.fetchall()
            print(f"\n--- {name} ---")
            for p in products:
                print(f"ID: {p[0]}, Name: {p[1]}, Image: {p[3]}, Cat: {p[2]}")

if __name__ == "__main__":
    asyncio.run(main())
