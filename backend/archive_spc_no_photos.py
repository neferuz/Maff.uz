import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Categories: 368 (Kronofloor), 129 (Rocko parent), 131, 132, 133 (Rocko subs)
CATEGORIES = [368, 129, 131, 132, 133]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        res = await conn.execute(text(f"""
            SELECT id, name, image_url, images 
            FROM product 
            WHERE category_id IN ({','.join(map(str, CATEGORIES))}) 
            AND is_active = True
        """))
        products = res.fetchall()
        
        to_archive = []
        for p in products:
            img = p[2] or (p[3][0] if p[3] and len(p[3]) > 0 else None)
            if not img or img.strip() == "":
                to_archive.append(p[0])
                print(f"Archiving: ID={p[0]} | {p[1]}")
            else:
                print(f"Keeping: ID={p[0]} | {p[1]} | {img}")

        if to_archive:
            print(f"Total to archive: {len(to_archive)}")
            await conn.execute(text(f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"))
        else:
            print("Everything has photos. Nothing to archive.")

asyncio.run(main())
