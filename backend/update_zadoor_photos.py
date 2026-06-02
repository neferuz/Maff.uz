import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'maff.db')
PHOTO_BASE = '/images/products/zadoor/'

# Mapping: (model_keyword, color_keyword) -> filename
PHOTO_MAP = {
    # Elen
    ('Elen', None): '4luduzxj155pp1ut0vbue628mb3dxxow.jpg',
    ('Elen', 'грунт'): '4luduzxj155pp1ut0vbue628mb3dxxow.jpg',
    ('Elen', 'покраск'): '4luduzxj155pp1ut0vbue628mb3dxxow.jpg',
    
    # Неаполь ПГ B3
    ('Неаполь ПГ B3', 'белый'): '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg',
    ('Неаполь ПГ B3', 'белый'): '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg',
    ('Неаполь ПГ B3', 'серый'): '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg',
    
    # Неаполь ПО B3
    ('Неаполь ПО B3', 'серый'): 'jvhti96pbyqs5s2emi7zsy97qmp2t5lh.jpg',
    ('Неаполь ПО B3', 'графит'): 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg',
    
    # Неаполь ПО Английская Классика
    ('Английская Классика', 'белый'): 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg',
    ('Английская Классика', 'серый'): 'sg9sbwz4jwua04zbv1ynhcc188j32f1o.jpg',
    ('Английская Классика', 'кремовый'): 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg',
    ('Английская Классика', 'матовый кремовый'): 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg',
    
    # Неаполь ПО Английская Классика 2
    ('Английская Классика 2', 'белый'): 'qogvz5oibrshamk2rzulnjtnbq7ea0tt.jpg',
    
    # Неаполь ПО АК
    ('Неаполь ПО АК', 'кремовый'): '09q5vw39607zi6cuwxm3rmy9x16ifokj.jpg',
    
    # Венеция ПГ B3
    ('Венеция ПГ B3', 'серый'): 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg',
    
    # Венеция ПГ B4
    ('Венеция ПГ B4', 'белый'): '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg',
    
    # Венеция ПГ B5.3
    ('Венеция ПГ B5', 'белый'): 'qepl102zizup5kr0poshftxhu0c8wmvl.jpg',
    
    # Венеция ПО B5.3
    ('Венеция ПО B5', 'белый'): 'o2rwi3rvba7l5gysbf1cd69l63zs27zh.jpg',
    
    # Венеция ПО сатинато
    ('Венеция ПО', 'сатинато'): '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg',
    
    # Венеция ПО АК2
    ('Венеция ПО АК2', 'белый'): 'hl46k6jqsyupad6ukdmllmnv3tc0cogo.jpg',
    
    # Турин ПГ B4
    ('Турин ПГ B4', 'кремовый'): '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg',
    ('Турин ПГ B4', 'белый'): '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg',
    ('Турин ПГ B4', 'серый'): 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg',
    
    # SP57
    ('SP57', 'нордик'): '8x07aa4otudx1xavyssq8drbyihdi1no.jpg',
    ('SP57', 'орех'): 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg',
    
    # SP64
    ('SP64', 'тёмно-серый'): 'xadbb3jf187wvf3x6oc6nrvq5af2g4un.jpg',
    ('SP64', 'нордик'): 'ko6vf4ifveud0p9z7z4v7ln3oxvrey0q.jpg',
    ('SP64', 'сканди'): 'ru05zn3zz4po2l4lkck5w66a4r0xicqt.jpg',
    ('SP64', 'бетон'): 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg',  # fallback
    
    # Коллекция S
    ('S ', 'молочный'): '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg',
    ('S ', 'белый'): 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg',
    ('S ', 'графит'): 'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg',
}

def match_photo(name):
    name_lower = name.lower()
    
    # Try exact matches with color
    for (model_kw, color_kw), filename in PHOTO_MAP.items():
        if model_kw.lower() in name_lower:
            if color_kw is None or color_kw.lower() in name_lower:
                return filename
    
    # Fallback: match by model only (first available)
    for (model_kw, color_kw), filename in PHOTO_MAP.items():
        if color_kw is None and model_kw.lower() in name_lower:
            return filename
    
    return None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Get ZADOOR products
cur.execute("""
    SELECT id, name FROM product 
    WHERE name LIKE '%ZADOOR%' OR name LIKE '%zadoor%' 
       OR name LIKE '%Неаполь%' OR name LIKE '%Венеция%' 
       OR name LIKE '%Турин%' OR name LIKE '%Elen%' 
       OR name LIKE '%SP51%' OR name LIKE '%SP57%' OR name LIKE '%SP64%'
       OR name LIKE '%Classic Baguette%' OR name LIKE '%Коллекция S%'
       OR name LIKE '%Квалитет%' OR name LIKE '%Filomuro%'
    ORDER BY name
""")
products = cur.fetchall()

updated = 0
skipped = 0

for pid, name in products:
    filename = match_photo(name)
    if filename:
        image_url = PHOTO_BASE + filename
        cur.execute("UPDATE product SET image_url = ? WHERE id = ?", (image_url, pid))
        updated += 1
    else:
        skipped += 1

conn.commit()
conn.close()

print(f"Updated: {updated}, Skipped: {skipped}, Total: {len(products)}")
