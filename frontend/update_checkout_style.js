const fs = require('fs');
const path = require('path');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add decorative background
content = content.replace(
  '<main className="flex-grow pt-10 md:pt-14 pb-16 relative z-10">',
  `<main className="flex-grow pt-10 md:pt-14 pb-16 relative z-10 overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />`
);

// Modify generic container backgrounds
content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl');

// Modify generic borders
content = content.replace(/border-slate-100 dark:border-slate-800\/50/g, 'border-white/50 dark:border-slate-700/50');
content = content.replace(/border-slate-100\/70 dark:border-slate-700/g, 'border-white/60 dark:border-slate-700/50');
content = content.replace(/border-slate-100 dark:border-slate-800/g, 'border-white/60 dark:border-slate-700/50');

// Modify inputs
content = content.replace(/bg-white dark:bg-\[#0f172a\]/g, 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md');

// Remove shadows
content = content.replace(/shadow-\[0_4px_20px_rgb\(0,0,0,0\.02\)\]/g, '');
content = content.replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]/g, '');
content = content.replace(/shadow-sm/g, '');

// Order summary compact styling (p-6 md:p-8 -> p-5 md:p-6)
content = content.replace(/p-6 md:p-8/g, 'p-5 md:p-6');

// Additional adjustments for cards
content = content.replace(/rounded-\[20px\]/g, 'rounded-3xl');
content = content.replace(/rounded-\[16px\]/g, 'rounded-2xl');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated checkout styles');
