import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we don't duplicate dark classes if already present somewhere
def replace_class(pattern, replacement, text):
    # Only replace if not already followed by dark: variant
    # We will just do a simple replace and then clean up duplicates later if needed
    # Actually, simpler: replace all instances, then fix "dark:bg-slate-900 dark:bg-slate-900"
    pass

# We can just do string replacements safely
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

for old, new in replacements.items():
    # Only replace if not already part of a dark: class
    # Actually, just replace and then we can fix double dark classes
    content = content.replace(old, new)

# Fix duplicated dark variants if they existed
for old, new in replacements.items():
    dark_variant = new.split(' ')[1]
    content = content.replace(f"{new} {dark_variant}", new)
    content = content.replace(f"dark:{old}", "") # remove invalid dark classes if generated
    content = content.replace("dark:bg-white", "") # clean up
    content = content.replace("dark:text-[#2c3b6e]", "")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Added dark mode classes")
