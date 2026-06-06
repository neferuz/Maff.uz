import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
EGGER_DIR = '/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/egger'

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text("""
            SELECT id, name FROM product 
            WHERE category_id IN (397, 414, 101, 1)
            AND is_active = True 
            AND (image_url IS NULL OR image_url = '')
            AND name LIKE '%EHL%'
        """))
        products = res.fetchall()
        
        updated = 0
        still_missing = []
        for p in products:
            match = re.search(r'EHL(\d+)', p[1])
            if match:
                code = f"ehl{match.group(1)}"
                filepath = os.path.join(EGGER_DIR, f"{code}.jpg")
                if os.path.exists(filepath) and os.path.getsize(filepath) > 2000:
                    db_path = f"/static/uploads/egger/{code}.jpg"
                    await conn.execute(text("UPDATE product SET image_url = :img WHERE id = :id"), {"img": db_path, "id": p[0]})
                    print(f"✓ ID={p[0]} -> {db_path} | {p[1]}")
                    updated += 1
                else:
                    still_missing.append((p[0], p[1], code.upper()))
        
        print(f"\nUpdated: {updated}")
        print(f"\nStill missing ({len(still_missing)}):")
        for m in still_missing:
            print(f"  ID={m[0]} | {m[2]} | {m[1]}")

asyncio.run(main())
