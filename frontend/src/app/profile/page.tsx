"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/shop-context";
import { 
  User, 
  Package, 
  MapPin, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Plus,
  Box,
  Truck,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "orders" | "addresses" | "requests" | "settings";

export default function ProfilePage() {
  const { user, logout } = useShop();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Real Data State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // Form State for new/edit address
  const [addressName, setAddressName] = useState("");
  const [addressValue, setAddressValue] = useState("");

  // Protection: Redirect if not logged in
  useEffect(() => {
    if (!user?.isLoggedIn) {
      router.push("/login");
    } else {
      fetchAddresses();
    }
  }, [user, router]);

  const fetchAddresses = async () => {
    const token = localStorage.getItem("maff_token");
    if (!token) return;
    try {
      const response = await fetch("/api/v1/addresses/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem("maff_token");
    if (!token || !addressValue) return;

    const method = editingAddress?.id ? "PUT" : "POST";
    const url = editingAddress?.id 
      ? `/api/v1/addresses/${editingAddress.id}`
      : "/api/v1/addresses/";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addressName,
          address: addressValue
        })
      });
      if (response.ok) {
        fetchAddresses();
        setEditingAddress(null);
        setIsAddingAddress(false);
        setAddressName("");
        setAddressValue("");
      }
    } catch (err) {
      console.error("Failed to save address", err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    const token = localStorage.getItem("maff_token");
    if (!token) return;
    try {
      const response = await fetch(`/api/v1/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAddresses();
        setEditingAddress(null);
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  if (!user?.isLoggedIn) return null;

  const orders: any[] = []; 
  const requests: any[] = []; 

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 relative">
      {/* ── Modals Overlay ── */}
      {(selectedOrder || selectedRequest || editingAddress || isAddingAddress || showLogoutConfirm) && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-500 ease-out"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrder(null);
              setSelectedRequest(null);
              setEditingAddress(null);
              setIsAddingAddress(false);
              setShowLogoutConfirm(false);
            }
          }}
        >
           
           {/* Logout Confirmation Modal */}
           {showLogoutConfirm && (
             <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                   <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Выйти из профиля?</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
                   Вы сможете войти снова, используя свои данные в любое время.
                </p>
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleLogout}
                     className="w-full h-12 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
                   >
                      Да, выйти
                   </button>
                   <button 
                     onClick={() => setShowLogoutConfirm(false)}
                     className="w-full h-12 border border-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                   >
                      Отмена
                   </button>
                </div>
             </div>
           )}

           {/* Order Detail Modal */}
           {selectedOrder && (
             <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 lg:p-12 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-2xl overflow-y-auto max-h-[90vh]">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 lg:top-8 lg:right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90">
                   <Plus className="w-5 h-5 rotate-45" />
                </button>
                <div className="text-[10px] font-black text-[#2c3b6e] uppercase tracking-[0.3em] mb-4">Детали заказа</div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">{selectedOrder.id}</h2>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-50">
                      <div>
                         <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Дата заказа</div>
                         <div className="text-xs font-bold text-slate-900">{selectedOrder.date}</div>
                      </div>
                      <div>
                         <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Статус</div>
                         <div className="text-xs font-bold text-[#2c3b6e] uppercase">{selectedOrder.status === 'delivered' ? 'Доставлено' : 'В обработке'}</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Товары в заказе:</div>
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-700 leading-tight mb-1">{item.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.qty}</span>
                           </div>
                           <div className="text-[11px] font-black text-slate-900 whitespace-nowrap">{item.price}</div>
                        </div>
                      ))}
                   </div>

                   <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Итоговая стоимость</div>
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">{selectedOrder.total}</div>
                      </div>
                      <button className="w-full sm:w-auto h-12 px-8 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] transition-all">
                         Повторить заказ
                      </button>
                   </div>
                </div>
             </div>
           )}

           {/* Request Detail Modal */}
           {selectedRequest && (
             <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 lg:p-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-2xl">
                <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 lg:top-8 lg:right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90">
                   <Plus className="w-5 h-5 rotate-45" />
                </button>
                <div className="text-[10px] font-black text-[#2c3b6e] uppercase tracking-[0.3em] mb-4">Информация о заявке</div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">Заявка на {selectedRequest.type}</h2>
                
                <div className="space-y-8">
                   <div className="flex items-start gap-4 p-4 lg:p-5 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Назначенное время</div>
                         <div className="text-xs lg:text-sm font-bold text-slate-900">{selectedRequest.date} в {selectedRequest.time}</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                      <div className="space-y-1">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Адрес</div>
                         <div className="text-[11px] font-bold text-slate-900">{selectedRequest.address}</div>
                      </div>
                      <div className="space-y-1">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Специалист</div>
                         <div className="text-[11px] font-bold text-slate-900">{selectedRequest.technician}</div>
                      </div>
                   </div>

                   <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                         <CheckCircle2 className="w-4 h-4 text-[#2c3b6e]" />
                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Текущий статус</span>
                      </div>
                      <p className="text-[11px] font-bold text-[#2c3b6e] uppercase leading-none pl-7">{selectedRequest.status === 'confirmed' ? 'Подтверждено' : 'Выполнено'}</p>
                   </div>
                </div>
             </div>
           )}

            {/* Edit/Add Address Modal */}
            {(editingAddress || isAddingAddress) && (
              <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 lg:p-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative shadow-2xl">
                 <button onClick={() => { setEditingAddress(null); setIsAddingAddress(false); }} className="absolute top-6 right-6 lg:top-8 lg:right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90">
                    <Plus className="w-5 h-5 rotate-45" />
                 </button>
                 <div className="text-[10px] font-black text-[#2c3b6e] uppercase tracking-[0.3em] mb-4">Настройки адреса</div>
                 <h2 className="text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">{editingAddress ? "Изменить адрес" : "Добавить новый адрес"}</h2>
                 
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Название (напр. Дом)</label>
                       <input 
                         type="text" 
                         value={addressName}
                         onChange={(e) => setAddressName(e.target.value)}
                         placeholder="Дом / Работа"
                         className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#2c3b6e]/20" 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Полный адрес</label>
                       <textarea 
                         value={addressValue}
                         onChange={(e) => setAddressValue(e.target.value)}
                         placeholder="г. Ташкент, ул. ..."
                         className="w-full h-32 bg-slate-50 rounded-2xl p-6 text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#2c3b6e]/20 resize-none" 
                       />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                       <button 
                         onClick={handleSaveAddress}
                         className="flex-grow h-14 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] transition-all"
                       >
                          Сохранить адрес
                       </button>
                       {editingAddress && (
                         <button 
                           onClick={() => handleDeleteAddress(editingAddress.id)}
                           className="h-14 px-8 border border-slate-200 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all"
                         >
                            Удалить
                         </button>
                       )}
                    </div>
                 </div>
              </div>
            )}

        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-12">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
            <div className="flex items-center w-full lg:w-auto gap-4">
               <div className="w-14 h-14 lg:w-24 lg:h-24 bg-slate-900 rounded-full flex items-center justify-center text-white text-xl lg:text-3xl font-black uppercase flex-shrink-0">
                 {user.name.slice(0, 2)}
               </div>
               <div className="flex-grow lg:text-left">
                 <h1 className="text-xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter mb-0.5">
                   Личный кабинет
                 </h1>
                 <p className="text-[8px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   {user.email} <span className="mx-1 lg:mx-2 text-slate-200">/</span> ID: {user.id || 'N/A'}
                 </p>
               </div>
               <button 
                 onClick={() => setShowLogoutConfirm(true)}
                 className="lg:hidden w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500"
               >
                 <LogOut className="w-4 h-4" />
               </button>
            </div>
            
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="hidden lg:flex px-6 py-3 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Sidebar Navigation - Mobile scrollable */}
          <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
            {[
              { id: "orders", label: "Заказы", icon: Package },
              { id: "requests", label: "Заявки", icon: FileText },
              { id: "addresses", label: "Адреса", icon: MapPin },
              { id: "settings", label: "Профиль", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 lg:gap-4 px-5 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === item.id 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                    : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                )}
              >
                <item.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            {activeTab === "orders" && (
              <div className="space-y-3 lg:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-base lg:text-lg font-black text-slate-900 uppercase tracking-tight tracking-widest">Ваши заказы</h3>
                  <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-widest">Всего: {orders.length}</span>
                </div>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-12 lg:p-20 border border-slate-100 text-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                      <Box className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm lg:text-base font-black text-slate-900 uppercase tracking-widest mb-2">Заказов пока нет</h3>
                    <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto mb-8">
                      Ваша история покупок пуста. Самое время выбрать что-нибудь для вашего интерьера!
                    </p>
                    <button 
                      onClick={() => router.push('/catalog')}
                      className="h-12 px-8 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] transition-all"
                    >
                      В каталог
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <button 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="w-full bg-white rounded-2xl lg:rounded-[2rem] p-5 lg:p-8 border border-slate-100 hover:border-[#2c3b6e] transition-all group text-left"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                        <div className="flex items-center gap-4 lg:gap-6">
                           <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <Box className="w-5 h-5 lg:w-6 lg:h-6" />
                           </div>
                           <div>
                              <div className="text-[11px] lg:text-xs font-black text-slate-900 uppercase mb-0.5">{order.id}</div>
                              <div className="flex items-center gap-2 text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                 <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                                 {order.date}
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 lg:gap-12">
                           <div className="text-left md:text-right">
                              <div className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase mb-0.5">Сумма</div>
                              <div className="text-xs lg:text-sm font-black text-slate-900 tracking-tight">{order.total}</div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className={cn(
                                "px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-widest",
                                order.status === "delivered" ? "bg-green-50 text-green-600" : "bg-blue-50 text-[#2c3b6e]"
                              )}>
                                 {order.status === "delivered" ? "Доставлено" : "В обработке"}
                              </span>
                              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                 <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                              </div>
                           </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-3 lg:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-base lg:text-lg font-black text-slate-900 uppercase tracking-tight tracking-widest">Сервисные заявки</h3>
                  <button className="flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-[10px] font-black text-[#2c3b6e] uppercase tracking-widest hover:translate-x-1 transition-transform">
                     Новая
                     <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </button>
                </div>
                {requests.length === 0 ? (
                  <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-12 lg:p-20 border border-slate-100 text-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2c3b6e]">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm lg:text-base font-black text-slate-900 uppercase tracking-widest mb-2">Заявок пока нет</h3>
                    <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto">
                      Вы еще не оставляли заявок на замер или консультацию. 
                    </p>
                  </div>
                ) : (
                  requests.map((req, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedRequest(req)}
                      className="w-full bg-white rounded-2xl lg:rounded-[2rem] p-5 lg:p-8 border border-slate-100 flex items-center justify-between group hover:border-[#2c3b6e] transition-all text-left"
                    >
                      <div className="flex items-center gap-4 lg:gap-6">
                         <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-50 flex items-center justify-center text-[#2c3b6e]">
                            <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
                         </div>
                         <div>
                            <div className="text-[11px] lg:text-xs font-black text-slate-900 uppercase mb-0.5">{req.type}</div>
                            <div className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tight">{req.address}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 lg:gap-10">
                         <div className="hidden sm:block text-right">
                            <div className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase mb-0.5">Дата</div>
                            <div className="text-[10px] lg:text-xs font-bold text-slate-900">{req.date}</div>
                         </div>
                         <div className={cn(
                           "w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center",
                           req.status === "completed" ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                         )}>
                            {req.status === "completed" ? <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" /> : <Clock className="w-4 h-4 lg:w-5 lg:h-5" />}
                         </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-slate-100 flex flex-col items-start justify-between min-h-[160px] lg:min-h-[180px]">
                    <div className="flex items-center justify-between w-full mb-4">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <MapPin className="w-4.5 h-4.5 lg:w-5 lg:h-5" />
                        </div>
                        {addr.is_default && <span className="text-[7px] lg:text-[8px] font-black uppercase text-[#2c3b6e] tracking-widest bg-blue-50 px-3 py-1 rounded-full">Основной</span>}
                    </div>
                    <div className="mb-4">
                        <h4 className="text-[13px] lg:text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{addr.name}</h4>
                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase leading-relaxed max-w-[200px]">{addr.address}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingAddress(addr);
                        setAddressName(addr.name);
                        setAddressValue(addr.address);
                      }}
                      className="text-[9px] font-black uppercase text-slate-300 hover:text-slate-900 transition-colors"
                    >
                      Изменить
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setIsAddingAddress(true);
                    setAddressName("");
                    setAddressValue("");
                  }}
                  className="bg-slate-50 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-slate-100 border-dashed flex flex-col items-center justify-center gap-3 lg:gap-4 text-slate-400 hover:bg-white hover:border-[#2c3b6e] hover:text-[#2c3b6e] transition-all min-h-[160px] lg:min-h-[180px]"
                >
                   <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                   <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Добавить адрес</span>
                </button>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-12 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight mb-6 lg:mb-10">Настройки профиля</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-3 lg:space-y-4">
                       <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Имя</label>
                       <input type="text" defaultValue={user.name} className="w-full h-12 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl px-5 lg:px-6 text-[11px] lg:text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#2c3b6e]/20" />
                    </div>
                    <div className="space-y-3 lg:space-y-4">
                       <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Email</label>
                       <input type="email" defaultValue={user.email} className="w-full h-12 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl px-5 lg:px-6 text-[11px] lg:text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#2c3b6e]/20" />
                    </div>
                    <div className="space-y-3 lg:space-y-4">
                       <label className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Телефон</label>
                       <input type="text" placeholder="+998" className="w-full h-12 lg:h-14 bg-slate-50 rounded-xl lg:rounded-2xl px-5 lg:px-6 text-[11px] lg:text-xs font-bold text-slate-900 outline-none focus:ring-2 ring-[#2c3b6e]/20" />
                    </div>
                    <div className="pt-6 lg:pt-10">
                       <button className="w-full sm:w-auto h-12 lg:h-14 px-8 lg:px-10 bg-slate-900 text-white rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] transition-all">
                          Сохранить изменения
                       </button>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
