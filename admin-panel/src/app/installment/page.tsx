"use client";
import { toast } from "react-hot-toast";
import { 
  Save, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, CreditCard, Zap, Clock, ShieldCheck, Upload, Image as ImageIcon, X, Type, List, ChevronRight, Smartphone, Wallet, BadgePercent, Coins, Handshake, Users, Target, Award, Shield, Search, MessageSquare, Package, Truck, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

const ICON_MAP: Record<string, any> = {
  CreditCard, Smartphone, Zap, Clock, ShieldCheck, CheckCircle2, Wallet, BadgePercent, Coins, Handshake, Users, Target, Award, Shield, Search, MessageSquare, Package, Truck, HelpCircle
};

export default function InstallmentEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [data, setData] = useState({
    title: "",
    description: "",
    partners: [] as any[],
    steps: [] as any[],
    benefits: [] as any[],
    months: [] as number[]
  });

  const [originalData, setOriginalData] = useState<any>(null);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    type: "partner" | "step" | "benefit" | "";
    idx: number;
  }>({ show: false, type: "", idx: -1 });

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/installment?t=" + Date.now());
      if (response.ok) {
        const result = await response.json();
        if (result.content) {
          const content = result.content;
          if (content.benefits && typeof content.benefits[0] === 'string') {
            content.benefits = content.benefits.map((b: string) => ({ title: b, icon: "CheckCircle2" }));
          }
          if (content.steps && (content.steps.length > 0 && !content.steps[0].icon)) {
            const defaultIcons = ["Smartphone", "Zap", "ShieldCheck"];
            content.steps = content.steps.map((s: any, i: number) => ({ ...s, icon: defaultIcons[i] || "CheckCircle2" }));
          }
          if (!content.months || !Array.isArray(content.months)) {
            content.months = [3, 6, 12, 24];
          }
          setData(content);
          setOriginalData(JSON.parse(JSON.stringify(content)));
        }
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch data:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ slug: "installment", content: data }),
      });
      if (response.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        toast.success("Изменения успешно сохранены!");
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      setErrorMsg("Ошибка сохранения");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const updateListItem = (listName: 'partners' | 'steps' | 'benefits', idx: number, field: string | null, value: any) => {
    const newList = [...data[listName]];
    if (field) newList[idx] = { ...newList[idx], [field]: value };
    else newList[idx] = value;
    setData(prev => ({ ...prev, [listName]: newList }));
  };

  const addListItem = (listName: 'partners' | 'steps' | 'benefits', newItem: any) => {
    setData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };

  const removeListItem = (listName: 'partners' | 'steps' | 'benefits', idx: number) => {
    const newList = data[listName].filter((_, i) => i !== idx);
    setData(prev => ({ ...prev, [listName]: newList }));
  };

  const confirmDelete = () => {
    if (deleteModal.type === "partner") removeListItem('partners', deleteModal.idx);
    if (deleteModal.type === "step") removeListItem('steps', deleteModal.idx);
    if (deleteModal.type === "benefit") removeListItem('benefits', deleteModal.idx);
    setDeleteModal({ show: false, type: "", idx: -1 });
  };

  const handleFileUpload = async (idx: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/admin-maff/api/v1/uploads", { method: "POST", body: formData });
      if (response.ok) {
        const res = await response.json();
        updateListItem('partners', idx, 'logo', res.url);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      setErrorMsg("Ошибка загрузки");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24 text-left px-4">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                 <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Рассрочка успешно сохранена!</span>
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

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 -mt-2">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Управление рассрочкой</h1>
          <p className="text-[12px] text-[#4f566b]">Настройка условий, этапов и сервисов-партнеров maff.uz/installment</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || !isDirty}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all shadow-none",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
         
         {/* Left Column: Primary Content */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Partners List */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <Zap className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Сервисы-партнеры</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('partners', { name: "Новый партнер", logo: "", terms: "3, 6, 12 мес", benefits: "0% переплата" })} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.partners.map((partner, idx) => (
                     <div key={idx} className="bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-4 group relative space-y-4 hover:border-[#2c3b6e]/30 transition-all">
                        <button onClick={() => setDeleteModal({ show: true, type: "partner", idx })} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"><X className="w-4 h-4" /></button>
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-white rounded-lg border border-[#e3e8ee] flex items-center justify-center relative group/logo overflow-hidden">
                              {partner.logo ? <img src={partner.logo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-5 h-5 text-slate-200" />}
                              <label className="absolute inset-0 bg-[#1a1f36]/80 flex items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 cursor-pointer transition-opacity"><Upload className="w-4 h-4" /><input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])} /></label>
                           </div>
                           <input value={partner.name} onChange={(e) => updateListItem('partners', idx, 'name', e.target.value)} className="bg-transparent font-bold text-[13px] w-full outline-none border-b border-transparent focus:border-[#2c3b6e]/30 px-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <label className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest">Срок рассрочки</label>
                              <input value={partner.terms} onChange={(e) => updateListItem('partners', idx, 'terms', e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold outline-none focus:border-[#2c3b6e]/30" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest">Условие (переплата)</label>
                              <input value={partner.benefits} onChange={(e) => updateListItem('partners', idx, 'benefits', e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e]/30" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <List className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Этапы оформления</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('steps', { title: "Новый этап", description: "", icon: "Smartphone" })}
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>
               
               <div className="space-y-3">
                  {data.steps.map((step, idx) => (
                     <div key={idx} className="group relative bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-4 space-y-3 hover:border-[#2c3b6e]/30 transition-all">
                        <button onClick={() => setDeleteModal({ show: true, type: "step", idx })} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"><Trash2 className="w-3.5 h-3.5" /></button>
                        <div className="flex items-start gap-3">
                           <div className="relative group/icon flex-shrink-0">
                              <div className="w-9 h-9 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e] cursor-pointer hover:border-[#2c3b6e]/30 transition-all">
                                 {(() => {
                                   const Icon = ICON_MAP[step.icon] || HelpCircle;
                                   return <Icon className="w-4.5 h-4.5" />;
                                 })()}
                              </div>
                              <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-5 gap-1 z-[60] w-48">
                                 {Object.keys(ICON_MAP).map(iconName => {
                                    const Icon = ICON_MAP[iconName];
                                    return (
                                       <button key={iconName} onClick={() => updateListItem('steps', idx, 'icon', iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-slate-50", step.icon === iconName ? "bg-[#1a1f36] text-white" : "text-slate-400")}>
                                          <Icon className="w-3.5 h-3.5" />
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                           <div className="flex-1 space-y-2">
                              <input 
                                value={step.title}
                                onChange={(e) => updateListItem('steps', idx, 'title', e.target.value)}
                                className="bg-transparent text-[13px] font-bold text-[#1a1f36] outline-none border-b border-transparent focus:border-[#2c3b6e]/30 px-1 py-0.5 w-full"
                              />
                              <textarea 
                                value={step.description}
                                onChange={(e) => updateListItem('steps', idx, 'description', e.target.value)}
                                rows={2}
                                className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[12px] text-[#4f566b] outline-none focus:border-[#2c3b6e]/30 transition-all resize-none"
                              />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* Right Column: Sidebar */}
         <div className="space-y-6">
            
            {/* General Info */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Общие тексты</h3>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Главный заголовок</label>
                  <input 
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all"
                    placeholder="Рассрочка 0%"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание страницы</label>
                  <textarea 
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    rows={4}
                    className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#4f566b] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all resize-none"
                  />
               </div>
            </div>

            {/* Installment Months Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Сроки (Месяцы)</h3>
                  </div>
                  <button 
                    onClick={() => {
                      const newMonth = prompt("Введите количество месяцев (число):");
                      if (newMonth && !isNaN(Number(newMonth))) {
                        const m = Number(newMonth);
                        if (!data.months.includes(m)) {
                          setData({ ...data, months: [...data.months, m].sort((a, b) => a - b) });
                        }
                      }
                    }} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>
               <div className="space-y-2">
                  {data.months.map((m, idx) => (
                     <div key={m} className="flex items-center justify-between bg-[#f7f8f9] px-4 py-2.5 rounded-xl border border-[#e3e8ee]">
                        <span className="text-[12px] font-bold text-[#1a1f36]">{m} месяцев</span>
                        <button 
                          onClick={() => {
                            const newMonths = data.months.filter((month) => month !== m);
                            setData({ ...data, months: newMonths });
                          }} 
                          className="text-[#cd5c5c] hover:bg-red-50 p-1 rounded-lg transition-colors"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  ))}
                  {data.months.length === 0 && (
                     <p className="text-[11px] text-[#4f566b] text-center py-4">Сроки не настроены. По умолчанию используются 3, 6, 12, 24 мес.</p>
                  )}
               </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <BadgePercent className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Выгоды</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('benefits', { title: "Новый пункт выгоды", icon: "CheckCircle2" })} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить
                  </button>
               </div>
               <div className="space-y-2">
                  {data.benefits.map((benefit, idx) => (
                     <div key={idx} className="flex items-center gap-3 group bg-[#f7f8f9] p-3 rounded-xl border border-[#e3e8ee] hover:border-[#2c3b6e]/30 transition-all">
                        <div className="relative group/icon flex-shrink-0">
                           <div className="w-8 h-8 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e] cursor-pointer hover:border-[#2c3b6e]/30">
                              {(() => {
                                 const Icon = ICON_MAP[benefit.icon] || CheckCircle2;
                                 return <Icon className="w-4 h-4" />;
                              })()}
                           </div>
                           <div className="absolute top-0 right-full mr-2 p-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-4 gap-1 z-[60] w-40">
                              {Object.keys(ICON_MAP).slice(0, 12).map(iconName => {
                                 const Icon = ICON_MAP[iconName];
                                 return (
                                    <button key={iconName} onClick={() => updateListItem('benefits', idx, 'icon', iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-slate-50", benefit.icon === iconName ? "bg-[#1a1f36] text-white" : "text-slate-400")}>
                                       <Icon className="w-3.5 h-3.5" />
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                        <input value={benefit.title} onChange={(e) => updateListItem('benefits', idx, 'title', e.target.value)} className="bg-transparent text-[12px] font-bold text-[#1a1f36] outline-none flex-1" />
                        <button onClick={() => setDeleteModal({ show: true, type: "benefit", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                  ))}
               </div>
            </div>

         </div>

      </div>

      {/* Delete Confirmation Modal */}
      {mounted && typeof document !== 'undefined' && require('react-dom').createPortal(
        <AnimatePresence>
          {deleteModal.show && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="absolute inset-0 bg-[#1a1f36]/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-[#e3e8ee] shadow-2xl">
                  <div className="p-8 text-center">
                     <div className="w-16 h-16 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-8 h-8 text-[#cd5c5c]" />
                     </div>
                     <h3 className="text-xl font-bold text-[#1a1f36] mb-3 tracking-tight">Удалить элемент?</h3>
                     <p className="text-[13px] text-[#4f566b] font-medium leading-relaxed mb-6">Это действие нельзя отменить. Данные будут навсегда удалены из этого раздела.</p>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="flex-1 py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[13px] hover:bg-[#e3e8ee] transition-all">Отмена</button>
                        <button onClick={confirmDelete} className="flex-1 py-3 bg-[#cd5c5c] text-white rounded-xl font-bold text-[13px] hover:bg-[#b04b4b] transition-all shadow-lg shadow-red-500/20">Да, удалить</button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
