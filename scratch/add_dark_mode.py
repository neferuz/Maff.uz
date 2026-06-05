import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    'bg-white': 'bg-white dark:bg-[#0f172a]',
    'text-slate-900': 'text-slate-900 dark:text-white',
    'text-[#2c3b6e]': 'text-[#2c3b6e] dark:text-white',
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-800/50',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
    'border-slate-100': 'border-slate-100 dark:border-slate-800',
    'border-slate-200': 'border-slate-200 dark:border-slate-700',
    'text-slate-800': 'text-slate-800 dark:text-slate-200',
    'text-slate-600': 'text-slate-600 dark:text-slate-300',
    'text-slate-500': 'text-slate-500 dark:text-slate-400',
    'text-slate-400': 'text-slate-400 dark:text-slate-500',
}

# Apply replacements with a regex to ensure word boundaries to avoid double replacements
for old, new in replacements.items():
    # Only replace if not already part of the new string
    # We'll just do simple string replacement, then clean up
    content = content.replace(old, new)

# Cleanup any messy duplicates
content = content.replace('bg-white dark:bg-[#0f172a] dark:bg-[#0f172a]', 'bg-white dark:bg-[#0f172a]')
content = content.replace('text-slate-900 dark:text-white dark:text-white', 'text-slate-900 dark:text-white')
content = content.replace('text-[#2c3b6e] dark:text-white dark:text-white', 'text-[#2c3b6e] dark:text-white')

# Ensure we didn't break things like `dark:text-slate-400 dark:text-slate-500`
content = content.replace('dark:text-slate-400 dark:text-slate-500', 'dark:text-slate-400')
content = content.replace('dark:text-slate-500 dark:text-slate-400', 'dark:text-slate-500')
content = content.replace('dark:bg-slate-50 dark:bg-slate-800/50', 'dark:bg-slate-50')
content = content.replace('dark:bg-[#2c3b6e] dark:text-white', 'dark:bg-[#2c3b6e]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added dark mode classes")
