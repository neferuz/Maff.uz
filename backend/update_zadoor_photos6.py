import sqlite3
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), 'maff.db')
PHOTO_BASE = '/images/products/zadoor/'

# Model -> { color_keyword: filename, '_fallbacks': [filenames] }
MODEL_PHOTOS = {
    'Неаполь': {
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
    'Венеция': {
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
    'Турин': {
        'белый': '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
        'серый': 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',  # will fallback to white if missing
        'кремовый': '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg',
        'графит': '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
        '_fallbacks': [
            '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
            '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg',
            'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
        ]
    },
    'Elen': {
        None: '4luduzxj155pp1ut0vbue628mb3dxxow.jpg',
        '_fallbacks': ['4luduzxj155pp1ut0vbue628mb3dxxow.jpg']
    },
    'SP57': {
        'нордик': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        'орех': 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        'бетон': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        'тёмно-серый': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        'тёмный лён': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        '_fallbacks': [
            '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
            'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        ]
    },
    'SP64': {
        'тёмно-серый': 'xadbb3jf187wvf3x6oc6nrvq5af2g4un.jpg',
        'нордик': 'ko6vf4ifveud0p9z7z4v7ln3oxvrey0q.jpg',
        'сканди': 'ru05zn3zz4po2l4lkck5w66a4r0xicqt.jpg',
        'бетон': 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg',
        '_fallbacks': [
            'xadbb3jf187wvf3x6oc6nrvq5af2g4un.jpg',
            'ko6vf4ifveud0p9z7z4v7ln3oxvrey0q.jpg',
            'ru05zn3zz4po2l4lkck5w66a4r0xicqt.jpg',
        ]
    },
    'SP51': {
        'нордик': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        'бренди': 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        'светло-серый': '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
        '_fallbacks': [
            '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
            'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        ]
    },
    'S ': {
        'молочный': '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg',
        'белый': 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg',
        'графит': 'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg',
        '_fallbacks': [
            'd1qkjre40mijnzwbani08bajxj0jtsur.jpg',
            '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg',
            'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg',
        ]
    },
    'Квалитет': {
        'белый': '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
        'серый': 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
        'дуб': 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        '_fallbacks': [
            '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
            'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
            'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
        ]
    },
}

def match_model(name_lower):
    models = ['Неаполь', 'Венеция', 'Турин', 'Elen', 'SP57', 'SP64', 'SP51', 'S ', 'Квалитет']
    for model in models:
        if model.lower() in name_lower:
            return model
    return None

def match_photo(name):
    name_lower = name.lower()
    model = match_model(name_lower)
    if not model:
        return None
    
    model_data = MODEL_PHOTOS.get(model)
    if not model_data:
        return None
    
    # Try exact color match
    for color_kw, filename in model_data.items():
        if color_kw is None or (isinstance(color_kw, str) and color_kw.startswith('_')):
            continue
        if color_kw.lower() in name_lower:
            return filename
    
    # Fallback: use first available fallback for this model
    fallbacks = model_data.get('_fallbacks', [])
    if fallbacks:
        # Use deterministic assignment based on product name hash
        idx = hash(name) % len(fallbacks)
        return fallbacks[abs(idx)]
    
    return None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Get ZADOOR products
cur.execute("""
    SELECT id, name FROM product 
    WHERE (name LIKE '%ZADOOR%' OR name LIKE '%zadoor%' OR name LIKE '%Неаполь%' OR name LIKE '%Венеция%' OR name LIKE '%Турин%' OR name LIKE '%Elen%' OR name LIKE '%SP51%' OR name LIKE '%SP57%' OR name LIKE '%SP64%' OR name LIKE '%Classic Baguette%' OR name LIKE '%Коллекция S%' OR name LIKE '%Квалитет%' OR name LIKE '%Filomuro%')
       AND (image_url IS NULL OR image_url = '' OR image_url LIKE '%placeholder%')
""")
products = cur.fetchall()

updated = 0
for pid, name in products:
    filename = match_photo(name)
    if filename:
        image_url = PHOTO_BASE + filename
        cur.execute("UPDATE product SET image_url = ? WHERE id = ?", (image_url, pid))
        updated += 1

conn.commit()
conn.close()
print(f"Updated: {updated} / {len(products)}")
