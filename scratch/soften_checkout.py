import re

file_path = "/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Reduce top padding
content = content.replace('pt-20 md:pt-24', 'pt-10 md:pt-14')

# 2. Remove the Payment Method section completely
# Lines 920 to 950 approx. We can use a regex to cut out the block.
# Let's search for {/* Payment Method Selector */} to the end of its div.
payment_pattern = re.compile(r'\{\/\* Payment Method Selector \*\/\}.*?<\/svg>\n\s*<\/div>\n\s*<div className="pt-1">\n.*?<\/p>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>', re.DOTALL)
content = re.sub(payment_pattern, '', content)

# If the regex didn't work (structure is slightly different), we'll do a string replacement.
payment_block = """                {/* Payment Method Selector */}
                <div className="space-y-3 pt-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2c3b6e] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    Способ оплаты
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {/* Cash / COD Option */}
                    <div 
                      className="border border-[#2c3b6e] bg-[#2c3b6e]/[0.02] dark:border-blue-500/30 dark:bg-blue-900/10 p-5 rounded-2xl flex flex-col justify-between h-full relative"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2c3b6e] dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#2c3b6e] dark:bg-white animate-pulse" />
                            Оплата при получении
                          </span>
                          <svg className="w-5 h-5 text-[#2c3b6e] dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="pt-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                            Оплата наличными или через терминал (UzCard/Humo) курьеру при получении заказа. Удобно и безопасно.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>"""

content = content.replace(payment_block, "")

# 3. Soften the design
# Replace border-slate-200 with border-slate-100 to make inputs and cards softer
content = content.replace('border-slate-200', 'border-slate-100/70')
# Add subtle shadow to the main right column order summary
content = content.replace('lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-100 dark:border-slate-800 space-y-4 rounded-3xl', 'lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 border border-slate-100 dark:border-slate-800/50 space-y-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none')

# Soften the left column inputs
content = content.replace('focus:border-[#2c3b6e]', 'focus:border-[#2c3b6e]/30 focus:shadow-[0_0_0_3px_rgba(44,59,110,0.1)]')
content = content.replace('bg-white dark:bg-[#0f172a] rounded-xl', 'bg-white dark:bg-[#0f172a] rounded-[16px]')

# Soften the guest checkout box
content = content.replace('bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 text-left rounded-2xl', 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 text-left rounded-[20px] shadow-[0_4px_20px_rgb(0,0,0,0.02)]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied softer design and removed payment section")
