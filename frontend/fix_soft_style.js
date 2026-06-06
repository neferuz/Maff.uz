const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Overall layout: Soft background instead of hard split
content = content.replace(
  '<div className="min-h-screen flex flex-col lg:flex-row font-sans">',
  '<div className="min-h-screen bg-slate-50/80 dark:bg-[#0b1120] py-8 md:py-12">\n      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start font-sans">'
);
content = content.replace(
  '      <div className="w-full lg:w-7/12 bg-white dark:bg-[#0f172a] order-2 lg:order-1 flex justify-center lg:justify-end px-4 md:px-8 xl:px-12 py-8 md:py-12">',
  '      {/* LEFT PANEL: Checkout Form */}\n      <div className="w-full lg:w-7/12 order-2 lg:order-1 space-y-6">'
);
// Remove inner max-w-xl
content = content.replace(/<div className="w-full max-w-xl">\n/g, '');
// Since we removed max-w-xl, we must close one less div at the end of the left panel
content = content.replace(/        <\/div>\n      <\/div>\n\n      {\/\* RIGHT PANEL/g, '      </div>\n\n      {/* RIGHT PANEL');

// 2. Right panel background: removing the hard split style
content = content.replace(
  '<div className="w-full lg:w-5/12 bg-[#f4f5f7] dark:bg-slate-900/50 order-1 lg:order-2 flex justify-center lg:justify-start px-4 md:px-8 xl:px-12 py-8 md:py-12 border-l border-slate-200 dark:border-slate-800/50">',
  '<div className="w-full lg:w-5/12 order-1 lg:order-2">'
);
// Remove inner max-w-md
content = content.replace(/<div className="w-full max-w-md lg:sticky lg:top-8 self-start">/g, '<div className="w-full lg:sticky lg:top-8 self-start bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">');
content = content.replace(/        <\/div>\n      <\/div>\n      \n    <\/div>/g, '      </div>\n      \n      </div>\n    </div>');

// 3. Add soft cards to the form sections instead of bare background
content = content.replace(/<div>\n              <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight mb-6">\n                Контактные данные\n              <\/h3>/g, 
  '<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">\n              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-6">\n                Контактные данные\n              </h3>');

content = content.replace(/<div className="pt-8 border-t border-slate-100 dark:border-slate-800">/g, 
  '<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800">');

content = content.replace(/<h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Адрес доставки<\/h3>/g, 
  '<h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Адрес доставки</h3>');

content = content.replace(/<h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">Ваш заказ<\/h3>/g, 
  '<h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Ваш заказ</h3>');

// 4. Soften inputs
content = content.replace(/border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white/g, 
  'border border-slate-200/60 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 bg-white/50');

fs.writeFileSync(filePath, content, 'utf8');
