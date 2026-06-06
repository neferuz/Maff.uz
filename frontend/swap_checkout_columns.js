const fs = require('fs');

const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/checkout/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find where LEFT PANEL and RIGHT PANEL start
const leftPanelIndex = content.indexOf('{/* LEFT PANEL: Order Summary */}');
const rightPanelIndex = content.indexOf('{/* RIGHT PANEL: Checkout Form */}');
const endOfRightPanel = content.indexOf('    </div>\n  );\n}');

if (leftPanelIndex === -1 || rightPanelIndex === -1 || endOfRightPanel === -1) {
    console.error("Could not find panels!");
    process.exit(1);
}

let leftPanel = content.substring(leftPanelIndex, rightPanelIndex);
let rightPanel = content.substring(rightPanelIndex, endOfRightPanel);

// Now adjust the wrapper classes so they fit their new positions.
// OLD LEFT PANEL (Summary) -> moving to RIGHT.
// It was: bg-[#f9fafb] border-r order-2 lg:order-1 flex justify-center lg:justify-end lg:pr-8 xl:pr-10
// It should be: bg-[#f9fafb] order-2 lg:order-2 flex justify-center lg:justify-start lg:pl-8 xl:pl-10
leftPanel = leftPanel.replace('border-r border-slate-200 dark:border-slate-800 order-2 lg:order-1 flex justify-center lg:justify-end', 'order-2 lg:order-2 flex justify-center lg:justify-start');
leftPanel = leftPanel.replace('lg:pr-8 xl:pr-10', 'lg:pl-8 xl:pl-10');

// OLD RIGHT PANEL (Form) -> moving to LEFT.
// It was: bg-white dark:bg-[#0f172a] order-1 lg:order-2 flex justify-center lg:justify-start lg:pl-8 xl:pl-10
// It should be: bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 order-1 lg:order-1 flex justify-center lg:justify-end lg:pr-8 xl:pr-10
rightPanel = rightPanel.replace('order-1 lg:order-2 flex justify-center lg:justify-start', 'border-r border-slate-200 dark:border-slate-800 order-1 lg:order-1 flex justify-center lg:justify-end');
rightPanel = rightPanel.replace('lg:pl-8 xl:pl-10', 'lg:pr-8 xl:pr-10');

// Swap them in the new content
const newContent = content.substring(0, leftPanelIndex) + rightPanel + leftPanel + content.substring(endOfRightPanel);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Swapped columns!');
