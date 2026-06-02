import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'maff.db')
PHOTO_BASE = '/images/products/zadoor/'

# Normalize names: allow both B and В, both in product name and search keyword
PHOTO_MAP = [
    # ===== Elen =====
    (('Elen', 'грунт'), '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'),
    (('Elen', 'покраск'), '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'),
    (('Elen', 'белая эмаль'), '0rbwyhiq8cx3chiblyy06aj92xb8jyq8.jpg'),
    (('Elen', None), '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'),
    
    # ===== Неаполь =====
    (('Неаполь ПГ В3', 'белый'), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Неаполь ПГ В3', 'серый'), '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg'),
    (('Неаполь ПГ В3', None), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Неаполь ПГ В5', 'серый'), '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg'),
    (('Неаполь ПГ В5', None), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Неаполь ПГ', 'белый'), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Неаполь ПГ', 'серый'), '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg'),
    (('Неаполь ПГ', None), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    
    (('Неаполь ПО В3', 'серый'), 'jvhti96pbyqs5s2emi7zsy97qmp2t5lh.jpg'),
    (('Неаполь ПО В3', 'графит'), 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg'),
    (('Неаполь ПО В3', None), 'jvhti96pbyqs5s2emi7zsy97qmp2t5lh.jpg'),
    
    # ===== Неаполь Английская Классика =====
    (('Английская Классика 2', 'белый'), 'qogvz5oibrshamk2rzulnjtnbq7ea0tt.jpg'),
    (('Английская Классика 2', None), 'qogvz5oibrshamk2rzulnjtnbq7ea0tt.jpg'),
    (('Английская Классика', 'кремовый'), 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg'),
    (('Английская Классика', 'матовый кремовый'), 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg'),
    (('Английская Классика', 'серый'), 'sg9sbwz4jwua04zbv1ynhcc188j32f1o.jpg'),
    (('Английская Классика', 'белый'), 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg'),
    (('Английская Классика', None), 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg'),
    
    (('Неаполь ПО АК', 'кремовый'), '09q5vw39607zi6cuwxm3rmy9x16ifokj.jpg'),
    (('Неаполь ПО АК', None), '09q5vw39607zi6cuwxm3rmy9x16ifokj.jpg'),
    
    # ===== Венеция =====
    (('Венеция ПГ В3', 'серый'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Венеция ПГ В3', 'белый'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Венеция ПГ В3', 'кремовый'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Венеция ПГ В3', None), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    
    (('Венеция ПГ В4', 'белый'), '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg'),
    (('Венеция ПГ В4', None), '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg'),
    
    (('Венеция ПГ В5', 'белый'), 'qepl102zizup5kr0poshftxhu0c8wmvl.jpg'),
    (('Венеция ПГ В5', None), 'qepl102zizup5kr0poshftxhu0c8wmvl.jpg'),
    
    (('Венеция ПО В5', 'белый'), 'o2rwi3rvba7l5gysbf1cd69l63zs27zh.jpg'),
    (('Венеция ПО В5', None), 'o2rwi3rvba7l5gysbf1cd69l63zs27zh.jpg'),
    
    (('Венеция ПО В3', 'графит'), 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg'),
    (('Венеция ПО В3', None), 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg'),
    
    (('Венеция ПО', 'сатинато'), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    (('Венеция ПО', 'белый'), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    (('Венеция ПО', None), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    
    (('Венеция ПО АК2', 'белый'), 'hl46k6jqsyupad6ukdmllmnv3tc0cogo.jpg'),
    (('Венеция ПО АК2', None), 'hl46k6jqsyupad6ukdmllmnv3tc0cogo.jpg'),
    
    (('Венеция ПГ', None), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Венеция ПО', None), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    
    # ===== Турин =====
    (('Турин ПГ В4', 'кремовый'), '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg'),
    (('Турин ПГ В4', 'белый'), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    (('Турин ПГ В4', 'серый'), 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg'),
    (('Турин ПГ В4', None), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    (('Турин ПГ', None), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    
    # ===== SP57 =====
    (('SP57', 'нордик'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP57', 'орех'), 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg'),
    (('SP57', 'бетон'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP57', 'тёмно-серый'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP57', 'тёмный лён'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP57', None), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    
    # ===== SP64 =====
    (('SP64', 'тёмно-серый'), 'xadbb3jf187wvf3x6oc6nrvq5af2g4un.jpg'),
    (('SP64', 'нордик'), 'ko6vf4ifveud0p9z7z4v7ln3oxvrey0q.jpg'),
    (('SP64', 'сканди'), 'ru05zn3zz4po2l4lkck5w66a4r0xicqt.jpg'),
    (('SP64', 'бетон'), 'a981sq9p1vuom0pwuxi6dsgpzrk374xd.jpg'),
    (('SP64', None), 'ko6vf4ifveud0p9z7z4v7ln3oxvrey0q.jpg'),
    
    # ===== SP51 =====
    (('SP51', 'нордик'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP51', 'бренди'), 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg'),
    (('SP51', 'светло-серый'), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    (('SP51', None), '8x07aa4otudx1xavyssq8drbyihdi1no.jpg'),
    
    # ===== Коллекция S =====
    (('S ', 'молочный'), '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg'),
    (('S ', 'белый'), 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg'),
    (('S ', 'графит'), 'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg'),
    (('S ', None), 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg'),
    
    # ===== Квалитет =====
    (('Квалитет', 'белый'), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    (('Квалитет', 'серый'), 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg'),
    (('Квалитет', 'дуб'), 'aahdro0wm02wsjgzqrsmiof6rosgspnw.jpg'),
    (('Квалитет', None), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    
    # ===== Portika =====
    (('Классико', None), 'Классико 12-1 Shellac White.jpg'),
    (('Неоклассико', None), 'Неоклассико-2 PRO ЭКО Ice.jpg'),
    (('Порта', None), 'Порта-51 4AB ПП Alaska Black Star.jpg'),
]

def match_photo(name):
    name_lower = name.lower()
    
    # Try exact color match first (skip None entries)
    for (model_kw, color_kw), filename in PHOTO_MAP:
        if model_kw.lower() in name_lower:
            if color_kw is None:
                continue
            if color_kw.lower() in name_lower:
                return filename
    
    # Then try model-only fallback
    for (model_kw, color_kw), filename in PHOTO_MAP:
        if color_kw is None and model_kw.lower() in name_lower:
            return filename
    
    return None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
    SELECT id, name FROM product 
    WHERE name LIKE '%ZADOOR%' OR name LIKE '%zadoor%' 
       OR name LIKE '%Неаполь%' OR name LIKE '%Венеция%' 
       OR name LIKE '%Турин%' OR name LIKE '%Elen%' 
       OR name LIKE '%SP51%' OR name LIKE '%SP57%' OR name LIKE '%SP64%'
       OR name LIKE '%Classic Baguette%' OR name LIKE '%Коллекция S%'
       OR name LIKE '%Квалитет%' OR name LIKE '%Filomuro%'
       OR name LIKE '%Классико%' OR name LIKE '%Неоклассико%' OR name LIKE '%Порта%'
    ORDER BY name
""")
products = cur.fetchall()

updated = 0
skipped_names = []

for pid, name in products:
    filename = match_photo(name)
    if filename:
        image_url = PHOTO_BASE + filename
        cur.execute("UPDATE product SET image_url = ? WHERE id = ?", (image_url, pid))
        updated += 1
    else:
        skipped_names.append(name)

conn.commit()
conn.close()

print(f"Updated: {updated}, Skipped: {len(skipped_names)}, Total: {len(products)}")
if skipped_names:
    print("\nSkipped (first 20):")
    for n in skipped_names[:20]:
        print(f"  - {n}")
