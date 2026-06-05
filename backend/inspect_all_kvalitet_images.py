import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Fetch all Kvalitet doors
        res = await session.execute(text(
            "SELECT id, name, image_url, images, price FROM product "
            "WHERE (name ILIKE '%Квалитет%' OR name ILIKE '%Kvalitet%') "
            "  AND name NOT ILIKE '%добор%' "
            "  AND name NOT ILIKE '%короб%' "
            "  AND name NOT ILIKE '%наличник%' "
            "  AND name NOT ILIKE '%буклет%' "
            "  AND is_active = True"
        ))
        rows = res.fetchall()
        
        # Group by model (K2, K10, K11, K13, K14, etc.)
        models = {}
        for row in rows:
            name = row[1]
            match = re.search(r'Квалитет\s+(К\d+)', name, re.IGNORECASE)
            model_key = match.group(1).upper() if match else "GENERIC"
            if model_key not in models:
                models[model_key] = []
            models[model_key].append(row)
            
        print("Kvalitet Door Models in DB:")
        for model_key, prods in sorted(models.items()):
            print(f"\nModel: {model_key} (Count: {len(prods)})")
            images = set()
            for p in prods:
                images.add(p[2])
            print("Unique Images:")
            for img in images:
                print(f"  - {img}")
            print("Sample products:")
            for p in prods[:3]:
                print(f"  - ID: {p[0]}, Name: '{p[1]}', Image: '{p[2]}'")

if __name__ == "__main__":
    asyncio.run(main())
