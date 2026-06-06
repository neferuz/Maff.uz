const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Smooth input style
const oldInputClass = /w-full h-10 px-3 border border-slate-100\/70 dark:border-slate-700 text-xs text-\[#2c3b6e\] dark:text-white font-medium focus:outline-none focus:border-\[#2c3b6e\]\/30 focus:shadow-\[0_0_0_3px_rgba\(44,59,110,0\.1\)\] transition-all bg-white dark:bg-\[#0f172a\] rounded-\[16px\]/g;
const newInputClass = 'w-full h-12 px-4 border border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-[13px] text-slate-900 dark:text-white font-medium transition-all duration-300 rounded-2xl outline-none';

content = content.replace(oldInputClass, newInputClass);

// Select style (if any)
const oldSelectClass = /w-full h-10 px-3 border border-slate-100\/70 dark:border-slate-700 text-xs text-\[#2c3b6e\] dark:text-white font-medium focus:outline-none focus:border-\[#2c3b6e\]\/30 focus:shadow-\[0_0_0_3px_rgba\(44,59,110,0\.1\)\] transition-all bg-white dark:bg-\[#0f172a\] rounded-\[16px\] appearance-none cursor-pointer/g;
const newSelectClass = 'w-full h-12 px-4 border border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 text-[13px] text-slate-900 dark:text-white font-medium transition-all duration-300 rounded-2xl outline-none appearance-none cursor-pointer';

content = content.replace(oldSelectClass, newSelectClass);

// Label style
const oldLabelClass = /text-\[9px\] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold/g;
const newLabelClass = 'text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block pl-1';

content = content.replace(oldLabelClass, newLabelClass);

// Compact titles
const oldTitleClass = /text-\[10px\] font-bold uppercase tracking-widest text-\[#2c3b6e\] dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1\.5/g;
const newTitleClass = 'text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4';
content = content.replace(oldTitleClass, newTitleClass);

const mainTitleClass = /text-xl md:text-2xl font-black uppercase tracking-tighter text-\[#2c3b6e\] dark:text-white mb-1 tracking-tight/g;
const newMainTitleClass = 'text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 leading-tight';
content = content.replace(mainTitleClass, newMainTitleClass);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Smoothed inputs and fonts');
