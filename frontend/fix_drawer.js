const fs = require('fs');
const filePath = '/Users/apple/Desktop/Maff.uz-main/frontend/src/app/profile/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldModalStart = content.indexOf('{/* Order Details Drawer */}');
const oldModalEnd = content.indexOf('{/* Logout Confirmation Modal */}');

if (oldModalStart === -1 || oldModalEnd === -1) {
    console.log("Could not find boundaries");
    process.exit(1);
}

// Since Logout Confirmation Modal comes BEFORE Order Details Drawer in the actual file! Wait, let's verify file structure.
// Actually, earlier view showed:
// 492:       {/* Logout Confirmation Modal */}
// 709:       {/* Order Details Drawer */}
// So Order Details Drawer is at the end. It ends before `</AnimatePresence>\n\n    </div>\n  );\n}`.

const endMatch = content.indexOf('</AnimatePresence>', oldModalStart);
const endOfModal = endMatch + '</AnimatePresence>'.length;

const beforeModal = content.substring(0, oldModalStart);
const afterModal = content.substring(endOfModal);

const newModal = `{/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[10005] cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[90%] max-w-md bg-white dark:bg-[#0b1120] z-[10010] shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 rounded-none font-sans"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-900 dark:text-white" />
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">Заказ {selectedOrder.id}</h2>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-slate-900 dark:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                
                {/* Items */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Товары</h3>
                   <div className="space-y-3">
                     {(selectedOrder.items_list || []).map((item: any, idx: number) => (
                       <div key={idx} className="flex gap-4 items-center">
                          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 shrink-0 relative overflow-hidden flex items-center justify-center rounded-xl border border-slate-100 dark:border-slate-800">
                             {item.image || item.image_url ? (
                               <Image 
                                 src={item.image || item.image_url} 
                                 alt={item.name} 
                                 fill 
                                 className="object-cover"
                                 unoptimized
                               />
                             ) : (
                               <div className="text-[10px] font-black text-slate-300">IMG</div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                             <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                             <p className="text-[11px] text-slate-500 font-medium">
                               {item.quantity} шт. • {item.size || "M"} • {item.color || "Стандарт"}
                             </p>
                          </div>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white shrink-0">{item.price}</p>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Информация о доставке</h3>
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-3">
                       <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                          <span className="text-slate-500 font-bold">Статус</span>
                          <span className={\`font-black px-2.5 py-1 rounded-full \${
                            selectedOrder.status === 'Оплачен' || selectedOrder.status === 'Доставлено' || selectedOrder.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : selectedOrder.status === 'Отправлен'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : selectedOrder.status === 'Отменен' || selectedOrder.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }\`}>{selectedOrder.status}</span>
                       </div>
                      <div className="flex justify-between items-center text-[11px] uppercase tracking-wider">
                         <span className="text-slate-500 font-bold">Способ</span>
                         <span className="text-slate-900 dark:text-white font-black">{selectedOrder.method || "Курьер"}</span>
                      </div>
                      <div className="flex justify-between items-start text-[11px] uppercase tracking-wider gap-4">
                         <span className="text-slate-500 font-bold shrink-0">Адрес</span>
                         <span className="text-slate-900 dark:text-white font-bold text-right normal-case leading-snug">{selectedOrder.address || "Не указан"}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50 dark:bg-[#0b1120]">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Итого</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedOrder.total}</span>
                 </div>
                 <button 
                   onClick={() => handleRepeatOrder(selectedOrder)}
                   disabled={repeatingId === selectedOrder.id}
                   className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 uppercase text-xs tracking-wider font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-70 disabled:scale-100 active:scale-[0.98]"
                 >
                   {repeatingId === selectedOrder.id ? (
                     <div className="w-5 h-5 border-2 border-white/20 dark:border-slate-900/20 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                   ) : (
                     <>Повторить заказ</>
                   )}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>`;

fs.writeFileSync(filePath, beforeModal + newModal + afterModal, 'utf8');
console.log('Fixed drawer styling and position');
