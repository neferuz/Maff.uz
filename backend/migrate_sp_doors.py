import os
import shutil
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

# 1. Define image copy mappings: source file -> clean target filename
SP_IMAGE_MAPPING = {
    "image_896941646_0.jpg": "sp51_sp_belennyy_dub.jpg",
    "image_896941646_1.jpg": "sp51_sp_brendi.jpg",
    "image_896941646_26.jpg": "sp51_sp_svetlo_seryy.jpg",
    "image_896941646_27.jpg": "sp51_sp_nordik.jpg",
    "image_896941646_7.jpg": "sp57_sp_temno_seryy_chernyy_lakobel.jpg",
    "image_896941646_16.jpg": "sp66_sp_temno_seryy_chernyy_lakobel.jpg",
    "image_896941646_2.jpg": "sp57_sp_beton_svetlyy_chernyy_lakobel.jpg",
    "image_896941646_3.jpg": "sp57_sp_beton_temnyy_chernyy_lakobel.jpg",
    "image_896941646_4.jpg": "sp57_sp_nordik_chernyy_lakobel.jpg",
    "image_896941646_5.jpg": "sp57_sp_orekh_karamel_chernyy_lakobel.jpg",
    "image_896941646_6.jpg": "sp57_sp_svetlyy_len_chernyy_lakobel.jpg",
    "image_896941646_8.jpg": "sp57_sp_tyomnyy_len_chernyy_lakobel.jpg",
    "image_896941646_9.jpg": "sp57_sp_skandi_chernyy_lakobel.jpg",
    "image_896941646_23.jpg": "sp66_sp_temnyy_len_chernyy_lakobel.jpg",
    "image_896941646_10.jpg": "sp64_sp_beton_temnyy_chernyy_lakobel.jpg",
    "image_896941646_12.jpg": "sp64_sp_nordik_satinato.jpg",
    "image_896941646_11.jpg": "sp64_sp_nordik_chernyy_lakobel.jpg",
    "image_896941646_14.jpg": "sp64_sp_skandi_satinato.jpg",
    "image_896941646_13.jpg": "sp64_sp_skandi_chernyy_lakobel.jpg",
    "image_896941646_15.jpg": "sp64_sp_temno_seryy_chernyy_lakobel.jpg",
    "image_896941646_24.jpg": "sp66_sp_svetlyy_len_zerkalo_lyuks.jpg",
    "image_896941646_17.jpg": "sp66_sp_beton_svetlyy_chernyy_lakobel.jpg",
    "image_896941646_25.jpg": "sp66_sp_beton_temnyy_chernyy_lakobel.jpg",
    "image_896941646_18.jpg": "sp66_sp_nordik_chernyy_lakobel.jpg",
    "image_896941646_19.jpg": "sp66_sp_svetlyy_len_chernyy_lakobel.jpg",
    "image_896941646_20.jpg": "sp66_sp_orekh_karamel_chernyy_lakobel.jpg",
    "image_896941646_21.jpg": "sp66_sp_svetlo_seryy_chernyy_lakobel.jpg",
    "image_896941646_22.jpg": "sp66_sp_skandi_chernyy_lakobel.jpg",
}

SRC_DIR = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/resources"
DST_DIR = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

def copy_images():
    print("--- Copying original images to static upload folder with clean names ---")
    os.makedirs(DST_DIR, exist_ok=True)
    for src_name, dst_name in SP_IMAGE_MAPPING.items():
        src_path = os.path.join(SRC_DIR, src_name)
        dst_path = os.path.join(DST_DIR, dst_name)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            print(f"Copied {src_name} -> {dst_name}")
        else:
            print(f"WARNING: Source image {src_path} not found!")

