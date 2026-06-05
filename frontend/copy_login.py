import os
import re

src_path = "/Users/apple/Desktop/Maff.uz-main/libertywear-main/frontend/src/app/auth/page.tsx"
dest_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx"

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

# Remove Header/Footer imports and usage
content = re.sub(r'import\s+\{\s*Header\s*\}\s+from\s+"@/components/layout/Header";?\n?', '', content)
content = re.sub(r'import\s+\{\s*Footer\s*\}\s+from\s+"@/components/layout/Footer";?\n?', '', content)
content = re.sub(r'<\s*Header\s*/?>', '', content)
content = re.sub(r'<\s*Footer\s*/?>', '', content)

# Replace Button import and component
content = re.sub(r'import\s+\{\s*Button\s*\}\s+from\s+"@/components/common/Button";?\n?', '', content)
content = content.replace('<Button ', '<button ')
content = content.replace('</Button>', '</button>')

with open(dest_path, 'w') as f:
    f.write(content)
    
print("Restored login/page.tsx")
