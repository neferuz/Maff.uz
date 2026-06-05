import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# find what properties of 'order' are used
props = set(re.findall(r'order\.([a-zA-Z0-9_]+)', content))
print("Props used in order:", props)

