import os
import re

src_dir = "/Users/apple/Desktop/Maff.uz-main/libertywear-main/frontend/src/app"
dest_dir = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app"

files_to_copy = [
    ("auth/page.tsx", "login/page.tsx"),
    ("profile/page.tsx", "profile/page.tsx"),
    ("checkout/page.tsx", "checkout/page.tsx")
]

for src, dest in files_to_copy:
    src_path = os.path.join(src_dir, src)
    dest_path = os.path.join(dest_dir, dest)
    
    with open(src_path, 'r') as f:
        content = f.read()
        
    # Replace brand-blue with #2c3b6e
    content = content.replace("brand-blue", "[#2c3b6e]")
    content = content.replace("bg-brand-blue", "bg-[#2c3b6e]")
    content = content.replace("text-brand-blue", "text-[#2c3b6e]")
    content = content.replace("border-brand-blue", "border-[#2c3b6e]")
    
    # Replace /auth with /login
    content = content.replace('"/auth"', '"/login"')
    content = content.replace("'/auth'", "'/login'")
    
    # Replace liberty-wear.uz with maff.uz
    content = content.replace("liberty-wear.uz", "maff.uz")
    content = content.replace("Liberty Wear", "Maff.uz")
    
    with open(dest_path, 'w') as f:
        f.write(content)
        
    print(f"Copied {src} to {dest}")

