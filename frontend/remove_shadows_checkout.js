const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The user just wants shadows removed. Let's globally replace shadow classes.
content = content.replace(/shadow-sm/g, '');
content = content.replace(/shadow-md shadow-blue-500\/20/g, '');
content = content.replace(/shadow-md/g, '');
content = content.replace(/shadow-lg/g, '');
content = content.replace(/shadow-xl/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Shadows removed');
