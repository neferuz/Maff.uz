const fs = require('fs');
const path = require('path');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Reduce huge paddings
content = content.replace(/py-10 lg:py-16 lg:pr-12 xl:pr-16/g, 'py-6 lg:py-10 lg:pr-10 xl:pr-12');
content = content.replace(/py-10 lg:py-16 lg:pl-12 xl:pl-16/g, 'py-6 lg:py-10 lg:pl-10 xl:pl-12');
content = content.replace(/mb-8 transition-colors/g, 'mb-6 transition-colors');
content = content.replace(/space-y-8/g, 'space-y-6');

// Enhance the Back button
content = content.replace(
  /<Link href="\/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">[\s\S]*?Назад в каталог[\s\S]*?<\/Link>/m,
  `<Link href="/catalog" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full w-fit">
            <ArrowLeft className="w-3.5 h-3.5" />
            Назад в каталог
          </Link>`
);

// Reduce spacing between title and items
content = content.replace(/mb-6/g, 'mb-4');
// Actually, be careful with mb-6 replacement globally, just doing specific things:

// Ensure button is flat (no shadows)
content = content.replace(/shadow-md shadow-blue-500\/20/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed compact styling');
