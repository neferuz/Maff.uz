import re
import os
import shutil

base_dir = "/Users/apple/Desktop/Maff.uz-main/Двери Дил"
out_dir = "/Users/apple/Desktop/Maff.uz-main/backend/static/uploads/doors/zadoor_extracted"
os.makedirs(out_dir, exist_ok=True)

target_files = [
    "S-Classic.html",
    "Zadoor S.html",
    "Zadoor SP.html",
    "Classic Baguette Стандарт.html",
    "Квалитет Стандарт.html"
]

total_extracted = 0

for file in target_files:
    filepath = os.path.join(base_dir, file)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    div_imgs = re.findall(r"<div id='([^']+)'[^>]*><img src='resources/([^']+)'", content)
    # Deduplicate source images
    unique_images = list(set([src for embed, src in div_imgs]))
    
    clean_prefix = file.replace(".html", "").replace(" ", "_").lower()
    
    for idx, src in enumerate(unique_images):
        src_path = os.path.join(base_dir, "resources", src)
        new_filename = f"{clean_prefix}_{idx+1}.jpg"
        dst_path = os.path.join(out_dir, new_filename)
        
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)
            total_extracted += 1
            print(f"Copied {src} -> {new_filename}")

print(f"Successfully extracted {total_extracted} unique images to: {out_dir}")
