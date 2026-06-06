const fs = require('fs');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Make padding more compact on the cards
content = content.replace(/p-6 md:p-8/g, 'p-5 md:p-6');
content = content.replace(/mb-6 pb-4/g, 'mb-4 pb-3');

// 2. Add blurred shadows to cards
content = content.replace(/shadow-sm/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.01)]');

// 3. Make titles use the user's preferred class
const oldTitleClass1 = 'text-lg md:text-xl font-medium text-slate-900 dark:text-white';
const oldTitleClass2 = 'text-lg md:text-xl font-medium text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800';
const newTitleClass = 'text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight';

content = content.replace(/<h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">/g, 
  '<h3 className="' + newTitleClass + ' mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">');
  
content = content.replace(/<h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white">/g, 
  '<h3 className="' + newTitleClass + '">');

// 4. Reduce input heights slightly to be more compact
content = content.replace(/h-12 md:h-14/g, 'h-11 md:h-12');

// 5. Make the labels slightly bolder
content = content.replace(/text-sm text-slate-700/g, 'text-xs font-bold uppercase tracking-wider text-slate-500');

// 6. Fix any overlapping spacing from old replacements
// (just in case)

fs.writeFileSync(filePath, content, 'utf8');
console.log('Tweaked checkout UI to match requested bold titles and compact blurred shadow style');
