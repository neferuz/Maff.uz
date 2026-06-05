import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove font-sans
content = content.replace(' font-sans', '')

# Fix tracking
content = content.replace('uppercase tracking-normal', 'uppercase tracking-widest font-black')
content = content.replace('tracking-normal', 'tracking-tight')

# Let's also ensure main titles have uppercase tracking-tighter if they are big, or just tracking-tight
content = content.replace('text-lg md:text-xl font-bold', 'text-xl md:text-2xl font-black uppercase tracking-tighter')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed checkout fonts")
