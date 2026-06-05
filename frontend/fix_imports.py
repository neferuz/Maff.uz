import os
import re

files_to_fix = [
    "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/login/page.tsx",
    "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx",
    "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"
]

for file_path in files_to_fix:
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Remove Header/Footer imports and usage
    content = re.sub(r'import\s+\{\s*Header\s*\}\s+from\s+"@/components/layout/Header";?\n?', '', content)
    content = re.sub(r'import\s+\{\s*Footer\s*\}\s+from\s+"@/components/layout/Footer";?\n?', '', content)
    content = re.sub(r'<\s*Header\s*/?>', '', content)
    content = re.sub(r'<\s*Footer\s*/?>', '', content)
    
    # Replace Button import and component
    content = re.sub(r'import\s+\{\s*Button\s*\}\s+from\s+"@/components/common/Button";?\n?', '', content)
    content = content.replace('<Button ', '<button ')
    content = content.replace('</Button>', '</button>')
    
    # Replace useCart with useShop
    content = re.sub(r'import\s+\{\s*useCart\s*\}\s+from\s+"@/context/CartContext";?\n?', 'import { useShop } from "@/context/shop-context";\n', content)
    content = content.replace('useCart()', 'useShop()')
    
    with open(file_path, 'w') as f:
        f.write(content)
        
print("Fixed imports and tags.")
