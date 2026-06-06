import re
path = '/Users/apple/Desktop/Maff.uz-main/frontend/src/lib/utils.ts'
with open(path, 'r') as f:
    content = f.read()

# Remove the collections removal block
new_content = re.sub(
    r'// 5\. Remove collections.*?}\n', 
    '', 
    content, 
    flags=re.DOTALL
)

# Actually, I also see "Classic Baguette" might need to be cleaned up if it's too long, but let's keep it.
# Let's write the modified content back
with open(path, 'w') as f:
    f.write(new_content)

print("Updated utils.ts!")
