"use client";
import { 
  Save, Truck, CreditCard, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Layout, Info, Type, AlignLeft, Package, Clock, ShieldCheck, Globe, MapPin, Wallet, Banknote, Building2, Smartphone, Send, ArrowRight, X, Phone, Check, Sparkles, Tag, Truck as TruckIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  const defaultData = {
    header: { title: "Логистика и Оплата", subtitle: "Обеспечиваем бережную доставку и удобные способы расчета для вашего комфорта." },
    deliveryOptions: [
      { title: "Доставка по Ташкенту", description: "Осуществляется в течение 24 часов с момента заказа.", meta: "Бесплатно от 10 млн", icon: "Truck" },
      { title: "Доставка по регионам", description: "Отгрузка через транспортные компании во все города Узбекистана.", meta: "По тарифу ТК", icon: "MapPin" },
      { title: "Самовывоз", description: "Заберите заказ из нашего центрального шоу-рума в любое удобное время.", meta: "Пн-Сб 09:00-20:00", icon: "Clock" }
    ],
    paymentMethods: [
      { title: "Наличными", description: "Оплата в шоу-руме или курьеру при получении товара.", icon: "CreditCard" },
      { title: "Терминал / Click / Uzum", description: "Все виды электронных платежей и QR-оплата.", icon: "Smartphone" },
      { title: "Безналичный расчет", description: "Для юридических лиц с предоставлением всех закрывающих документов.", icon: "ShieldCheck" }
    ]
  };

  const [data, setData] = useState<any>(defaultData);
  const [originalData, setOriginalData] = useState<any>(JSON.parse(JSON.stringify(defaultData)));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("delivery");

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/delivery");
      if (response.ok) {
        const result = await response.json();
        console.log("[Delivery] API response:", result);
        let apiContent = result.content;
        // Handle case where content is stored as JSON string
        if (typeof apiContent === 'string') {
          try { apiContent = JSON.parse(apiContent); } catch (e) { apiContent = {}; }
        }
        const content = {
          ...defaultData,
          ...(apiContent || {})
        };
        if (!content.header) content.header = { ...defaultData.header };
        console.log("[Delivery] Parsed content:", content);
        setData(content);
        setOriginalData(JSON.parse(JSON.stringify(content)));
      } else {
        console.log("[Delivery] API returned", response.status);
        setData(defaultData);
        setOriginalData(JSON.parse(JSON.stringify(defaultData)));
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch data:", err);
      setData(defaultData);
      setOriginalData(JSON.parse(JSON.stringify(defaultData)));
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
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <TruckIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Доставка и оплата</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Управление контентом</p>
          </div>
          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md tracking-wider">Несохранено</span>
          )}
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e3e8ee]">
         {[
           { id: "delivery", label: "Условия доставки", icon: Truck },
           { id: "payment", label: "Методы оплаты", icon: CreditCard }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "px-4 py-3 text-[12px] font-semibold border-b-2 transition-all",
               activeTab === tab.id ? "text-[#2c3b6e] border-[#2c3b6e]" : "text-[#4f566b] border-transparent hover:text-[#1a1f36]"
             )}
           >
             {tab.label}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
         
         {/* Left Side: Global Info & Lists */}
         <div className="space-y-6">
            
            {/* Page Header Content */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Заголовок страницы</h3>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Главный заголовок</label>
                  <input 
                    type="text" 
                    value={data.header?.title || ""} 
                    onChange={(e) => setData({...data, header: {...(data.header || {}), title: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all" 
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                  <textarea 
                    rows={3} 
                    value={data.header?.subtitle || ""} 
                    onChange={(e) => setData({...data, header: {...(data.header || {}), subtitle: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white focus:border-[#2c3b6e] transition-all" 
                  />
               </div>
            </div>

            {/* List Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     {activeTab === "delivery" ? <Truck className="w-4 h-4 text-[#2c3b6e]" /> : <CreditCard className="w-4 h-4 text-[#2c3b6e]" />}
                     <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">
                        {activeTab === "delivery" ? "Опции доставки" : "Способы оплаты"}
                     </h3>
                  </div>
                  <button 
                    onClick={() => addItem(activeTab as any)} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {(activeTab === "delivery" ? data.deliveryOptions : data.paymentMethods).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg relative group transition-all hover:border-[#2c3b6e]">
                       <button 
                         onClick={() => removeItem(activeTab as any, idx)} 
                         className="absolute top-2 right-2 p-1.5 text-[#a3acb9] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Название</label>
                                <input value={item.title} onChange={(e) => {
                                   const next = activeTab === "delivery" ? [...data.deliveryOptions] : [...data.paymentMethods];
                                   next[idx].title = e.target.value;
                                   setData({ ...data, [activeTab === "delivery" ? "deliveryOptions" : "paymentMethods"]: next });
                                }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]" />
                             </div>
                             {activeTab === "delivery" && (
                                <div className="space-y-1">
                                   <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Метка</label>
                                   <input value={item.meta} onChange={(e) => {
                                      const next = [...data.deliveryOptions];
                                      next[idx].meta = e.target.value;
                                      setData({ ...data, deliveryOptions: next });
                                   }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e]" />
                                </div>
                             )}
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                             <textarea rows={2} value={item.description} onChange={(e) => {
                                const next = activeTab === "delivery" ? [...data.deliveryOptions] : [...data.paymentMethods];
                                next[idx].description = e.target.value;
                                setData({ ...data, [activeTab === "delivery" ? "deliveryOptions" : "paymentMethods"]: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#4f566b] outline-none resize-none focus:border-[#2c3b6e]" />
                          </div>
                          
                          {/* Icon Selector */}
                          <div className="space-y-1 mt-1">
                             <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Иконка</label>
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
                                       item.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e]" : "bg-white text-[#a3acb9] border-[#e3e8ee] hover:border-[#2c3b6e]"
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
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-3">
               <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Поддержка</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed">
                  Если вам нужно изменить логику расчета доставки, обратитесь в технический отдел.
               </p>
               <div className="pt-2 border-t border-[#e3e8ee]">
                  <a href="tel:+998712055454" className="text-[13px] font-semibold text-[#2c3b6e]">+998 71 205-54-54</a>
               </div>
            </div>
         </div>

      </div>

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 border border-white/10">
              <div className="w-4 h-4 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                 <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] font-semibold">Изменения сохранены</span>
           </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#cd5c5c] text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 border border-white/10">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-[12px] font-semibold">{errorMsg}</span>
           </div>
        </div>
      )}
    </div>
  );
}
