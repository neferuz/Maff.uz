"use client";

import { 
  Save, Truck, CreditCard, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Layout, Info, Type, AlignLeft, Package, Clock, ShieldCheck, Globe, MapPin, Wallet, Banknote, Building2, Smartphone, Send, ArrowRight, X, Phone, Check, Sparkles, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

const availableIcons = [
  { name: "Truck", icon: Truck },
  { name: "Package", icon: Package },
  { name: "Clock", icon: Clock },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Globe", icon: Globe },
  { name: "MapPin", icon: MapPin },
  { name: "CreditCard", icon: CreditCard },
  { name: "Wallet", icon: Wallet },
  { name: "Banknote", icon: Banknote },
  { name: "Building2", icon: Building2 },
  { name: "Smartphone", icon: Smartphone },
  { name: "Send", icon: Send },
  { name: "ArrowRight", icon: ArrowRight },
  { name: "CheckCircle2", icon: CheckCircle2 },
  { name: "Info", icon: Info },
];

export default function DeliveryEditor() {
  const [data, setData] = useState<any>({
    header: { title: "", subtitle: "" },
    deliveryOptions: [],
    paymentMethods: []
  });
  const [originalData, setOriginalData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("delivery"); // "delivery", "payment"

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/delivery");
      if (response.ok) {
        const result = await response.json();
        const content = result.content || {
          header: { title: "Логистика и Оплата", subtitle: "" },
          deliveryOptions: [],
          paymentMethods: []
        };
        setData(content);
        setOriginalData(JSON.parse(JSON.stringify(content)));
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          slug: "delivery",
          content: data
        }),
      });

      if (response.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setErrorMsg("Не удалось сохранить");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (type: "delivery" | "payment") => {
    if (type === "delivery") {
      setData({ ...data, deliveryOptions: [...data.deliveryOptions, { title: "Новая опция", description: "", meta: "", icon: "Truck" }] });
    } else {
      setData({ ...data, paymentMethods: [...data.paymentMethods, { title: "Новый способ", description: "", icon: "CreditCard" }] });
    }
  };

  const removeItem = (type: "delivery" | "payment", idx: number) => {
    if (type === "delivery") {
      const next = data.deliveryOptions.filter((_: any, i: number) => i !== idx);
      setData({ ...data, deliveryOptions: next });
    } else {
      const next = data.paymentMethods.filter((_: any, i: number) => i !== idx);
      setData({ ...data, paymentMethods: next });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-24 text-left px-4">
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                 <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Изменения успешно сохранены!</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 -mt-2">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Редактор доставки и оплаты</h1>
          <p className="text-[12px] text-[#4f566b]">Управление контентом maff.uz/delivery</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all shadow-none",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#f7f8f9] rounded-xl w-fit border border-[#e3e8ee]">
         {[
           { id: "delivery", label: "Условия доставки", icon: Truck },
           { id: "payment", label: "Методы оплаты", icon: CreditCard }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
               activeTab === tab.id ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-[#1a1f36]"
             )}
           >
             <tab.icon className="w-3.5 h-3.5" />
             {tab.label}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
         
         {/* Left Side: Global Info & Lists */}
         <div className="space-y-6">
            
            {/* Page Header Content */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-5 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Заголовок страницы</h3>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Главный заголовок</label>
                  <input 
                    type="text" 
                    value={data.header.title} 
                    onChange={(e) => setData({...data, header: {...data.header, title: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white transition-all" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    rows={3} 
                    value={data.header.subtitle} 
                    onChange={(e) => setData({...data, header: {...data.header, subtitle: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white transition-all" 
                  />
               </div>
            </div>

            {/* List Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     {activeTab === "delivery" ? <Truck className="w-4 h-4 text-[#2c3b6e]" /> : <CreditCard className="w-4 h-4 text-[#2c3b6e]" />}
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">
                        {activeTab === "delivery" ? "Список опций доставки" : "Способы оплаты"}
                     </h3>
                  </div>
                  <button 
                    onClick={() => addItem(activeTab as any)} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold shadow-none"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {(activeTab === "delivery" ? data.deliveryOptions : data.paymentMethods).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl relative group transition-all hover:border-[#2c3b6e]/30">
                       <button 
                         onClick={() => removeItem(activeTab as any, idx)} 
                         className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Название</label>
                                <input value={item.title} onChange={(e) => {
                                   const next = activeTab === "delivery" ? [...data.deliveryOptions] : [...data.paymentMethods];
                                   next[idx].title = e.target.value;
                                   setData({ ...data, [activeTab === "delivery" ? "deliveryOptions" : "paymentMethods"]: next });
                                }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#1a1f36] outline-none" />
                             </div>
                             {activeTab === "delivery" && (
                                <div className="space-y-1">
                                   <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Метка (Цена/Срок)</label>
                                   <input value={item.meta} onChange={(e) => {
                                      const next = [...data.deliveryOptions];
                                      next[idx].meta = e.target.value;
                                      setData({ ...data, deliveryOptions: next });
                                   }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#2c3b6e] outline-none" />
                                </div>
                             )}
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                             <textarea rows={2} value={item.description} onChange={(e) => {
                                const next = activeTab === "delivery" ? [...data.deliveryOptions] : [...data.paymentMethods];
                                next[idx].description = e.target.value;
                                setData({ ...data, [activeTab === "delivery" ? "deliveryOptions" : "paymentMethods"]: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 outline-none resize-none" />
                          </div>
                          
                          {/* Icon Selector */}
                          <div className="space-y-1.5 mt-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Иконка</label>
                             <div className="flex flex-wrap gap-1.5">
                                {availableIcons.map(iconObj => (
                                   <button 
                                     key={iconObj.name} 
                                     onClick={() => {
                                        const next = activeTab === "delivery" ? [...data.deliveryOptions] : [...data.paymentMethods];
                                        next[idx].icon = iconObj.name;
                                        setData({ ...data, [activeTab === "delivery" ? "deliveryOptions" : "paymentMethods"]: next });
                                     }} 
                                     className={cn(
                                       "w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                                       item.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e]" : "bg-white text-slate-300 border-[#e3e8ee] hover:border-slate-400"
                                     )}
                                   >
                                      <iconObj.icon className="w-3.5 h-3.5" />
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Side: Help/Tips */}
         <div className="space-y-6">
            <div className="bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-6 text-center">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e3e8ee]">
                  <Sparkles className="w-6 h-6 text-[#2c3b6e]" />
               </div>
               <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">Настройка сервиса</h3>
               <p className="text-[11px] text-[#4f566b] font-medium leading-relaxed max-w-xs mx-auto">
                  Здесь вы управляете условиями, которые видит клиент на странице оформления и сервиса. Старайтесь делать описания четкими и лаконичными.
               </p>
            </div>

            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Поддержка</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed">
                  Если вам нужно изменить логику расчета доставки (автоматизацию), пожалуйста, обратитесь в технический отдел.
               </p>
               <div className="pt-2 border-t border-[#e3e8ee]">
                  <a href="tel:+998712055454" className="text-[13px] font-bold text-[#2c3b6e]">+998 71 205-54-54</a>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
