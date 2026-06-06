"""
Classic Baguette category sync v2.
Creates missing products from 1C list, assigns photos.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

CATEGORY_ID = 191
PHOTO_BASE = "/static/uploads/doors/"

# All 13 unique model+color combos from user's list + their representative photos
# Format: (display_name, photo_file, search_patterns_to_match_existing)
MODELS = [
    # Ампир
    ("Classic Baguette Ампир ПГ B2 (Белый матовый)", "cb_ampir_pg_b2_beliy_official.jpg",
     ["%Ампир ПГ B2%Белый матовый%"]),

    # Венеция ПГ В3
    ("Classic Baguette Венеция ПГ В3 Белый матовый", "cb_venezia_pg_b3_beliy.jpg",
     ["%Венеция ПГ В3%Белый матовый%", "%Венеция ПГ В3 белый%"]),
    ("Classic Baguette Венеция ПГ В3 Графит премьер мат", "cb_venezia_pg_b3_grafit.jpg",
     ["%Венеция ПГ В3%Графит%"]),
    ("Classic Baguette Венеция ПГ В3 Серый матовый", "cb_venezia_pg_b3_sery.jpg",
     ["%Венеция ПГ В3%Серый матовый%"]),

    # Венеция ПГ В4
    ("Classic Baguette Венеция ПГ В4 Белый матовый", "cb_venezia_pg_b4_beliy.jpg",
     ["%Венеция ПГ В4%Белый матовый%"]),
    ("Classic Baguette Венеция ПГ В4 Серый матовый", "cb_venezia_pg_b4_sery.jpg",
     ["%Венеция ПГ В4%Серый матовый%"]),

    # Венеция ПГ В5.3
    ("Classic Baguette Венеция ПГ В5.3 Белый матовый", "cb_venezia_pg_b53_beliy.jpg",
     ["%Венеция ПГ В5.3%Белый матовый%", "%Венеция ПГ В5.2%белый%"]),

    # Венеция ПО АК В1
    ("Classic Baguette Венеция ПО АК В1 (Белый матовый Прозрачное стекло)", "cb_venezia_po_ak_beliy.jpg",
     ["%Венеция ПО АК В1%Белый матовый%"]),
    # Венеция ПО АК2 В1
    ("Classic Baguette Венеция ПО АК2 В1 (Белый матовый Прозрачное стекло)", "cb_venezia_po_b1_beliy_official.jpg",
     ["%Венеция ПО АК2 В1%Белый матовый%"]),

    # Венеция ПО В3
    ("Classic Baguette Венеция ПО В3 (Белый матовый Сатинато с рамкой)", "cb_venezia_po_b3_beliy.jpg",
     ["%Венеция ПО В3%Белый матовый%"]),
    ("Classic Baguette Венеция ПО В3 (Графит премьер мат Сатинато с рамкой)", "cb_venezia_po_b3_grafit.jpg",
     ["%Венеция ПО В3%Графит%"]),
    ("Classic Baguette Венеция ПО В3 (Серый матовый Сатинато с рамкой)", "cb_venezia_po_b3_sery.jpg",
     ["%Венеция ПО В3%Серый матовый%"]),

    # Венеция ПО В5.3
    ("Classic Baguette Венеция ПО В5.3 (Белый матовый Сатинато с рамкой)", "cb_venezia_pg_b53_beliy.jpg",
     ["%Венеция ПО В5.3%Белый матовый%"]),

    # Неаполь ПГ B1
    ("Classic Baguette Неаполь ПГ B1 (Белый матовый)", "cb_neapol_pg_b1_beliy_official.jpg",
     ["%Неаполь ПГ B1%Белый матовый%"]),
    ("Classic Baguette Неаполь ПГ B1 Матовый кремовый", "cb_neapol_pg_b1_kremoviy.jpg",
     ["%Неаполь ПГ B1%кремовый%"]),

    # Неаполь ПГ B3
    ("Classic Baguette Неаполь ПГ B3 Белый матовый", "cb_neapol_pg_b3_beliy.jpg",
     ["%Неаполь ПГ B3%Белый матовый%"]),
    ("Classic Baguette Неаполь ПГ B3 Серый матовый", "cb_neapol_pg_b1_sery.jpg",
     ["%Неаполь ПГ B3%Серый матовый%"]),

    # Неаполь ПО B3
    ("Classic Baguette Неаполь ПО B3 (Белый матовый Сатинато с рамкой)", "cb_neapol_po_b3_beliy_official.jpg",
     ["%Неаполь ПО B3%Белый матовый%"]),
    ("Classic Baguette Неаполь ПО B3 (Серый матовый Сатинато с рамкой)", "cb_neapol_po_b3_beliy.jpg",
     ["%Неаполь ПО B3%Серый матовый%"]),

    # Турин ПГ B4
    ("Classic Baguette Турин ПГ B4 Белый матовый", "cb_turin_pg_b4_beliy.jpg",
     ["%Турин ПГ B4%Белый матовый%"]),
    ("Classic Baguette Турин ПГ B4 Графит премьер мат", "cb_turin_pg_b4_grafit.jpg",
     ["%Турин ПГ B4%Графит%"]),
    ("Classic Baguette Турин ПГ B4 Серый матовый", "cb_turin_pg_b4_sery.jpg",
     ["%Турин ПГ B4%Серый матовый%"]),
    ("Classic Baguette Турин ПГ B4 Матовый кремовый", "cb_turin_pg_b4_kremoviy.jpg",
     ["%Турин ПГ B4%кремовый%"]),

    # Турин ПО B4
    ("Classic Baguette Турин ПО B4 (Белый матовый Сатинато с рамкой)", "cb_turin_po_b4_beliy.jpg",
     ["%Турин ПО B4%Белый матовый%"]),
    ("Classic Baguette Турин ПО B4 (Графит премьер мат Сатинато с рамкой)", "cb_turin_po_b4_grafit.jpg",
     ["%Турин ПО B4%Графит%"]),
    ("Classic Baguette Турин ПО B4 (Серый матовый Сатинато с рамкой)", "cb_turin_po_b4_sery.jpg",
     ["%Турин ПО B4%Серый матовый%"]),
]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # Step 1: Archive EVERYTHING in category 191
        res = await conn.execute(text(
            "UPDATE product SET is_active = false WHERE category_id = :cid;"
        ), {"cid": CATEGORY_ID})
        print(f"Step 1: Archived all {res.rowcount} products")
        
        # Step 2: For each model, try to find existing product. If found, activate + set photo.
        # If not found, CREATE it.
        total_activated = 0
        total_created = 0
        
        for display_name, photo, patterns in MODELS:
            img_url = f"{PHOTO_BASE}{photo}"
            
            # Try each search pattern
            found = False
            for pat in patterns:
                res = await conn.execute(text(
                    "SELECT id, name FROM product WHERE category_id = :cid AND name ILIKE :pat LIMIT 1;"
                ), {"cid": CATEGORY_ID, "pat": pat})
                row = res.fetchone()
                if row:
                    # Activate it and set photo
                    await conn.execute(text(
                        "UPDATE product SET is_active = true, image_url = :img "
                        "WHERE id = :pid;"
                    ), {"pid": row[0], "img": img_url})
                    print(f"  ✅ Activated existing ID={row[0]}: {row[1]}")
                    total_activated += 1
                    found = True
                    break
            
            if not found:
                # Create new product
                res = await conn.execute(text(
                    "INSERT INTO product (name, category_id, price, image_url, is_active, stock, brand) "
                    "VALUES (:name, :cid, 0, :img, true, 0, 'Zadoor') RETURNING id;"
                ), {"name": display_name, "cid": CATEGORY_ID, "img": img_url})
                new_id = res.fetchone()[0]
                print(f"  🆕 Created ID={new_id}: {display_name}")
                total_created += 1
        
        print(f"\nStep 2: Activated {total_activated}, Created {total_created}")
        
        # Step 3: Final verification
        res = await conn.execute(text(
            "SELECT id, name, price, image_url FROM product "
            "WHERE category_id = :cid AND is_active = true ORDER BY name;"
        ), {"cid": CATEGORY_ID})
        rows = res.fetchall()
        print(f"\n=== Final Active Products ({len(rows)}) ===")
        for r in rows:
            has_img = "✅" if r[3] else "❌"
            price_str = f"{r[2]:,.0f}" if r[2] else "0 (уточнить)"
            print(f"  {has_img} ID={r[0]} | {price_str} сум | {r[1]}")

asyncio.run(main())
