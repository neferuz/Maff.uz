import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        decors = ["Алтея", "Картахена", "Севилья", "Аликанте", "Альмерия", "Фламенка", "Altea", "Cartagena", "Sevilla", "Alicante", "Almeria", "Flamenco"]
        print("Searching for decors:")
        for decor in decors:
            res = await session.execute(
                text("SELECT id, name, image_url, sku, category_id FROM product WHERE name ILIKE :decor"),
                {"decor": f"%{decor}%"}
            )
            rows = res.fetchall()
            if rows:
                print(f"\nMatches for '{decor}':")
                for r in rows:
                    print(f"  ID: {r[0]} | Name: {r[1]} | Image: {r[2]} | SKU: {r[3]} | Cat: {r[4]}")
            else:
                print(f"No matches for '{decor}'")

if __name__ == "__main__":
    asyncio.run(main())
