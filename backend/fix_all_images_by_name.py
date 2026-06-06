import sqlite3
import json
import os

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, str):
        return "'" + val.replace("'", "''") + "'"
    return str(val)

def main():
    sqlite_conn = sqlite3.connect('maff.db')
    cursor = sqlite_conn.cursor()
    
    cursor.execute('SELECT name, image_url, images FROM product WHERE image_url IS NOT NULL OR images IS NOT NULL')
    rows = cursor.fetchall()
    
    with open('update_images_by_name.sql', 'w') as f:
        f.write('BEGIN;\n')
        for row in rows:
            name, image_url, images_str = row
            
            try:
                images_json = json.dumps(json.loads(images_str)) if images_str else None
            except:
                images_json = None
                
            name_val = escape_sql(name)
            img_val = escape_sql(image_url)
            json_val = escape_sql(images_json)
            if json_val != 'NULL':
                json_val += '::json'
                
            f.write(f'UPDATE product SET image_url = {img_val}, images = {json_val} WHERE name = {name_val};\n')
        f.write('COMMIT;\n')
        
    print(f'Generated update_images_by_name.sql for {len(rows)} products.')

main()
