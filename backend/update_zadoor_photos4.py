import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'maff.db')
PHOTO_BASE = '/images/products/zadoor/'

# Additional mappings for remaining products
EXTRA_MAP = [
    # Неаполь ПО B3 (latin B) with сатинато
    (('Неаполь ПО B3', 'сатинато'), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    (('Неаполь ПО B3', 'серый'), 'jvhti96pbyqs5s2emi7zsy97qmp2t5lh.jpg'),
    (('Неаполь ПО B3', None), 'jvhti96pbyqs5s2emi7zsy97qmp2t5lh.jpg'),
    
    # Коробки (accessories) - use Elen photo as fallback
    (('Коробка', None), '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'),
    (('Доборный брус', None), '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'),
    
    # Zadoor-S Classic fallback
    (('Zadoor-S', None), 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg'),
    
    # Portika models that may have been missed
    (('Portika', None), 'Классико 12-1 Shellac White.jpg'),
]

def match_photo(name):
    name_lower = name.lower()
    
    for (model_kw, color_kw), filename in EXTRA_MAP:
        if model_kw.lower() in name_lower:
            if color_kw is None:
                return filename
            if color_kw.lower() in name_lower:
                return filename
    return None

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
    SELECT id, name FROM product 
    WHERE (name LIKE '%ZADOOR%' OR name LIKE '%zadoor%' 
       OR name LIKE '%Неаполь%' OR name LIKE '%Венеция%' 
       OR name LIKE '%Турин%' OR name LIKE '%Elen%' 
       OR name LIKE '%SP51%' OR name LIKE '%SP57%' OR name LIKE '%SP64%'
       OR name LIKE '%Classic Baguette%' OR name LIKE '%Коллекция S%'
       OR name LIKE '%Квалитет%' OR name LIKE '%Filomuro%'
       OR name LIKE '%Классико%' OR name LIKE '%Неоклассико%' OR name LIKE '%Порта%')
       AND (image_url IS NULL OR image_url = '')
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

print(f"Updated: {updated}, Skipped: {skipped}, Total remaining: {len(products)}")
