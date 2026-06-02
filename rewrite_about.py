import re

with open('admin-panel/src/app/about/page.tsx', 'r') as f:
    content = f.read()

# 1. Update inputs: bg-white -> bg-[#f8f9fa], rounded-lg -> rounded-xl
content = content.replace('bg-white border border-[#e3e8ee] rounded-lg', 'bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl')

# 2. Update space-y-1 to space-y-1.5 for label wrappers
content = content.replace('className="space-y-1"', 'className="space-y-1.5"')

# 3. Add icons to labels
# Hero title
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок Hero</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Type className="w-3 h-3 text-[#2c3b6e]" /> Заголовок Hero</label>')
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание Hero</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Layout className="w-3 h-3 text-[#2c3b6e]" /> Описание Hero</label>')

# Mission text
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок миссии</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Type className="w-3 h-3 text-[#2c3b6e]" /> Заголовок миссии</label>')
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание миссии</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Lightbulb className="w-3 h-3 text-[#2c3b6e]" /> Описание миссии</label>')

# Team
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Имя Фамилия</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Users className="w-3 h-3 text-[#2c3b6e]" /> Имя Фамилия</label>')
content = content.replace('<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Должность</label>', 
                          '<label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2"><Award className="w-3 h-3 text-[#2c3b6e]" /> Должность</label>')
content = content.replace('<label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">URL Фотографии</label>', 
                          '<label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-2.5 h-2.5" /> URL Фотографии</label>')


with open('admin-panel/src/app/about/page.tsx', 'w') as f:
    f.write(content)

print("Rewritten.")
