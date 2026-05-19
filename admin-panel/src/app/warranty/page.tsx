"use client";

import { 
  Save, ShieldCheck, RotateCcw, BadgeCheck, ShieldPlus, Plus, Trash2, RefreshCw, CheckCircle2, Type, Sparkles, Phone, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

const availableIcons = [
  { name: "ShieldPlus", icon: ShieldPlus },
  { name: "RotateCcw", icon: RotateCcw },
  { name: "BadgeCheck", icon: BadgeCheck },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Shield", icon: Shield },
];

export default function WarrantyEditor() {
  const [data, setData] = useState<any>({
    title: "Гарантия и Возврат",
    description: "Мы берем на себя полную ответственность за продукцию. Каждый клиент MAFF защищен официальными обязательствами производителей.",
    features: [
      {
        icon: "ShieldPlus",
        title: "Заводская гарантия",
        description: "Официальная поддержка от производителя до 30 лет. Мы дистрибьюторы всех брендов.",
        meta: "Гарантийный талон"
      },
      {
        icon: "RotateCcw",
        title: "Легкий возврат",
        description: "Обмен или возврат неиспользованного товара в течение 14 дней без лишних вопросов.",
        meta: "Закон РУз"
      },
      {
        icon: "BadgeCheck",
        title: "Оригинал 100%",
        description: "Двойной контроль качества на соответствие геометрии перед каждой отгрузкой.",
        meta: "Контроль MAFF"
      }
    ],
    steps: [
      { t: "Заявление", d: "Бланк возврата в любом из шоу-румов." },
      { t: "Осмотр", d: "Проверка сохранности упаковки товара." },
      { t: "Возврат", d: "Выплата средств тем же способом оплаты." }
    ]
  });

  const [originalData, setOriginalData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/warranty?t=" + Date.now());
      if (response.ok) {
        const result = await response.json();
        const content = result.content || {
          title: "Гарантия и Возврат",
          description: "Мы берем на себя полную ответственность за продукцию. Каждый клиент MAFF защищен официальными обязательствами производителей.",
          features: [
            {
              icon: "ShieldPlus",
              title: "Заводская гарантия",
              description: "Официальная поддержка от производителя до 30 лет. Мы дистрибьюторы всех брендов.",
              meta: "Гарантийный талон"
            },
            {
              icon: "RotateCcw",
              title: "Легкий возврат",
              description: "Обмен или возврат неиспользованного товара в течение 14 дней без лишних вопросов.",
              meta: "Закон РУз"
            },
            {
              icon: "BadgeCheck",
              title: "Оригинал 100%",
              description: "Двойной контроль качества на соответствие геометрии перед каждой отгрузкой.",
              meta: "Контроль MAFF"
            }
          ],
          steps: [
            { t: "Заявление", d: "Бланк возврата в любом из шоу-румов." },
            { t: "Осмотр", d: "Проверка сохранности упаковки товара." },
            { t: "Возврат", d: "Выплата средств тем же способом оплаты." }
          ]
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
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          slug: "warranty",
          content: data
        }),
      });

      if (response.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setErrorMsg("Не удалось сохранить изменения");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    setData({
      ...data,
      features: [...data.features, { icon: "ShieldPlus", title: "Новая гарантия", description: "", meta: "" }]
    });
  };

  const removeFeature = (idx: number) => {
    const next = data.features.filter((_: any, i: number) => i !== idx);
    setData({ ...data, features: next });
  };

  const addStep = () => {
    setData({
      ...data,
      steps: [...data.steps, { t: "Новый этап", d: "" }]
    });
  };

  const removeStep = (idx: number) => {
    const next = data.steps.filter((_: any, i: number) => i !== idx);
    setData({ ...data, steps: next });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-24 text-left px-4">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                 <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Гарантия успешно сохранена!</span>
           </div>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-red-950 text-red-200 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-red-500/30">
              <span className="text-[13px] font-bold tracking-tight">{errorMsg}</span>
           </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 -mt-2">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Редактор гарантии и возврата</h1>
          <p className="text-[12px] text-[#4f566b]">Управление контентом maff.uz/warranty</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
         
         {/* Main Form Fields */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Header Content */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Заголовки</h3>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Главный заголовок</label>
                  <input 
                    type="text" 
                    value={data.title} 
                    onChange={(e) => setData({...data, title: e.target.value})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white transition-all" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    rows={3} 
                    value={data.description} 
                    onChange={(e) => setData({...data, description: e.target.value})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white transition-all" 
                  />
               </div>
            </div>

            {/* Features (Warranty points) */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Преимущества гарантии</h3>
                  </div>
                  <button 
                    onClick={addFeature} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {data.features.map((feat: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl relative group transition-all hover:border-[#2c3b6e]/30">
                       <button 
                         onClick={() => removeFeature(idx)} 
                         className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Название</label>
                                <input value={feat.title} onChange={(e) => {
                                   const next = [...data.features];
                                   next[idx].title = e.target.value;
                                   setData({ ...data, features: next });
                                }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#1a1f36] outline-none" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Метка (Срок/Сертификат)</label>
                                <input value={feat.meta} onChange={(e) => {
                                   const next = [...data.features];
                                   next[idx].meta = e.target.value;
                                   setData({ ...data, features: next });
                                }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#2c3b6e] outline-none" />
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                             <textarea rows={2} value={feat.description} onChange={(e) => {
                                const next = [...data.features];
                                next[idx].description = e.target.value;
                                setData({ ...data, features: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 outline-none resize-none" />
                          </div>

                          <div className="space-y-1.5 mt-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Иконка</label>
                             <div className="flex flex-wrap gap-1.5">
                                {availableIcons.map(iconObj => (
                                   <button 
                                     key={iconObj.name} 
                                     onClick={() => {
                                        const next = [...data.features];
                                        next[idx].icon = iconObj.name;
                                        setData({ ...data, features: next });
                                     }} 
                                     className={cn(
                                       "w-7 h-7 rounded-lg flex items-center justify-center border transition-all",
                                       feat.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e]" : "bg-white text-slate-300 border-[#e3e8ee] hover:border-slate-400"
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

            {/* Return Steps */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <RotateCcw className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Этапы возврата</h3>
                  </div>
                  <button 
                    onClick={addStep} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {data.steps.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl relative group transition-all hover:border-[#2c3b6e]/30">
                       <button 
                         onClick={() => removeStep(idx)} 
                         className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Название шага</label>
                             <input value={step.t} onChange={(e) => {
                                const next = [...data.steps];
                                next[idx].t = e.target.value;
                                setData({ ...data, steps: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#1a1f36] outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Описание шага</label>
                             <textarea rows={2} value={step.d} onChange={(e) => {
                                const next = [...data.steps];
                                next[idx].d = e.target.value;
                                setData({ ...data, steps: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 outline-none resize-none" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>

         {/* Sidebar Help */}
         <div className="space-y-6">
            <div className="bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-6 text-center">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e3e8ee]">
                  <Sparkles className="w-6 h-6 text-[#2c3b6e]" />
               </div>
               <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">Настройка сервиса</h3>
               <p className="text-[11px] text-[#4f566b] font-medium leading-relaxed max-w-xs mx-auto">
                  Здесь вы управляете условиями гарантии и возврата, которые отображаются на публичной странице `/warranty`.
               </p>
            </div>

            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Контакты поддержки</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed">
                  По всем дополнительным вопросам гарантийного сервиса клиенты могут звонить в офис MAFF:
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
