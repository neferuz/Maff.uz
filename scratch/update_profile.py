import re

with open("frontend/src/app/profile/page.tsx", "r") as f:
    content = f.read()

# 1. Backgrounds
content = content.replace('bg-[#f8f9fa]', 'bg-slate-50 dark:bg-slate-950')
content = content.replace('bg-white', 'bg-white dark:bg-slate-900')
content = content.replace('bg-slate-50', 'bg-slate-50 dark:bg-slate-800/50')
content = content.replace('bg-slate-100', 'bg-slate-100 dark:bg-slate-800')
content = content.replace('border-slate-100', 'border-slate-200 dark:border-white/5')
content = content.replace('border-slate-200', 'border-slate-200 dark:border-white/10')
content = content.replace('text-slate-900', 'text-slate-900 dark:text-white')

# 2. Rounded corners and paddings (compact)
content = content.replace('rounded-[2.5rem]', 'rounded-2xl')
content = content.replace('rounded-[2rem]', 'rounded-2xl')
content = content.replace('rounded-full', 'rounded-xl')
content = content.replace('rounded-2xl', 'rounded-xl')
content = content.replace('py-6 lg:py-12', 'py-4 lg:py-8')
content = content.replace('p-8 lg:p-12', 'p-6 lg:p-8')
content = content.replace('p-12 lg:p-20', 'p-8 lg:p-12')
content = content.replace('p-8 lg:p-10', 'p-6 lg:p-8')
content = content.replace('p-6 lg:p-8', 'p-5 lg:p-6')
content = content.replace('h-14', 'h-11')
content = content.replace('h-12', 'h-10')

# 3. Primary buttons and active tabs
content = content.replace('bg-slate-900 dark:bg-white text-white dark:text-[#0f172a]', 'bg-[#2c3b6e] dark:bg-blue-500 text-white')
content = content.replace('bg-slate-900 text-white', 'bg-[#2c3b6e] dark:bg-blue-500 text-white shadow-md shadow-[#2c3b6e]/20')
content = content.replace('hover:bg-[#2c3b6e]', 'hover:bg-[#1a2342] dark:hover:bg-blue-600')

# 4. Inputs
content = re.sub(
    r'w-full h-11.*?bg-slate-50.*?rounded-xl.*?"',
    r'w-full h-10 lg:h-11 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#2c3b6e] dark:focus:border-blue-500 transition-all"',
    content
)

# 5. Fixes for icons that became rounded-xl instead of full
content = content.replace('w-14 h-14 lg:w-24 lg:h-24 bg-[#2c3b6e] dark:bg-blue-500 text-white shadow-md shadow-[#2c3b6e]/20 rounded-xl', 'w-14 h-14 lg:w-24 lg:h-24 bg-[#2c3b6e] dark:bg-blue-500 text-white shadow-md shadow-[#2c3b6e]/20 rounded-full')
content = content.replace('w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-50', 'w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-50')
content = content.replace('w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-50', 'w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-50')
content = content.replace('w-16 h-16 bg-red-50 text-red-500 rounded-xl', 'w-16 h-16 bg-red-50 text-red-500 rounded-full')

with open("frontend/src/app/profile/page.tsx", "w") as f:
    f.write(content)

