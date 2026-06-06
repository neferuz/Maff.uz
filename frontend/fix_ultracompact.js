const fs = require('fs');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Make panels more compact horizontally and vertically
content = content.replace(/py-6 lg:py-10 lg:pr-10 xl:pr-12/g, 'pt-6 pb-10 lg:pt-8 lg:pb-12 lg:pr-8 xl:pr-10');
content = content.replace(/py-6 lg:py-10 lg:pl-10 xl:pl-12/g, 'pt-6 pb-10 lg:pt-8 lg:pb-12 lg:pl-8 xl:pl-10');

// Reduce vertical gaps
content = content.replace(/space-y-6/g, 'space-y-4');
content = content.replace(/space-y-8/g, 'space-y-5');

// Make inputs smaller
content = content.replace(/h-11/g, 'h-9');
content = content.replace(/text-sm/g, 'text-[11px]');

// Item cards padding
content = content.replace(/p-4 bg-white/g, 'p-2.5 bg-white');

// Item title
content = content.replace(/text-sm truncate/g, 'text-xs truncate');

// Remove any remaining shadow
content = content.replace(/shadow-sm/g, '');

// Submit button size
content = content.replace(/h-14/g, 'h-11');
content = content.replace(/text-base/g, 'text-[13px]');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Made checkout ultra compact');
