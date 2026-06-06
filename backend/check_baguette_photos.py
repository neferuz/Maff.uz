import asyncio, os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
STATIC_ROOT = "/Users/apple/Desktop/Maff.uz-main/backend"

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text(
            "SELECT id, name, image_url FROM product "
            "WHERE category_id = 191 AND is_active = true ORDER BY name;"
        ))
        rows = res.fetchall()
        
        seen_photos = {}
        for r in rows:
            img = r[2] or ""
            # Check if file exists
            if img:
                full_path = os.path.join(STATIC_ROOT, img.lstrip("/"))
                exists = os.path.exists(full_path)
            else:
                exists = False
            
            # Check duplicates
            status = ""
            if not img:
                status = "❌ NO PHOTO"
            elif not exists:
                status = "❌ FILE MISSING"
            elif img in seen_photos:
                status = f"⚠️  DUPLICATE (same as ID={seen_photos[img]})"
            else:
                status = "✅ OK"
            
            if img:
                seen_photos.setdefault(img, r[0])
            
            fname = os.path.basename(img) if img else "none"
            print(f"  {status} | ID={r[0]} | {fname} | {r[1]}")

asyncio.run(main())
