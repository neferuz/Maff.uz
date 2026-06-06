import shutil
import os

mappings = {
    "image_0_7.jpg": "Классико-12.2 Флекс Эмаль Shellac White",
    "image_0_1.jpg": "Классико-13.1 Флекс Эмаль Shellac White Milling White I",
    "image_0_3.jpg": "Классико-32 ПП Alaska",
    "image_0_6.jpg": "Классико-33 ПП Alaska White Crystal",
    "image_0_4.jpg": "Классико-42 ПП Alaska",
    "image_0_2.jpg": "Классико-43 ПП Alaska White Crystal",
    "image_0_10.jpg": "Классико-42 ПП Nardo Grey",
    "image_0_11.jpg": "Классико-43 ПП Nardo Grey White Сrystal", 
    "image_0_0.jpg": "Классико-42 ЭКО Ice",
    "image_0_5.jpg": "Классико-43 ЭКО Ice Milling White II",
    "image_0_8.jpg": "Классико-82 ПП Alaska",
    "image_0_9.jpg": "Классико-83 ПП Alaska White Сrystal",
}

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил/resources"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors"

sql_queries = []

for img_name, product_name in mappings.items():
    safe_name = product_name.lower().replace(" ", "_").replace(".", "_")
    safe_name = "".join(c for c in safe_name if c.isalnum() or c == "_")
    
    new_filename = f"classico_exact_{safe_name}.jpg"
    
    src_path = os.path.join(base_dir, img_name)
    dst_path = os.path.join(out_dir, new_filename)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
        
        # Replace White Crystal with %White%Crystal% to handle cyrillic 'С' typos in DB
        db_search = product_name.replace("White Crystal", "%White%rystal%").replace("White Сrystal", "%White%rystal%")
        
        db_path = f"/static/uploads/doors/{new_filename}"
        sql = f"UPDATE product SET image_url = '{db_path}' WHERE name ILIKE '{db_search}%' AND category_id IN (SELECT id FROM category WHERE name ILIKE '%Классико%');"
        sql_queries.append(sql)

with open("fix_classico.sql", "w") as f:
    f.write("\n".join(sql_queries))

print("Created SQL script!")
