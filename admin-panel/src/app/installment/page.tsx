"use client";

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
    benefits: [] as any[]
  });

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    type: "partner" | "step" | "benefit" | "";
    idx: number;
  }>({ show: false, type: "", idx: -1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/installment");
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
          setData(content);
        }
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ slug: "installment", content: data }),
      });
      if (response.ok) {
        setShowToast(true);
        setHasChanges(false);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      setErrorMsg("Ошибка сохранения");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateListItem = (listName: 'partners' | 'steps' | 'benefits', idx: number, field: string | null, value: any) => {
    const newList = [...data[listName]];
    if (field) newList[idx] = { ...newList[idx], [field]: value };
    else newList[idx] = value;
    setData(prev => ({ ...prev, [listName]: newList }));
    setHasChanges(true);
  };

  const addListItem = (listName: 'partners' | 'steps' | 'benefits', newItem: any) => {
    setData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
    setHasChanges(true);
  };

  const removeListItem = (listName: 'partners' | 'steps' | 'benefits', idx: number) => {
    const newList = data[listName].filter((_, i) => i !== idx);
    setData(prev => ({ ...prev, [listName]: newList }));
    setHasChanges(true);
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Управление Рассрочкой</h1>
          <p className="text-[14px] text-[#4f566b]">Настройка условий, этапов и сервисов-партнеров.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* ── Left Column: Primary Content ── */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Partners List */}
            <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
               <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                        <Zap className="w-5 h-5" />
                     </div>
                     <h3 className="text-lg font-bold text-[#1a1f36]">Сервисы-партнеры</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('partners', { name: "Новый", logo: "", terms: "12 мес", benefits: "0%" })} 
                    className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all flex items-center gap-2 px-4 border border-dashed border-[#2c3b6e]/20"
                  >
                     <Plus className="w-4 h-4" />
                     <span className="text-[11px] font-bold uppercase tracking-tight">Добавить</span>
                  </button>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {data.partners.map((partner, idx) => (
                        <div key={idx} className="bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl p-4 group relative space-y-4">
                           <button onClick={() => setDeleteModal({ show: true, type: "partner", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-lg border border-[#e3e8ee] flex items-center justify-center relative group/logo overflow-hidden">
                                 {partner.logo ? <img src={partner.logo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="w-5 h-5 text-slate-200" />}
                                 <label className="absolute inset-0 bg-[#1a1f36]/80 flex items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 cursor-pointer transition-opacity"><Upload className="w-4 h-4" /><input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])} /></label>
                              </div>
                              <input value={partner.name} onChange={(e) => updateListItem('partners', idx, 'name', e.target.value)} className="bg-transparent font-bold text-[13px] outline-none w-full" />
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                 <label className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest">Срок рассрочки</label>
                                 <input value={partner.terms} onChange={(e) => updateListItem('partners', idx, 'terms', e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1 text-[11px] font-semibold" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest">Условие (переплата)</label>
                                 <input value={partner.benefits} onChange={(e) => updateListItem('partners', idx, 'benefits', e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1 text-[11px] font-bold text-[#2c3b6e]" />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
               <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                        <List className="w-5 h-5" />
                     </div>
                     <h3 className="text-lg font-bold text-[#1a1f36]">Этапы оформления</h3>
                  </div>
                  <button 
                    onClick={() => addListItem('steps', { title: "Новый этап", description: "", icon: "Smartphone" })}
                    className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all flex items-center gap-2 px-4 border border-dashed border-[#2c3b6e]/20"
                  >
                     <Plus className="w-4 h-4" />
                     <span className="text-[11px] font-bold uppercase tracking-tight">Добавить</span>
                  </button>
               </div>
               <div className="p-6 space-y-3">
                  {data.steps.map((step, idx) => (
                     <div key={idx} className="group relative bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl p-4 space-y-3">
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
                              <div className="flex items-center justify-between gap-4">
                                 <input 
                                   value={step.title}
                                   onChange={(e) => updateListItem('steps', idx, 'title', e.target.value)}
                                   className="bg-transparent text-[13px] font-bold text-[#1a1f36] outline-none border-b border-transparent focus:border-[#2c3b6e]/30 px-1 py-0.5 flex-1"
                                 />
                                 <button onClick={() => setDeleteModal({ show: true, type: "step", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
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

         {/* ── Right Column: Sidebar ── */}
         <div className="lg:col-span-4 space-y-8">
            {/* General Info */}
            <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
               <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                     <Type className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">Общие тексты</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Главный заголовок</label>
                     <input 
                       value={data.title}
                       onChange={(e) => updateField('title', e.target.value)}
                       className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                       placeholder="Рассрочка 0%"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание страницы</label>
                     <textarea 
                       value={data.description}
                       onChange={(e) => updateField('description', e.target.value)}
                       rows={4}
                       className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#4f566b] outline-none focus:border-[#2c3b6e]/30 transition-all resize-none"
                     />
                  </div>
               </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
               <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1a1f36]">Выгоды</h3>
                  <button onClick={() => addListItem('benefits', { title: "Пункт", icon: "CheckCircle2" })} className="text-[#2c3b6e] hover:bg-[#2c3b6e]/5 p-1 rounded transition-colors"><Plus className="w-5 h-5" /></button>
               </div>
               <div className="p-6 space-y-3">
                  {data.benefits.map((benefit, idx) => (
                     <div key={idx} className="flex items-center gap-3 group bg-[#f8f9fa] p-3 rounded-xl border border-[#e3e8ee]">
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
                        <input value={benefit.title} onChange={(e) => updateListItem('benefits', idx, 'title', e.target.value)} className="bg-transparent text-[13px] font-semibold text-[#1a1f36] outline-none flex-1" />
                        <button onClick={() => setDeleteModal({ show: true, type: "benefit", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[13px] font-bold tracking-tight">Изменения сохранены!</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {mounted && typeof document !== 'undefined' && require('react-dom').createPortal(
        <AnimatePresence>
          {deleteModal.show && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="absolute inset-0 bg-[#1a1f36]/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden border border-[#e3e8ee] shadow-2xl">
                  <div className="p-8 text-center">
                     <div className="w-20 h-20 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-10 h-10 text-[#cd5c5c]" />
                     </div>
                     <h3 className="text-2xl font-bold text-[#1a1f36] mb-3 tracking-tight">Удалить элемент?</h3>
                     <p className="text-[14px] text-[#4f566b] font-medium leading-relaxed mb-8">Это действие нельзя отменить. Данные будут навсегда удалены из этого раздела.</p>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="flex-1 py-4 bg-[#f7f8f9] text-[#1a1f36] rounded-2xl font-bold text-[14px] hover:bg-[#e3e8ee] transition-all">Отмена</button>
                        <button onClick={confirmDelete} className="flex-1 py-4 bg-[#cd5c5c] text-white rounded-2xl font-bold text-[14px] hover:bg-[#b04b4b] transition-all shadow-lg shadow-red-500/20">Да, удалить</button>
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
