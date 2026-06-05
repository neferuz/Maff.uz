import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix rounding
content = content.replace('rounded-none', 'rounded-2xl')
# Some inputs don't have rounded classes at all, let's inject rounded-xl into inputs
content = re.sub(r'className="([^"]*w-full h-10 px-3 border border-slate-200[^"]*)"', r'className="\1 rounded-xl"', content)
# Make order summary sticky block rounded
content = content.replace('bg-slate-50 p-6 md:p-8', 'bg-slate-50 p-6 md:p-8 rounded-3xl')
content = content.replace('bg-slate-50 p-4 border', 'bg-slate-50 p-4 border rounded-2xl')
content = content.replace('bg-slate-50 border border-slate-100 p-5 text-left', 'bg-slate-50 border border-slate-100 p-5 text-left rounded-2xl')

# 2. Fix buttons
content = content.replace('px-6 h-10 bg-[#2c3b6e]', 'px-6 h-10 bg-[#2c3b6e] rounded-xl')
content = content.replace('h-8 px-4 bg-[#2c3b6e]', 'h-8 px-4 bg-[#2c3b6e] rounded-xl')
content = content.replace('w-full h-14 bg-[#2c3b6e]', 'w-full h-14 bg-[#2c3b6e] rounded-xl')

# 3. Add Dark Mode classes (similar to profile)
replacements = {
    'bg-white': 'bg-white dark:bg-[#0f172a]',
    'text-slate-900': 'text-slate-900 dark:text-white',
    'text-[#2c3b6e]': 'text-[#2c3b6e] dark:text-white',
    'text-[#1a1f36]': 'text-[#1a1f36] dark:text-white',
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-800/50',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
    'border-slate-100': 'border-slate-100 dark:border-slate-800',
    'border-slate-200': 'border-slate-200 dark:border-slate-700',
    'text-slate-800': 'text-slate-800 dark:text-slate-200',
    'text-slate-600': 'text-slate-600 dark:text-slate-300',
    'text-slate-500': 'text-slate-500 dark:text-slate-400',
    'text-slate-400': 'text-slate-400 dark:text-slate-500',
    'text-[#4f566b]': 'text-[#4f566b] dark:text-slate-400',
    'bg-[#2c3b6e]/5': 'bg-[#2c3b6e]/5 dark:bg-blue-900/20',
    'border-[#2c3b6e]/10': 'border-[#2c3b6e]/10 dark:border-blue-500/20',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# 4. Cleanup any messy duplicates
content = content.replace('bg-white dark:bg-[#0f172a] dark:bg-[#0f172a]', 'bg-white dark:bg-[#0f172a]')
content = content.replace('text-slate-900 dark:text-white dark:text-white', 'text-slate-900 dark:text-white')
content = content.replace('text-[#2c3b6e] dark:text-white dark:text-white', 'text-[#2c3b6e] dark:text-white')
content = content.replace('text-[#1a1f36] dark:text-white dark:text-white', 'text-[#1a1f36] dark:text-white')
content = content.replace('bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50', 'bg-slate-50 dark:bg-slate-800/50')
content = content.replace('dark:bg-white', '') 
content = content.replace('dark:text-[#2c3b6e]', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Styled checkout page")
