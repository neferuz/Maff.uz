import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the duplicate dark mode backgrounds
content = content.replace('dark:bg-slate-800/50/50', 'dark:bg-slate-800/50')

# Apply rounding
content = content.replace(
    'className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800 space-y-4"',
    'className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800 space-y-4 rounded-3xl"'
)
content = content.replace(
    'className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800"',
    'className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl"'
)
content = content.replace(
    'className="bg-[#2c3b6e]/5 dark:bg-blue-900/20 p-4 flex justify-between items-center border border-[#2c3b6e]/10 dark:border-blue-500/20"',
    'className="bg-[#2c3b6e]/5 dark:bg-blue-900/20 p-4 flex justify-between items-center border border-[#2c3b6e]/10 dark:border-blue-500/20 rounded-2xl"'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed checkout rounding")
