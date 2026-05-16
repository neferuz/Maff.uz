"use client";

import { 
  Save, RefreshCw, CheckCircle2, Plus, Trash2, Clock, Gem, Users, Building2, ShieldCheck, Truck, HeartHandshake, Target, Award, MapPin, Phone, Layout, ChevronRight, History, Lightbulb, Image as ImageIcon, UserPlus, Upload, Globe, Users2, Check, Calendar, Type, Star, Shield, Zap, Search, MessageSquare, Package, X, BadgePercent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

const ICON_MAP: Record<string, any> = {
  Clock, Gem, Users, Building2, ShieldCheck, Truck, HeartHandshake, Target, Award, MapPin, Phone, Globe, Users2, Check, CheckCircle2, Star, Shield, Zap, Search, MessageSquare, Package
};

export default function AboutEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<any>({
    hero: { title: "", description: "", image: "" },
    stats: [],
    values: [],
    milestones: [],
    mission: { title: "", description: "", values: [] },
    team: []
  });

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    section: string;
    idx: number;
  }>({ show: false, section: "", idx: -1 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/about");
      if (response.ok) {
        const result = await response.json();
        if (result.content) {
          setData({
            ...data,
            ...result.content,
            mission: {
              ...(result.content.mission || {}),
              values: result.content.mission?.values || []
            },
            team: result.content.team || [],
            milestones: result.content.milestones || []
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch about data:", err);
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ slug: "about", content: data }),
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'team' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/admin-maff/api/v1/uploads", { method: "POST", body: formData });
      if (res.ok) {
        const result = await res.json();
        if (type === 'team' && uploadingIdx !== null) {
          const newTeam = [...data.team];
          newTeam[uploadingIdx] = { ...newTeam[uploadingIdx], image: result.url };
          setData({ ...data, team: newTeam });
        } else if (type === 'hero') {
          setData({ ...data, hero: { ...data.hero, image: result.url } });
        }
        setHasChanges(true);
      }
    } catch (err) { console.error("Upload failed", err); }
    finally {
      setUploadingIdx(null);
      setUploadingHero(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (heroInputRef.current) heroInputRef.current.value = "";
    }
  };

  const updateItem = (section: string, idx: number, field: string, value: any) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      const newList = [...data[parent][child]];
      newList[idx] = { ...newList[idx], [field]: value };
      setData({ ...data, [parent]: { ...data[parent], [child]: newList } });
    } else {
      const newList = [...data[section]];
      newList[idx] = { ...newList[idx], [field]: value };
      setData({ ...data, [section]: newList });
    }
    setHasChanges(true);
  };

  const addItem = (section: string, template: any) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setData({ ...data, [parent]: { ...data[parent], [child]: [...(data[parent][child] || []), template] } });
    } else {
      setData({ ...data, [section]: [...(data[section] || []), template] });
    }
    setHasChanges(true);
  };

  const removeItem = (section: string, idx: number) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setData({ ...data, [parent]: { ...data[parent], [child]: data[parent][child].filter((_: any, i: number) => i !== idx) } });
    } else {
      setData({ ...data, [section]: data[section].filter((_: any, i: number) => i !== idx) });
    }
    setHasChanges(true);
  };

  const confirmDelete = () => {
    removeItem(deleteModal.section, deleteModal.idx);
    setDeleteModal({ show: false, section: "", idx: -1 });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'team')} className="hidden" />
      <input type="file" ref={heroInputRef} onChange={(e) => handleFileUpload(e, 'hero')} className="hidden" />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">О компании</h1>
          <p className="text-[14px] text-[#4f566b]">Полное управление контентом страницы maff.uz/about</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all disabled:opacity-30"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Column: Main Content ── */}
        <div className="lg:col-span-7 space-y-8">
           
           {/* Team Section */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">Наша команда</h3>
                 </div>
                 <button 
                    onClick={() => addItem("team", { name: "", role: "", image: "" })} 
                    className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all flex items-center gap-2 px-4 border border-dashed border-[#2c3b6e]/20"
                 >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Добавить</span>
                 </button>
              </div>
              
              <div className="p-6 space-y-4">
                 {data.team.map((m: any, idx: number) => (
                    <div key={idx} className="group relative bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl p-4 space-y-3">
                       <button onClick={() => setDeleteModal({ show: true, section: "team", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg">
                          <X className="w-4 h-4" />
                       </button>
                       <div className="flex gap-4 items-start">
                          <div className="w-20 h-20 bg-white border border-[#e3e8ee] rounded-xl overflow-hidden flex-shrink-0 relative group/photo shadow-none">
                             {m.image ? <img src={m.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-8 h-8" /></div>}
                             <button onClick={() => { setUploadingIdx(idx); fileInputRef.current?.click(); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-opacity"><Upload className="w-5 h-5" /></button>
                          </div>
                          <div className="flex-1 grid grid-cols-1 gap-3">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Имя Фамилия</label>
                                   <input value={m.name} onChange={(e) => updateItem("team", idx, "name", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[13px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Должность</label>
                                   <input value={m.role} onChange={(e) => updateItem("team", idx, "role", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[13px] text-[#4f566b] outline-none focus:border-[#2c3b6e]/30" />
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">URL Фотографии</label>
                                <input value={m.image} onChange={(e) => updateItem("team", idx, "image", e.target.value)} className="w-full bg-transparent border-b border-slate-100 px-1 py-1 text-[11px] text-blue-500 outline-none focus:border-blue-200" />
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Mission Items */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">Наши ориентиры (Миссия)</h3>
                 </div>
                 <button onClick={() => addItem("mission.values", { icon: "Target", title: "", desc: "" })} className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all px-4 border border-dashed border-[#2c3b6e]/20">
                    <Plus className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-4">
                 {data.mission.values.map((v: any, idx: number) => (
                    <div key={idx} className="group relative bg-[#f8f9fa] p-4 rounded-xl border border-[#e3e8ee] space-y-3">
                       <button onClick={() => setDeleteModal({ show: true, section: "mission.values", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><X className="w-4 h-4" /></button>
                       <div className="flex items-center gap-3">
                          <div className="group/icon relative flex-shrink-0">
                             <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e]/30 transition-all shadow-none">
                                {React.createElement(ICON_MAP[v.icon] || Target, { className: "w-4.5 h-4.5" })}
                             </div>
                             <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-5 gap-1 z-[60] w-48">
                                {Object.keys(ICON_MAP).map(iconName => {
                                   const Icon = ICON_MAP[iconName];
                                   return (
                                      <button key={iconName} onClick={() => updateItem("mission.values", idx, "icon", iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-slate-50", v.icon === iconName ? "bg-[#1a1f36] text-white" : "text-slate-400")}>
                                         <Icon className="w-3.5 h-3.5" />
                                      </button>
                                   );
                                })}
                             </div>
                          </div>
                          <input value={v.title} onChange={(e) => updateItem("mission.values", idx, "title", e.target.value)} className="bg-transparent border-none p-0 text-[11px] font-bold uppercase text-[#1a1f36] outline-none w-full" placeholder="Заголовок" />
                       </div>
                       <textarea value={v.desc} onChange={(e) => updateItem("mission.values", idx, "desc", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1.5 text-[12px] text-[#4f566b] outline-none min-h-[50px] resize-none" placeholder="Описание..." />
                    </div>
                 ))}
              </div>
           </div>

           {/* Hero Content */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <Layout className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1a1f36]">Главный экран (Hero)</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1">
                    <div className="relative aspect-square rounded-2xl bg-slate-50 border border-[#e3e8ee] overflow-hidden group/hero shadow-none">
                       {data.hero.image ? <img src={data.hero.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-10 h-10" /></div>}
                       <button onClick={() => heroInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-opacity"><Upload className="w-6 h-6" /></button>
                    </div>
                 </div>
                 <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок Hero</label>
                       <input value={data.hero.title} onChange={(e) => setData({...data, hero: {...data.hero, title: e.target.value}})} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание Hero</label>
                       <textarea value={data.hero.description} onChange={(e) => setData({...data, hero: {...data.hero, description: e.target.value}})} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#4f566b] outline-none min-h-[80px] resize-none" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Right Column: Configuration ── */}
        <div className="lg:col-span-5 space-y-8">
           
           {/* Core Values Section */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">Ценности</h3>
                 </div>
                 <button onClick={() => addItem("values", { icon: "Award", title: "", description: "" })} className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all px-4 border border-dashed border-[#2c3b6e]/20">
                    <Plus className="w-4 h-4" />
                 </button>
              </div>

              <div className="p-6 space-y-4">
                 {data.values.map((v: any, idx: number) => (
                    <div key={idx} className="group relative bg-[#f8f9fa] p-4 rounded-xl border border-[#e3e8ee] space-y-3 overflow-visible">
                       <button onClick={() => setDeleteModal({ show: true, section: "values", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-4 h-4" /></button>
                       <div className="flex items-center gap-3">
                          <div className="group/icon relative flex-shrink-0">
                             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e]/30 shadow-none">
                                {React.createElement(ICON_MAP[v.icon] || Award, { className: "w-4 h-4" })}
                             </div>
                             <div className="absolute top-0 right-full mr-2 p-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-4 gap-1 z-[60] w-40">
                                {Object.keys(ICON_MAP).slice(0, 12).map(iconName => {
                                   const Icon = ICON_MAP[iconName];
                                   return (
                                      <button key={iconName} onClick={() => updateItem("values", idx, "icon", iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-slate-50", v.icon === iconName ? "bg-[#1a1f36] text-white" : "text-slate-400")}>
                                         <Icon className="w-3.5 h-3.5" />
                                      </button>
                                   );
                                })}
                             </div>
                          </div>
                          <input value={v.title} onChange={(e) => updateItem("values", idx, "title", e.target.value)} className="bg-transparent border-none p-0 text-[12px] font-bold uppercase text-[#1a1f36] outline-none" placeholder="Заголовок" />
                       </div>
                       <textarea value={v.description} onChange={(e) => updateItem("values", idx, "description", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1.5 text-[12px] text-[#4f566b] outline-none min-h-[45px] resize-none leading-relaxed" placeholder="Описание..." />
                    </div>
                 ))}
              </div>
           </div>

           {/* History Section */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       <History className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">История</h3>
                 </div>
                 <button onClick={() => addItem("milestones", { year: "", title: "" })} className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all px-4 border border-dashed border-[#2c3b6e]/20"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-3">
                 {data.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-center group bg-[#f8f9fa] p-3 rounded-xl border border-[#e3e8ee]">
                       <div className="w-14">
                          <input value={m.year} onChange={(e) => updateItem("milestones", idx, "year", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1 text-[11px] font-bold text-[#2c3b6e] text-center outline-none" placeholder="2024" />
                       </div>
                       <input value={m.title} onChange={(e) => updateItem("milestones", idx, "title", e.target.value)} className="flex-1 bg-transparent border-none p-0 text-[13px] font-medium text-[#1a1f36] outline-none" placeholder="Событие" />
                       <button onClick={() => setDeleteModal({ show: true, section: "milestones", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 ))}
              </div>
           </div>

           {/* Stats Section */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <BadgePercent className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1a1f36]">Цифры</h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                 {data.stats.map((s: any, idx: number) => (
                    <div key={idx} className="p-4 bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl text-center space-y-1">
                       <input value={s.value} onChange={(e) => updateItem("stats", idx, "value", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg py-1.5 text-center text-xl font-black text-[#2c3b6e] outline-none" />
                       <input value={s.label} onChange={(e) => updateItem("stats", idx, "label", e.target.value)} className="w-full bg-transparent text-center text-[10px] font-bold uppercase tracking-widest text-[#4f566b] outline-none" />
                    </div>
                 ))}
              </div>
           </div>

           {/* Mission Text */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <Lightbulb className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1a1f36]">Текст миссии</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок миссии</label>
                    <input value={data.mission.title} onChange={(e) => setData({...data, mission: {...data.mission, title: e.target.value}})} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание миссии</label>
                    <textarea value={data.mission.description} onChange={(e) => setData({...data, mission: {...data.mission, description: e.target.value}})} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#4f566b] outline-none min-h-[80px] resize-none" />
                 </div>
              </div>
           </div>

        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-none">
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
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden border border-[#e3e8ee] shadow-none">
                  <div className="p-8 text-center">
                     <div className="w-20 h-20 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-10 h-10 text-[#cd5c5c]" />
                     </div>
                     <h3 className="text-2xl font-bold text-[#1a1f36] mb-3 tracking-tight">Удалить элемент?</h3>
                     <p className="text-[14px] text-[#4f566b] font-medium leading-relaxed mb-8">Это действие нельзя отменить. Элемент будет навсегда удален из этого раздела.</p>
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
