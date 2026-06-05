import os
import shutil
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

# 1. Copy images
SRC_DIR = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/resources"
DST_DIR = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

IMAGES_TO_COPY = {
    'image_101245148_0.jpg': 'kvalitet_k11_alu_black_seryy_poperechnyy.jpg',
    'image_101245148_11.jpg': 'kvalitet_k11_dub_naturalnyy_poperechnyy.jpg',
    'image_101245148_1.jpg': 'kvalitet_k11_topan_dub_seryy_poperechnyy.jpg',
    'image_101245148_2.jpg': 'kvalitet_k14_alu_gold_grafit_premer_mat_mg.jpg',
    'image_101245148_3.jpg': 'kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg',
    'image_101245148_4.jpg': 'kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg',
    'image_101245148_5.jpg': 'kvalitet_k2_alu_black_dub_naturalnyy_prodolnyy.jpg',
    'image_101245148_6.jpg': 'kvalitet_k7_belyy_matovyy.jpg',
    'image_101245148_7.jpg': 'kvalitet_k7_dub_naturalnyy_prodolnyy.jpg',
    'image_101245148_8.jpg': 'kvalitet_k7_dub_seryy_prodolnyy.jpg',
    'image_101245148_9.jpg': 'kvalitet_k7_dub_temnyy_prodolnyy.jpg',
    'image_101245148_10.jpg': 'kvalitet_k7_orekh_shokolad_prodolnyy.jpg',
}

def copy_images():
    os.makedirs(DST_DIR, exist_ok=True)
    print("Copying Kvalitet images...")
    for src_name, dst_name in IMAGES_TO_COPY.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dst_path = os.path.join(DST_DIR, dst_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            print(f"  Copied {src_name} -> {dst_name}")
        else:
            print(f"  Warning: Source image {src_path} not found!")

def get_image_for_name(name):
    name_upper = name.upper()
    
    is_k11 = "К11" in name_upper or "K11" in name_upper
    is_k14 = "К14" in name_upper or "K14" in name_upper
    is_k15 = "К15" in name_upper or "K15" in name_upper
    is_k13 = "К13" in name_upper or "K13" in name_upper
    is_k17 = "К17" in name_upper or "K17" in name_upper
    is_k21 = "К21" in name_upper or "K21" in name_upper
    is_k10 = "К10" in name_upper or "K10" in name_upper
    is_k2 = "К2" in name_upper or "K2" in name_upper
    is_k7 = "К7" in name_upper or "K7" in name_upper
    is_k1 = "К1" in name_upper or "K1" in name_upper
    
    is_alu_black = "ALU BLACK" in name_upper
    
    # K11 ALU Black
    if is_k11 and is_alu_black:
        return "kvalitet_k11_alu_black_seryy_poperechnyy.jpg"
    # K11 (others)
    elif is_k11:
        if "СЕРЫЙ" in name_upper:
            return "kvalitet_k11_topan_dub_seryy_poperechnyy.jpg"
        else:
            return "kvalitet_k11_dub_naturalnyy_poperechnyy.jpg"
    # K14
    elif is_k14:
        return "kvalitet_k14_alu_gold_grafit_premer_mat_mg.jpg"
    # K15, K13, K17, K21
    elif is_k15 or is_k13 or is_k17 or is_k21:
        return "kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg"
    # K2
    elif is_k2:
        if "БЕЛЫЙ МАТОВЫЙ" in name_upper or "БЕЛЫЙ МАТ" in name_upper:
            return "kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg"
        else:
            return "kvalitet_k2_alu_black_dub_naturalnyy_prodolnyy.jpg"
    # K7
    elif is_k7:
        if "БЕЛЫЙ МАТОВЫЙ" in name_upper or "БЕЛЫЙ МАТ" in name_upper:
            return "kvalitet_k7_belyy_matovyy.jpg"
        elif "СЕРЫЙ" in name_upper:
            return "kvalitet_k7_dub_seryy_prodolnyy.jpg"
        elif "ТЕМНЫЙ" in name_upper or "ТЁМНЫЙ" in name_upper:
            return "kvalitet_k7_dub_temnyy_prodolnyy.jpg"
        elif "ОРЕХ" in name_upper:
            return "kvalitet_k7_orekh_shokolad_prodolnyy.jpg"
        else:
            return "kvalitet_k7_dub_naturalnyy_prodolnyy.jpg"
    # Fallback for generic doors (K1, K10 or others)
    else:
        if is_k10:
            if "БЕЛЫЙ" in name_upper:
                return "kvalitet_k7_belyy_matovyy.jpg"
            else:
                return "kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg"
        elif is_k1:
            return "kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg"
        return "kvalitet_k7_dub_naturalnyy_prodolnyy.jpg"

async def migrate_db():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Fetch all Kvalitet doors
        res = await session.execute(text("""
            SELECT id, name, category_id, sku, is_active, image_url 
            FROM product 
            WHERE (name ILIKE '%Квалитет%' OR name ILIKE '%Kvalitet%')
              AND name NOT ILIKE '%добор%'
              AND name NOT ILIKE '%короб%'
              AND name NOT ILIKE '%наличник%'
              AND name NOT ILIKE '%буклет%'
              AND name NOT ILIKE '%планка%'
              AND name NOT ILIKE '%порог%'
        """))
        products = res.fetchall()
        print(f"\nFound {len(products)} Kvalitet door products in database.")
        
        updates_count = 0
        for p in products:
            p_id = p[0]
            name = p[1]
            old_image = p[5]
            
            img_name = get_image_for_name(name)
            new_image = f"/static/uploads/doors/{img_name}"
            
            if old_image != new_image:
                await session.execute(
                    text("UPDATE product SET image_url = :image_url WHERE id = :id"),
                    {"image_url": new_image, "id": p_id}
                )
                updates_count += 1
                if updates_count <= 25:
                    print(f"  Updated ID={p_id} | Name='{name}' -> Image='{new_image}'")
        
        await session.commit()
        print(f"\nDatabase migration complete. Updated {updates_count} products.")

async def main():
    copy_images()
    await migrate_db()

if __name__ == "__main__":
    asyncio.run(main())
