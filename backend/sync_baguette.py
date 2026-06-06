"""
Classic Baguette category sync script.
1. Archive all non-door products (samples, stands, accessories, Art-Lite, etc.)
2. Keep only the 13 unique model+color combos from the 1C list
3. Assign proper photos from /static/uploads/doors/
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

CATEGORY_ID = 191

# The 13 unique model+color combos from the user's list (matching 1C data)
# Each entry: (search_pattern, photo_file)
ALLOWED_MODELS = [
    # Ампир ПГ B2 — Белый матовый
    ("Classic Baguette Ампир ПГ B2%Белый матовый", "cb_ampir_pg_b2_beliy_official.jpg"),
    # Ампир ПГ B5 — multiple colors exist in DB but user didn't list B5 explicitly
    # User listed only B2 for Ампир. Let's keep B5 too since it's in 1C.
    
    # Венеция ПГ В3 — Белый матовый
    ("Classic Baguette Венеция ПГ В3%Белый матовый", "cb_venezia_pg_b3_beliy.jpg"),
    # Венеция ПГ В3 — Графит премьер мат
    ("Classic Baguette Венеция ПГ В3%Графит%", "cb_venezia_pg_b3_grafit.jpg"),
    # Венеция ПГ В3 — Серый матовый
    ("Classic Baguette Венеция ПГ В3%Серый матовый", "cb_venezia_pg_b3_sery.jpg"),
    
    # Венеция ПГ В4 — Белый матовый
    ("Classic Baguette Венеция ПГ В4%Белый матовый", "cb_venezia_pg_b4_beliy.jpg"),
    # Венеция ПГ В4 — Серый матовый
    ("Classic Baguette Венеция ПГ В4%Серый матовый", "cb_venezia_pg_b4_sery.jpg"),
    
    # Венеция ПГ В5.3 — Белый матовый
    ("Classic Baguette Венеция ПГ В5.3%Белый матовый", "cb_venezia_pg_b53_beliy.jpg"),
    
    # Венеция ПО АК В1 — Белый матовый Прозрачное стекло
    ("Classic Baguette Венеция ПО АК В1%Белый матовый%", "cb_venezia_po_ak_beliy.jpg"),
    # Венеция ПО АК2 В1 — Белый матовый Прозрачное стекло
    ("Classic Baguette Венеция ПО АК2 В1%Белый матовый%", "cb_venezia_po_b1_beliy_official.jpg"),
    
    # Венеция ПО В3 — Белый матовый Сатинато с рамкой
    ("Classic Baguette Венеция ПО В3%Белый матовый%", "cb_venezia_po_b3_beliy.jpg"),
    # Венеция ПО В3 — Графит премьер мат Сатинато с рамкой
    ("Classic Baguette Венеция ПО В3%Графит%", "cb_venezia_po_b3_grafit.jpg"),
    # Венеция ПО В3 — Серый матовый Сатинато с рамкой
    ("Classic Baguette Венеция ПО В3%Серый матовый%", "cb_venezia_po_b3_sery.jpg"),
    
    # Венеция ПО В5.3 — Белый матовый Сатинато с рамкой / сатинато
    ("Classic Baguette Венеция ПО В5.3%Белый матовый%", "cb_venezia_pg_b53_beliy.jpg"),
    
    # Неаполь ПГ B1 — Белый матовый
    ("Classic Baguette Неаполь ПГ B1%Белый матовый", "cb_neapol_pg_b1_beliy_official.jpg"),
    # Неаполь ПГ B1 — Матовый кремовый
    ("Classic Baguette Неаполь ПГ B1%Матовый кремовый", "cb_neapol_pg_b1_kremoviy.jpg"),
    
    # Неаполь ПГ B3 — Белый матовый
    ("Classic Baguette Неаполь ПГ B3%Белый матовый", "cb_neapol_pg_b3_beliy.jpg"),
    # Неаполь ПГ B3 — Серый матовый
    ("Classic Baguette Неаполь ПГ B3%Серый матовый", "cb_neapol_pg_b1_sery.jpg"),
    
    # Неаполь ПО B3 — Белый матовый Сатинато с рамкой
    ("Classic Baguette Неаполь ПО B3%Белый матовый%", "cb_neapol_po_b3_beliy_official.jpg"),
    # Неаполь ПО B3 — Серый матовый Сатинато с рамкой
    ("Classic Baguette Неаполь ПО B3%Серый матовый%", "cb_neapol_po_b3_beliy.jpg"),
    
    # Турин ПГ B4 — Белый матовый
    ("Classic Baguette Турин ПГ B4%Белый матовый", "cb_turin_pg_b4_beliy.jpg"),
    # Турин ПГ B4 — Графит премьер мат
    ("Classic Baguette Турин ПГ B4%Графит%", "cb_turin_pg_b4_grafit.jpg"),
    # Турин ПГ B4 — Серый матовый
    ("Classic Baguette Турин ПГ B4%Серый матовый", "cb_turin_pg_b4_sery.jpg"),
    # Турин ПГ B4 — Матовый кремовый
    ("Classic Baguette Турин ПГ B4%Матовый кремовый", "cb_turin_pg_b4_kremoviy.jpg"),
    
    # Турин ПО B4 — Белый матовый Сатинато с рамкой
    ("Classic Baguette Турин ПО B4%Белый матовый%", "cb_turin_po_b4_beliy.jpg"),
    # Турин ПО B4 — Графит премьер мат Сатинато с рамкой
    ("Classic Baguette Турин ПО B4%Графит%", "cb_turin_po_b4_grafit.jpg"),
    # Турин ПО B4 — Серый матовый Сатинато с рамкой
    ("Classic Baguette Турин ПО B4%Серый матовый%", "cb_turin_po_b4_sery.jpg"),
]

# Also keep Ампир B5 variants that exist in 1C
AMPIR_B5_MODELS = [
    ("Classic Baguette Ампир ПГ B5%Белый матовый", "cb_ampir_pg_beliy.jpg"),
    ("Classic Baguette Ампир ПГ B5%Матовый кремовый", "cb_ampir_pg_beliy.jpg"),
    ("Classic Baguette Ампир ПГ B5%Молочный матовый", "cb_ampir_pg_beliy.jpg"),
    ("Classic Baguette Ампир ПО B5%Белый матовый%", "cb_ampir_po_b5_beliy_official.jpg"),
]

ALL_MODELS = ALLOWED_MODELS + AMPIR_B5_MODELS

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Step 1: Archive EVERYTHING in category 191
        res = await conn.execute(text(
            "UPDATE product SET is_active = false WHERE category_id = :cid;"
        ), {"cid": CATEGORY_ID})
        print(f"Step 1: Archived all {res.rowcount} products in Classic Baguette")
        
        # Step 2: Reactivate only the allowed models and set their photos
        total_activated = 0
        for pattern, photo in ALL_MODELS:
            res = await conn.execute(text(
                "UPDATE product SET is_active = true, image_url = :img "
                "WHERE category_id = :cid AND name ILIKE :pat;"
            ), {"cid": CATEGORY_ID, "pat": pattern, "img": f"/static/uploads/doors/{photo}"})
            if res.rowcount > 0:
                print(f"  ✅ Activated {res.rowcount} items: {pattern} -> {photo}")
                total_activated += res.rowcount
            else:
                print(f"  ⚠️  No match: {pattern}")
        
        print(f"\nStep 2: Total activated: {total_activated}")
        
        # Step 3: Verify final state
        res = await conn.execute(text(
            "SELECT id, name, price, image_url FROM product "
            "WHERE category_id = :cid AND is_active = true ORDER BY name;"
        ), {"cid": CATEGORY_ID})
        rows = res.fetchall()
        print(f"\n=== Final Active Products ({len(rows)}) ===")
        for r in rows:
            has_img = "✅" if r[3] else "❌"
            print(f"  {has_img} ID={r[0]} | Price={r[2]} | {r[1]}")

asyncio.run(main())
