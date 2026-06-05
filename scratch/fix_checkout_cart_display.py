import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix mobile cart display
# Replace `>{item.price}</span>` with `>{typeof item.price === 'number' ? item.price.toLocaleString() + ' сум' : item.price}</span>`
content = content.replace('>{item.price}</span>', '>{typeof item.price === \'number\' ? item.price.toLocaleString() + \' сум\' : item.price}</span>')

# Prevent duplicate title from item.category
content = content.replace(
    '<span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.category}</span>',
    '{item.category && item.category !== item.name && (<span className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.category}</span>)}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed cart display")
