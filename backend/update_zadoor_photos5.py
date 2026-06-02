import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'maff.db')
PHOTO_BASE = '/images/products/zadoor/'

EXTRA_MAP = [
    (('Неаполь SK', None), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Стенд', 'Венеция'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Стенд', 'Неаполь'), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Стекло', 'Венеция'), '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'),
    (('Филенка', 'Венеция'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Стоевая', 'Неаполь'), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
    (('Стоевая', 'Венеция'), 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'),
    (('Стоевая', 'Турин'), '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'),
    (('Стандарт Zadoor', None), '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'),
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
    WHERE (name LIKE '%ZADOOR%' OR name LIKE '%zadoor%' OR name LIKE '%Неаполь%' OR name LIKE '%Венеция%' OR name LIKE '%Турин%' OR name LIKE '%Elen%' OR name LIKE '%SP51%' OR name LIKE '%SP57%' OR name LIKE '%SP64%' OR name LIKE '%Classic Baguette%' OR name LIKE '%Коллекция S%' OR name LIKE '%Квалитет%' OR name LIKE '%Filomuro%' OR name LIKE '%Классико%' OR name LIKE '%Неоклассико%' OR name LIKE '%Порта%')
       AND (image_url IS NULL OR image_url = '')
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
print(f"Updated: {updated}, Remaining: {len(products) - updated}")
