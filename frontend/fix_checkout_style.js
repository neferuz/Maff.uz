const fs = require('fs');
const path = require('path');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove decorative elements
content = content.replace(
  /<main className="flex-grow pt-10 md:pt-14 pb-16 relative z-10 overflow-hidden">[\s\S]*?<div className="absolute bottom-\[-10%\] right-\[-10%\] w-\[40%\] h-\[40%\] bg-emerald-400\/10 rounded-full blur-\[120px\] pointer-events-none" \/>/m,
  '<main className="flex-grow pt-10 md:pt-14 pb-16 relative z-10">'
);

// Fix inputs - make them distinct again so they are visible
content = content.replace(/bg-white\/50 dark:bg-slate-900\/50 backdrop-blur-md/g, 'bg-white dark:bg-[#0f172a]');

// Fix generic container backgrounds - maybe bg-white/40 is too transparent. 
// Let's use bg-white/60 or just clean glass
content = content.replace(/bg-white\/40 dark:bg-slate-900\/40 backdrop-blur-2xl/g, 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-3xl');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed checkout styles');