def get_image_url_for_name(name: str) -> str:
    name_upper = name.upper()
    sp_img_name = None
    
    if 'SP51' in name_upper:
        if 'БЕЛЕН' in name_upper:
            sp_img_name = "sp51_sp_belennyy_dub.jpg"
        elif 'БРЕНД' in name_upper:
            sp_img_name = "sp51_sp_brendi.jpg"
        elif 'СВЕТЛО-СЕР' in name_upper or 'СВЕТЛО СЕР' in name_upper:
            sp_img_name = "sp51_sp_svetlo_seryy.jpg"
        elif 'НОРДИК' in name_upper:
            sp_img_name = "sp51_sp_nordik.jpg"
    elif 'SP57' in name_upper:
        if 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
            sp_img_name = "sp57_sp_temno_seryy_chernyy_lakobel.jpg"
        elif 'БЕТОН СВЕТ' in name_upper:
            sp_img_name = "sp57_sp_beton_svetlyy_chernyy_lakobel.jpg"
        elif 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
            sp_img_name = "sp57_sp_beton_temnyy_chernyy_lakobel.jpg"
        elif 'НОРДИК' in name_upper:
            sp_img_name = "sp57_sp_nordik_chernyy_lakobel.jpg"
        elif 'ОРЕХ' in name_upper:
            sp_img_name = "sp57_sp_orekh_karamel_chernyy_lakobel.jpg"
        elif 'СВЕТЛЫЙ Л' in name_upper or 'СВЕТЛЫЙЛ' in name_upper:
            sp_img_name = "sp57_sp_svetlyy_len_chernyy_lakobel.jpg"
        elif 'ТЕМНЫЙ Л' in name_upper or 'ТЁМНЫЙ Л' in name_upper or 'ТЕМНЫЙЛ' in name_upper or 'ТЁМНЫЙЛ' in name_upper:
            sp_img_name = "sp57_sp_tyomnyy_len_chernyy_lakobel.jpg"
        elif 'СКАНДИ' in name_upper:
            sp_img_name = "sp57_sp_skandi_chernyy_lakobel.jpg"
    elif 'SP64' in name_upper:
        if 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
            sp_img_name = "sp64_sp_beton_temnyy_chernyy_lakobel.jpg"
        elif 'НОРДИК САТ' in name_upper:
            sp_img_name = "sp64_sp_nordik_satinato.jpg"
        elif 'НОРДИК Ч' in name_upper or 'НОРДИК' in name_upper:
            sp_img_name = "sp64_sp_nordik_chernyy_lakobel.jpg"
        elif 'СКАНДИ САТ' in name_upper:
            sp_img_name = "sp64_sp_skandi_satinato.jpg"
        elif 'СКАНДИ Ч' in name_upper or 'СКАНДИ' in name_upper:
            sp_img_name = "sp64_sp_skandi_chernyy_lakobel.jpg"
        elif 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
            sp_img_name = "sp64_sp_temno_seryy_chernyy_lakobel.jpg"
    elif 'SP66' in name_upper:
        if 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
            sp_img_name = "sp66_sp_temno_seryy_chernyy_lakobel.jpg"
        elif 'ТЕМНЫЙ Л' in name_upper or 'ТЁМНЫЙ Л' in name_upper or 'ТЕМНЫЙЛ' in name_upper or 'ТЁМНЫЙЛ' in name_upper:
            sp_img_name = "sp66_sp_temnyy_len_chernyy_lakobel.jpg"
        elif 'ЗЕРКАЛО' in name_upper:
            sp_img_name = "sp66_sp_svetlyy_len_zerkalo_lyuks.jpg"
        elif 'БЕТОН СВЕТ' in name_upper:
            sp_img_name = "sp66_sp_beton_svetlyy_chernyy_lakobel.jpg"
        elif 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
            sp_img_name = "sp66_sp_beton_temnyy_chernyy_lakobel.jpg"
        elif 'НОРДИК' in name_upper:
            sp_img_name = "sp66_sp_nordik_chernyy_lakobel.jpg"
        elif 'СВЕТЛЫЙ Л' in name_upper or 'СВЕТЛЫЙЛ' in name_upper or 'СВЕТЛЫЙ ЛЕН' in name_upper:
            sp_img_name = "sp66_sp_svetlyy_len_chernyy_lakobel.jpg"
        elif 'ОРЕХ' in name_upper:
            sp_img_name = "sp66_sp_orekh_karamel_chernyy_lakobel.jpg"
        elif 'СВЕТЛО-СЕР' in name_upper or 'СВЕТЛО СЕР' in name_upper:
            sp_img_name = "sp66_sp_svetlo_seryy_chernyy_lakobel.jpg"
        elif 'СКАНДИ' in name_upper:
            sp_img_name = "sp66_sp_skandi_chernyy_lakobel.jpg"
            
    if sp_img_name:
        return f"/static/uploads/doors/{sp_img_name}"
    return None

