"use client";
import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";



const statusConfig = {
  Paid: { label: "Оплачен", icon: CheckCircle2, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  Pending: { label: "Ожидание", icon: Clock, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  Shipped: { label: "Отправлен", icon: Truck, color: "text-[#2c3b6e]", bg: "bg-[#2c3b6e]/10" },
  Cancelled: { label: "Отменен", icon: XCircle, color: "text-[#cd5c5c]", bg: "bg-[#cd5c5c]/10" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("maff_admin_token") || localStorage.getItem("admin_token") || "";
      const res = await fetch("/api/v1/orders", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((o: any) => ({
          id: o.id,
          display_id: `ORD-${o.id}`,
          customer: o.full_name || "—",
          phone: o.phone || "—",
          address: o.address || "—",
          comments: o.comments || "",
          date: new Date(o.created_at).toLocaleString('ru-RU'),
          total: o.total_amount.toLocaleString() + " сум",
          raw_total: o.total_amount,
          status: o.status === 'processed' ? 'Paid' : 'Pending',
          raw_status: o.status,
          items: o.items.length,
          method: o.payment_method === 'cod' ? 'При получении' : o.payment_method,
          raw_items: o.items
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const token = localStorage.getItem("maff_admin_token") || localStorage.getItem("admin_token") || "";
      await fetch(`/api/v1/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  const [activeTab, setActiveTab] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const itemsPerPage = 10;

  const tabs = ["Все", "Ожидание", "Оплаченные", "Отправленные", "Отмененные"];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.display_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Все") return matchesSearch;
    if (activeTab === "Ожидание") return matchesSearch && order.status === "Pending";
    if (activeTab === "Оплаченные") return matchesSearch && order.status === "Paid";
    if (activeTab === "Отправленные") return matchesSearch && order.status === "Shipped";
    if (activeTab === "Отмененные") return matchesSearch && order.status === "Cancelled";
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder]);

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Заказы</h1>
            <p className="text-[14px] text-[#4f566b]">Управление заказами вашего магазина в реальном времени.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all no-shadow">
              <Download className="w-3.5 h-3.5" />
              Экспорт
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all no-shadow">
              <Plus className="w-3.5 h-3.5" />
              Новый заказ
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee]">
          <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                  activeTab === tab ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]"
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Поиск по ID или имени..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all w-64 no-shadow"
                />
             </div>
             <button className="p-1.5 border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all no-shadow">
                <Filter className="w-4 h-4 text-[#4f566b]" />
             </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden no-shadow">
          {paginatedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Заказ</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Клиент</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Товары</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Сумма</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e8ee]">
                  {paginatedOrders.map((order, idx) => {
                    const status = statusConfig[order.status as keyof typeof statusConfig];
                    return (
                      <motion.tr 
                        key={order.display_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedOrder(order)}
                        className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-[#f7f8f9] rounded-lg group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] transition-all">
                                <Package className="w-4 h-4 text-[#2c3b6e]" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{order.display_id}</span>
                                <span className="text-[10px] text-[#4f566b] font-medium">{order.method}</span>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            status.bg, status.color
                          )}>
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[13px] font-semibold text-[#4f566b] group-hover:text-[#1a1f36] transition-colors">{order.customer}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[12px] font-medium text-[#4f566b]">{order.items} {order.items === 1 ? 'товар' : order.items < 5 ? 'товара' : 'товаров'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[14px] font-bold text-[#1a1f36]">{order.total}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[12px] font-medium text-[#4f566b]">{order.date}</span>
                            <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="w-16 h-16 bg-[#f7f8f9] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#e3e8ee]" />
               </div>
               <h3 className="text-[16px] font-bold text-[#1a1f36] mb-1">Ничего не найдено</h3>
               <p className="text-[13px] text-[#4f566b]">По вашему запросу «{searchQuery}» заказов не найдено.</p>
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 border-t border-[#e3e8ee] bg-[#f7f8f9]/30 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-[12px] text-[#4f566b] font-medium">
                 Показано {startIndex + 1}—{Math.min(startIndex + itemsPerPage, filteredOrders.length)} из {filteredOrders.length} заказов
               </p>
               <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                    }}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all disabled:opacity-50 no-shadow"
                  >
                    Назад
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPage(page);
                      }}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center border rounded text-[12px] font-bold transition-all",
                        currentPage === page 
                          ? "bg-[#2c3b6e] border-[#2c3b6e] text-white" 
                          : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all disabled:opacity-50 no-shadow"
                  >
                    Вперед
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Drawer - Moved out of animated container */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
            />
            
            {/* Drawer Content */}
            <motion.div 
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e3e8ee] z-[10000] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">Детали заказа</h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">{selectedOrder.display_id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-[#4f566b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Badge Large */}
                <div className="flex flex-col items-center py-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                     statusConfig[selectedOrder.status as keyof typeof statusConfig].bg
                   )}>
                     {(() => {
                       const Icon = statusConfig[selectedOrder.status as keyof typeof statusConfig].icon;
                       return <Icon className={cn("w-6 h-6", statusConfig[selectedOrder.status as keyof typeof statusConfig].color)} />;
                     })()}
                   </div>
                   <span className={cn("text-[13px] font-bold uppercase tracking-widest", statusConfig[selectedOrder.status as keyof typeof statusConfig].color)}>
                     {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                   </span>
                   <p className="text-[11px] text-[#4f566b] mt-1">{selectedOrder.date}</p>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider">Клиент</h3>
                  <div className="p-4 border border-[#e3e8ee] rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#2c3b6e] rounded-full flex items-center justify-center text-white font-bold text-[13px]">
                          {selectedOrder.customer.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <p className="text-[14px] font-bold text-[#1a1f36]">{selectedOrder.customer}</p>
                          <p className="text-[11px] text-[#4f566b]">Премиум клиент</p>
                       </div>
                    </div>
                    <button className="p-2 hover:bg-[#f7f8f9] rounded-lg text-[#2c3b6e] transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4 pb-8">
                   <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider">Оплата</h3>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#4f566b] font-medium">Метод</span>
                         <span className="text-[#1a1f36] font-bold">{selectedOrder.method}</span>
                      </div>

                      <div className="pt-3 border-t border-[#e3e8ee] flex justify-between items-center">
                         <span className="text-[14px] font-bold text-[#1a1f36]">Итого</span>
                         <span className="text-[18px] font-black text-[#2c3b6e]">{selectedOrder.total}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="px-6 py-4 border-t border-[#e3e8ee]">
                <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-3">Список товаров</h3>
                <div className="space-y-3">
                  {selectedOrder.raw_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-[12px] bg-[#f7f8f9] p-2 rounded-lg border border-[#e3e8ee]">
                      <div className="flex flex-col max-w-[70%]">
                         <span className="font-bold text-[#1a1f36] truncate">{item.product_name}</span>
                         <span className="text-[#4f566b] text-[10px]">
                           {item.size ? `Размер: ${item.size} ` : ''} 
                           {item.color ? `Цвет: ${item.color}` : ''}
                         </span>
                      </div>
                      <div className="text-right">
                         <span className="font-bold text-[#2c3b6e] block">{item.price.toLocaleString()} сум</span>
                         <span className="text-[#4f566b] text-[10px]">Кол-во: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e3e8ee]">
                <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">Адрес доставки и Контакты</h3>
                <p className="text-[12px] text-[#4f566b] mb-1"><strong>Тел:</strong> {selectedOrder.phone}</p>
                <p className="text-[12px] text-[#4f566b] mb-1"><strong>Адрес:</strong> {selectedOrder.address}</p>
                {selectedOrder.comments && <p className="text-[12px] text-[#4f566b]"><strong>Комментарий:</strong> {selectedOrder.comments}</p>}
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 grid grid-cols-2 gap-3 sticky bottom-0">
                 {selectedOrder.raw_status === 'pending' ? (
                   <button onClick={() => updateStatus(selectedOrder.id, 'processed')} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10b981] rounded-xl text-[13px] font-bold text-white hover:bg-[#059669] transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                      Отметить как Обработан
                   </button>
                 ) : (
                   <button onClick={() => updateStatus(selectedOrder.id, 'pending')} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all no-shadow">
                      <Clock className="w-4 h-4" />
                      Вернуть в Ожидание
                   </button>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
