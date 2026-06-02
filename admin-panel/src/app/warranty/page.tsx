"use client";
import { 
  Save, ShieldCheck, RotateCcw, BadgeCheck, ShieldPlus, Plus, Trash2, RefreshCw, CheckCircle2, Type, Sparkles, Phone, Shield, Check, AlertCircle
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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-12 text-left">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Гарантия и возврат</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
         
         {/* Main Form Fields */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Header Content */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
               <div className="flex items-center gap-2 min-h-8">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Заголовки</h3>
               </div>
               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Главный заголовок</label>
                  <input 
                    type="text" 
                    value={data.title} 
                    onChange={(e) => setData({...data, title: e.target.value})} 
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all" 
                  />
               </div>
               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Описание</label>
                  <textarea 
                    rows={3} 
                    value={data.description} 
                    onChange={(e) => setData({...data, description: e.target.value})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white focus:border-[#2c3b6e] transition-all" 
                  />
               </div>
            </div>

            {/* Features (Warranty points) */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
               <div className="flex items-center justify-between min-h-8">
                  <div className="flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Преимущества гарантии</h3>
                  </div>
                  <button 
                    onClick={addFeature} 
                    className="h-8 flex items-center gap-2 px-3 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {data.features.map((feat: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg relative group transition-all hover:border-[#2c3b6e]">
                       <button 
                         onClick={() => removeFeature(idx)} 
                         className="absolute top-2 right-2 p-1.5 text-[#a3acb9] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Название</label>
                                <input value={feat.title} onChange={(e) => {
                                   const next = [...data.features];
                                   next[idx].title = e.target.value;
                                   setData({ ...data, features: next });
                                }} className="h-8 w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]" />
                             </div>
                             <div className="space-y-1">
                                <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Метка</label>
                                <input value={feat.meta} onChange={(e) => {
                                   const next = [...data.features];
                                   next[idx].meta = e.target.value;
                                   setData({ ...data, features: next });
                                }} className="h-8 w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 text-[12px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e]" />
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                             <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Описание</label>
                             <textarea rows={2} value={feat.description} onChange={(e) => {
                                const next = [...data.features];
                                next[idx].description = e.target.value;
                                setData({ ...data, features: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#4f566b] outline-none resize-none focus:border-[#2c3b6e]" />
                          </div>

                          <div className="space-y-1 mt-1">
                             <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Иконка</label>
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
                                       feat.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e]" : "bg-white text-[#a3acb9] border-[#e3e8ee] hover:border-[#2c3b6e]"
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
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
               <div className="flex items-center justify-between min-h-8">
                  <div className="flex items-center gap-2">
                     <RotateCcw className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Этапы возврата</h3>
                  </div>
                  <button 
                    onClick={addStep} 
                    className="h-8 flex items-center gap-2 px-3 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="space-y-3">
                  {data.steps.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg relative group transition-all hover:border-[#2c3b6e]">
                       <button 
                         onClick={() => removeStep(idx)} 
                         className="absolute top-2 right-2 p-1.5 text-[#a3acb9] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                             <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Название шага</label>
                             <input value={step.t} onChange={(e) => {
                                const next = [...data.steps];
                                next[idx].t = e.target.value;
                                setData({ ...data, steps: next });
                             }} className="h-8 w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]" />
                          </div>
                          <div className="space-y-1">
                             <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Описание шага</label>
                             <textarea rows={2} value={step.d} onChange={(e) => {
                                const next = [...data.steps];
                                next[idx].d = e.target.value;
                                setData({ ...data, steps: next });
                             }} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#4f566b] outline-none resize-none focus:border-[#2c3b6e]" />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>

         {/* Sidebar Help */}
         <div className="space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-3">
               <div className="flex items-center gap-2 min-h-8">
                  <Phone className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Поддержка</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed">
                  По вопросам гарантийного сервиса обращайтесь в офис MAFF:
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
