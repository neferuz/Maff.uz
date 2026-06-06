const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix all titles (h3) to the requested bold font
const newTitleClass = 'text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-4 pb-3 border-b border-slate-100 dark:border-slate-800';
content = content.replace(/<h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">/g, 
  '<h3 className="' + newTitleClass + '">');
content = content.replace(/<h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">/g, 
  '<h3 className="' + newTitleClass + '">'); // in case any got partially replaced

// 2. Adjust widths: make right side even more compact (lg:w-1/3 instead of lg:w-2/5)
content = content.replace(/w-full lg:w-3\/5 space-y-6 order-1/g, 'w-full lg:w-7/12 space-y-4 order-1');
content = content.replace(/w-full lg:w-2\/5 order-2 lg:sticky lg:top-6/g, 'w-full lg:w-5/12 order-2 lg:sticky lg:top-8');

// 3. Make the cards more compact inside
content = content.replace(/p-5 md:p-6/g, 'p-4 md:p-5');

// 4. Make products list in the right panel MUCH more compact
content = content.replace(/w-20 h-20 bg-slate-100/g, 'w-14 h-14 bg-slate-100'); // image size
content = content.replace(/flex-grow min-w-0 flex flex-col h-20/g, 'flex-grow min-w-0 flex flex-col justify-center');
content = content.replace(/text-sm line-clamp-2 leading-snug/g, 'text-xs line-clamp-2 leading-tight');
content = content.replace(/text-\[12px\] text-slate-500 mt-1 space-x-2/g, 'text-[10px] text-slate-500 mt-0.5 space-x-2');
content = content.replace(/text-sm font-semibold/g, 'text-xs font-bold');

// 5. Submit button in the right panel
content = content.replace(/h-11 bg-slate-900/g, 'h-10 bg-slate-900');
content = content.replace(/text-\[13px\] flex/g, 'text-xs uppercase tracking-wider font-bold flex');

// 6. Make input labels slightly more compact
content = content.replace(/text-xs font-bold uppercase tracking-wider text-slate-500/g, 'text-[10px] font-bold uppercase tracking-widest text-slate-500');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed h3 titles and made right side ultra-compact');
