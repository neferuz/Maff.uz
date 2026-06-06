const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the Order Details Drawer
const oldDrawerStart = `      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-[#2c3b6e]/40 backdrop-blur-sm z-[9990] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.95 }}
              animate={{ opacity: 1, y: "-50%", x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-md max-h-[85vh] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md z-[9999] shadow-none flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >`;

const newDrawerStart = `      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-[#2c3b6e]/60 backdrop-blur-md z-[10005] cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[90%] max-w-md bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md z-[10010] shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 rounded-none font-sans"
            >`;

content = content.replace(oldDrawerStart, newDrawerStart);

// Let's also update the "Right Drawer: Payment Selector" z-index to be above the header (header is 9999)
content = content.replace('z-[9990] cursor-pointer"', 'z-[10005] cursor-pointer"');
content = content.replace('z-[9999] shadow-none flex flex-col', 'z-[10010] shadow-none flex flex-col');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed profile drawer z-index and position');