async def migrate_db():
    print("\n--- Migrating database product categories and images ---")
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Fetch all active doors that are SP doors
        # Or any product matching SP51, SP57, SP64, SP66
        res = await session.execute(
            text("""
                SELECT id, name, category_id, image_url 
                FROM product 
                WHERE name ILIKE '%SP51%' OR name ILIKE '%SP57%' OR name ILIKE '%SP64%' OR name ILIKE '%SP66%'
            """)
        )
        products = res.fetchall()
        print(f"Found {len(products)} SP door candidates in DB.")
        
        updated_doors = 0
        for p_id, name, cat_id, img_url in products:
            # Exclude handles
            if any(kw in name.lower() for kw in ["ручка", "петл", "ограничител"]):
                continue
            # Exclude other moldings (добор, коробка, наличник)
            if any(kw in name.lower() for kw in ["добор", "короб", "наличник", "планка"]):
                continue
                
            correct_img = get_image_url_for_name(name)
            
            # We want to assign them to category 459 and set correct image
            if correct_img or cat_id != 459:
                stmt = text("""
                    UPDATE product 
                    SET category_id = 459, image_url = :img, brand = 'Zadoor', country = 'Россия'
                    WHERE id = :id
                """)
                # If no correct image mapped, preserve the existing one
                img_to_set = correct_img or img_url
                await session.execute(stmt, {"img": img_to_set, "id": p_id})
                updated_doors += 1
                
        print(f"Updated {updated_doors} SP doors in database.")
        
        # Now correct the handles category currently in 459
        res_handles = await session.execute(
            text("""
                SELECT id, name 
                FROM product 
                WHERE category_id = 459 AND (name ILIKE '%ручка%' OR name ILIKE '%spinal%' OR name ILIKE '%despina%' OR name ILIKE '%jasper%')
            """)
        )
        handles = res_handles.fetchall()
        print(f"Found {len(handles)} handles incorrectly mapped to category 459.")
        
        updated_handles = 0
        for h_id, name in handles:
            # Match handle category
            name_upper = name.upper()
            system_models = {
                'PIXAR': 144, 'AXEL': 145, 'AGATE': 146, 'MIMAS': 147, 'METIS': 148,
                'CONCORDIA': 149, 'SARP': 150, 'MARVEL': 151, 'AKIK': 152, 'DESPINA': 155,
                'ODIN': 156, 'ZETTA': 157, 'GAMMA': 158, 'VEGA': 159, 'SINUS': 160,
                'ROCCA': 161, 'PRIZMA': 162, 'RODIN': 163, 'ROCKET': 164, 'SPINAL': 165,
                'MAJA': 166, 'CARME': 167, 'LINEAR': 168, 'STARK': 169, 'JASPER': 170,
                'VISION': 171, 'LIBRA': 172
            }
            model_cid = None
            for model_kw, cid in system_models.items():
                if model_kw in name_upper:
                    model_cid = cid
                    break
            
            # fallback to РУЧКИ SYSTEM (143)
            final_cid = model_cid or 143
            
            await session.execute(
                text("UPDATE product SET category_id = :cat_id WHERE id = :id"),
                {"cat_id": final_cid, "id": h_id}
            )
            updated_handles += 1
            print(f"  Moved handle '{name}' to category {final_cid}")
            
        print(f"Corrected {updated_handles} handles.")
        await session.commit()

async def main():
    copy_images()
    await migrate_db()

if __name__ == "__main__":
    asyncio.run(main())
