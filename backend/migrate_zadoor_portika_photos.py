import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

# Mapping base paths
PHOTO_BASE = '/images/products/zadoor/'

MODEL_PHOTOS = {
    'неаполь': {
        'белый': '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg',
        'серый': '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg',
        'графит': 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg',
        'кремовый': 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg',
        'матовый кремовый': 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg',
        '_fallbacks': [
            '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg',
            '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg',
            'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg',
            'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg',
            'sg9sbwz4jwua04zbv1ynhcc188j32f1o.jpg',
            '09q5vw39607zi6cuwxm3rmy9x16ifokj.jpg',
            'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg',
            'qogvz5oibrshamk2rzulnjtnbq7ea0tt.jpg',
        ]
    },
    'венеция': {
        'белый': '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg',
        'серый': 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg',
        'графит': 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg',
        'матовый кремовый': 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg',
        'сатинато': '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg',
        '_fallbacks': [
            '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg',
            'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg',
            'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg',
            '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg',
            'qepl102zizup5kr0poshftxhu0c8wmvl.jpg',
            'o2rwi3rvba7l5gysbf1cd69l63zs27zh.jpg',
            'hl46k6jqsyupad6ukdmllmnv3tc0cogo.jpg',
        ]
    },
    'турин': {
        'белый': '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
        'серый': 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
        'кремовый': '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg',
        'графит': '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
        '_fallbacks': [
            '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
            '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg',
            'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
        ]
    },
    'elen': {
        '_fallbacks': ['4luduzxj155pp1ut0vbue628mb3dxxow.jpg']
    },
    'коллекция s': {
        'молочный': '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg',
        'белый': 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg',
        'графит': 'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg',
        '_fallbacks': [
            'd1qkjre40mijnzwbani08bajxj0jtsur.jpg',
            '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg',
            'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg',
        ]
    },
    'классико': {
        '_fallbacks': ['Классико 12-1 Shellac White.jpg']
    },
    'неоклассико': {
        '_fallbacks': ['Неоклассико-2 PRO ЭКО Ice.jpg']
    },
    'порта': {
        '_fallbacks': ['Порта-51 4AB ПП Alaska Black Star.jpg']
    },
}

def match_photo(name: str) -> str:
    name_lower = name.lower()
    
    # Check each model in MODEL_PHOTOS
    for model, model_data in MODEL_PHOTOS.items():
        if model in name_lower:
            # Try exact color match
            for color_kw, filename in model_data.items():
                if color_kw == '_fallbacks':
                    continue
                if color_kw in name_lower:
                    return PHOTO_BASE + filename
            
            # Fallback
            fallbacks = model_data.get('_fallbacks', [])
            if fallbacks:
                # Deterministic fallback based on name hash
                idx = hash(name) % len(fallbacks)
                return PHOTO_BASE + fallbacks[abs(idx)]
                
    # Extra fallback matching keywords directly
    if 'классико' in name_lower:
        return PHOTO_BASE + 'Классико 12-1 Shellac White.jpg'
    if 'неоклассико' in name_lower:
        return PHOTO_BASE + 'Неоклассико-2 PRO ЭКО Ice.jpg'
    if 'порта' in name_lower:
        return PHOTO_BASE + 'Порта-51 4AB ПП Alaska Black Star.jpg'
    if 'elen' in name_lower or 'filomuro' in name_lower:
        return PHOTO_BASE + '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'
        
    return None

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get category IDs under 174 (Doors)
        res = await session.execute(text("SELECT id, name, parent_id FROM category"))
        all_cats = {row[0]: (row[1], row[2]) for row in res.fetchall()}
        
        def get_all_child_ids(cat_id):
            ids = [cat_id]
            for cid, (name, parent_id) in all_cats.items():
                if parent_id == cat_id:
                    ids.extend(get_all_child_ids(cid))
            return list(set(ids))
            
        door_cat_ids = get_all_child_ids(174)
        
        # Fetch all active doors with no image or placeholder image
        res_p = await session.execute(
            text("""
                SELECT id, name, category_id, image_url 
                FROM product 
                WHERE category_id = ANY(:cat_ids)
                  AND (image_url IS NULL OR image_url = '' OR image_url LIKE '%placeholder%')
                  AND is_active = True
            """),
            {"cat_ids": door_cat_ids}
        )
        products = res_p.fetchall()
        print(f"Found {len(products)} door products with missing/placeholder images.")
        
        updated_count = 0
        for pid, name, cid, img_url in products:
            # Exclude handles, trim, moldings
            name_lower = name.lower()
            if any(kw in name_lower for kw in ["ручка", "петл", "ограничител", "добор", "короб", "наличник", "планка", "порог"]):
                continue
                
            matched_img = match_photo(name)
            if matched_img:
                await session.execute(
                    text("UPDATE product SET image_url = :img WHERE id = :id"),
                    {"img": matched_img, "id": pid}
                )
                updated_count += 1
                if updated_count <= 20:
                    print(f"  [UPDATED] ID={pid} | Name='{name}' -> Image='{matched_img}'")
                    
        await session.commit()
        print(f"Total updated: {updated_count}")

if __name__ == '__main__':
    asyncio.run(migrate())
