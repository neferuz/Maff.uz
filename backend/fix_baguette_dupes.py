import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Fix 1: Венеция ПО В5.3 — use the dedicated PO photo instead of PG one
        await conn.execute(text(
            "UPDATE product SET image_url = :img WHERE id = 4992;"
        ), {"img": "/static/uploads/doors/classic_baguette_venetsiya_po_v5_3_35kh600kh2000_belyy_matovyy_satinato_s_ramkoy_image_1633783169_21.jpg"})
        print("✅ Fixed ID=4992 Венеция ПО В5.3 — unique photo assigned")

        # Fix 2: Неаполь ПО B3 Серый — was using white photo. Check if sery exists
        # cb_neapol_po_b3_kremoviy.jpg is the closest for sery ПО
        await conn.execute(text(
            "UPDATE product SET image_url = :img WHERE id = 7165;"
        ), {"img": "/static/uploads/doors/cb_neapol_po_b3_kremoviy.jpg"})
        print("✅ Fixed ID=7165 Неаполь ПО B3 Серый — reassigned photo")

        # Verify final state
        res = await conn.execute(text(
            "SELECT id, name, image_url FROM product "
            "WHERE category_id = 191 AND is_active = true ORDER BY name;"
        ))
        rows = res.fetchall()
        
        seen = {}
        issues = 0
        for r in rows:
            img = r[2] or ""
            full = f"/Users/apple/Desktop/Maff.uz-main/backend{img}"
            exists = os.path.exists(full) if img else False
            
            if not img or not exists:
                print(f"  ❌ NO/MISSING PHOTO | ID={r[0]} | {r[1]}")
                issues += 1
            elif img in seen:
                print(f"  ⚠️  DUPLICATE | ID={r[0]} | same as ID={seen[img]} | {r[1]}")
                issues += 1
            else:
                print(f"  ✅ OK | ID={r[0]} | {os.path.basename(img)} | {r[1]}")
            seen.setdefault(img, r[0])
        
        print(f"\n{'All photos unique and valid!' if issues == 0 else f'{issues} issues remain'}")

asyncio.run(main())
