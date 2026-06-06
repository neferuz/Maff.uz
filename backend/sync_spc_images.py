import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os, glob

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

def extract_code(filename):
    # e.g. rocko_r130.jpg -> r130
    # e.g. kronofloor_alicante.jpg -> alicante
    base = os.path.basename(filename).split('.')[0]
    parts = base.split('_')
    if len(parts) > 1:
        return parts[1]
    return base

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        rocko_files = glob.glob('/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/rocko/*.jpg')
        krono_files = glob.glob('/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/kronofloor/*.jpg')
        
        updates = []
        
        for f in rocko_files:
            code = extract_code(f)
            url = f"/static/uploads/rocko/{os.path.basename(f)}"
            print(f"Rocko Code: {code}")
            
            res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 129 AND is_active = True AND name ILIKE :query"), {"query": f"%{code}%"})
            for p in res.fetchall():
                updates.append((url, p[0]))
                print(f"  Matched: {p[1]}")
                
        for f in krono_files:
            code = extract_code(f)
            url = f"/static/uploads/kronofloor/{os.path.basename(f)}"
            print(f"Kronofloor Code: {code}")
            
            # Map russian name to code if needed
            ru_code = code
            if code == "alicante": ru_code = "Аликанте"
            elif code == "altea": ru_code = "Алтея"
            elif code == "cartagena": ru_code = "Картахена"
            elif code == "sevilla": ru_code = "Севилья"
            elif code == "almeria": ru_code = "Альмерия"
            
            res = await conn.execute(text("SELECT id, name FROM product WHERE category_id = 368 AND is_active = True AND name ILIKE :query"), {"query": f"%{ru_code}%"})
            for p in res.fetchall():
                updates.append((url, p[0]))
                print(f"  Matched: {p[1]}")

        for url, pid in updates:
            await conn.execute(text("UPDATE product SET image_url = :url WHERE id = :pid"), {"url": url, "pid": pid})
            
        print(f"Updated {len(updates)} products.")

asyncio.run(main())
