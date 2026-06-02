import re

with open('admin-panel/src/app/about/page.tsx', 'r') as f:
    content = f.read()

# Replace the w-10 h-10 white icon box with w-8 h-8 blue icon box
content = content.replace('w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]', 
                          'w-8 h-8 rounded-lg bg-[#2c3b6e] flex items-center justify-center text-white')
# Adjust the icon sizes inside those boxes from w-5 h-5 to w-4 h-4
# It's tricky to target exactly, but let's try regex for the specific icons
icons_to_resize = ['Users', 'Target', 'Layout', 'Award', 'History', 'BadgePercent', 'Lightbulb']
for icon in icons_to_resize:
    content = content.replace(f'<{icon} className="w-5 h-5" />', f'<{icon} className="w-4 h-4" />')

# Change the text-lg to text-[15px] for section titles
content = content.replace('<h3 className="text-lg font-bold text-[#1a1f36]">', '<h3 className="text-[15px] font-bold text-[#1a1f36]">')

with open('admin-panel/src/app/about/page.tsx', 'w') as f:
    f.write(content)

print("Fixed headers.")
