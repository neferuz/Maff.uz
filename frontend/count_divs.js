const fs = require('fs');
const content = fs.readFileSync('/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx', 'utf8');

const returnContent = content.substring(content.lastIndexOf('  return (\n    <div className="min-h-screen'));
const openDivs = (returnContent.match(/<div(\s|>)/g) || []).length;
const closeDivs = (returnContent.match(/<\/div>/g) || []).length;
console.log(`Open divs: ${openDivs}, Close divs: ${closeDivs}`);

const openForms = (returnContent.match(/<form(\s|>)/g) || []).length;
const closeForms = (returnContent.match(/<\/form>/g) || []).length;
console.log(`Open forms: ${openForms}, Close forms: ${closeForms}`);

const openButtons = (returnContent.match(/<button(\s|>)/g) || []).length;
const closeButtons = (returnContent.match(/<\/button>/g) || []).length;
console.log(`Open buttons: ${openButtons}, Close buttons: ${closeButtons}`);
