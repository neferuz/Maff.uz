import os
import re

# Fix checkout
checkout_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"
with open(checkout_path, 'r') as f:
    content = f.read()

content = content.replace(
    'const { items, total, removeItem, addItem } = useShop();',
    'const { cart: items, removeFromCart: removeItem, addToCart: addItem } = useShop();\n  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);'
)

with open(checkout_path, 'w') as f:
    f.write(content)

# Fix profile
profile_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"
with open(profile_path, 'r') as f:
    content = f.read()

content = content.replace(
    'const { addItem } = useShop();',
    'const { addToCart: addItem } = useShop();'
)

with open(profile_path, 'w') as f:
    f.write(content)

print("Fixed useShop.")
