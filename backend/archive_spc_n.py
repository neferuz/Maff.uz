import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

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
            img_url = p[2]
            imgs = p[3]
            
            is_bad = False
            if not img_url and not imgs:
                is_bad = True
            elif not img_url and imgs:
                # check if all items in imgs are bad
                if all(i in ("n", "None", "", None) for i in imgs):
                    is_bad = True
            elif img_url in ("n", "None", ""):
                if not imgs or all(i in ("n", "None", "", None) for i in imgs):
                    is_bad = True
                    
            if is_bad:
                to_archive.append(p[0])
                print(f"Archiving (bad image string): ID={p[0]} | {p[1]}")

        if to_archive:
            print(f"Total to archive: {len(to_archive)}")
            await conn.execute(text(f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, to_archive))})"))
        else:
            print("No bad image strings found.")

asyncio.run(main())
