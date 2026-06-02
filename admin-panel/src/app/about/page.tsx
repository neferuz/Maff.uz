"use client";

import { 
  Save, RefreshCw, CheckCircle2, Plus, Trash2, Clock, Gem, Users, Building2, ShieldCheck, Truck, HeartHandshake, Target, Award, MapPin, Phone, Layout, ChevronRight, History, Lightbulb, Image as ImageIcon, UserPlus, Upload, Globe, Users2, Check, Calendar, Type, Star, Shield, Zap, Search, MessageSquare, Package, X, BadgePercent, Home as HomeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  const [activeTab, setActiveTab] = useState("hero");

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
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <HomeIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">О компании</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">maff.uz / about</p>
          </div>
          {hasChanges && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md tracking-wider">Несохранено</span>
          )}
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
            hasChanges 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-[#e3e8ee] overflow-x-auto">
         {[
            { id: "hero", label: "Hero", icon: ImageIcon },
            { id: "stats", label: "Цифры", icon: BadgePercent },
            { id: "mission", label: "Миссия", icon: Lightbulb },
            { id: "values", label: "Ценности", icon: Award },
            { id: "history", label: "История", icon: History },
            { id: "team", label: "Команда", icon: Users },
         ].map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                  "flex items-center gap-2 px-4 py-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap",
                  activeTab === tab.id
                     ? "text-[#2c3b6e] border-[#2c3b6e]"
                     : "text-[#4f566b] border-transparent hover:text-[#1a1f36]"
               )}
            >
               <tab.icon className="w-4 h-4" />
               {tab.label}
            </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in duration-300">
         
         {/* Hero Tab */}
         {activeTab === "hero" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                     <div>
                       <h3 className="text-[11px] font-bold text-[#1a1f36]">Главный экран</h3>
                       <p className="text-[10px] text-[#a3acb9] mt-0.5">Баннер и текст в шапке страницы</p>
                     </div>
                  </div>
                  <div className="p-4 space-y-4">
                     <div className="relative h-48 rounded-lg bg-[#f7f8f9] border border-[#e3e8ee] overflow-hidden group/hero">
                        {data.hero.image ? <img src={data.hero.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#e3e8ee]"><ImageIcon className="w-12 h-12" /></div>}
                        <button onClick={() => heroInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/hero:opacity-100 transition-opacity"><Upload className="w-6 h-6" /></button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Заголовок</label>
                           <input value={data.hero.title} placeholder="Напр: О компании Maff" onChange={(e) => setData({...data, hero: {...data.hero, title: e.target.value}})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                           <textarea value={data.hero.description} placeholder="Краткое описание..." onChange={(e) => setData({...data, hero: {...data.hero, description: e.target.value}})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#1a1f36] outline-none min-h-[80px] resize-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Stats Tab */}
         {activeTab === "stats" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                        <div>
                          <h3 className="text-[11px] font-bold text-[#1a1f36]">Цифры</h3>
                          <p className="text-[10px] text-[#a3acb9] mt-0.5">Статистика в блоке «О нас»</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                     {data.stats.map((s: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-center space-y-1 hover:border-[#2c3b6e] transition-colors">
                           <input value={s.value} onChange={(e) => updateItem("stats", idx, "value", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg py-1.5 text-center text-xl font-black text-[#2c3b6e] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" placeholder="20+" />
                           <input value={s.label} onChange={(e) => updateItem("stats", idx, "label", e.target.value)} className="w-full bg-transparent text-center text-[10px] font-semibold text-[#4f566b] outline-none placeholder:text-[#c4cad4]" placeholder="Лет опыта" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Mission Tab */}
         {activeTab === "mission" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                     <div>
                       <h3 className="text-[11px] font-bold text-[#1a1f36]">Текст миссии</h3>
                       <p className="text-[10px] text-[#a3acb9] mt-0.5">Заголовок и описание миссии компании</p>
                     </div>
                  </div>
                  <div className="p-4 space-y-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Заголовок миссии</label>
                        <input value={data.mission.title} placeholder="Наша миссия" onChange={(e) => setData({...data, mission: {...data.mission, title: e.target.value}})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание миссии</label>
                        <textarea value={data.mission.description} placeholder="Опишите миссию компании..." onChange={(e) => setData({...data, mission: {...data.mission, description: e.target.value}})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#1a1f36] outline-none min-h-[80px] resize-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                     </div>
                  </div>
               </div>

               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                        <div>
                          <h3 className="text-[11px] font-bold text-[#1a1f36]">Наши ориентиры</h3>
                          <p className="text-[10px] text-[#a3acb9] mt-0.5">Ценности и принципы компании</p>
                        </div>
                     </div>
                     <button onClick={() => addItem("mission.values", { icon: "Target", title: "", desc: "" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold">
                        <Plus className="w-3.5 h-3.5" />
                        Добавить
                     </button>
                  </div>
                  
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                     {data.mission.values.map((v: any, idx: number) => (
                        <div key={idx} className="group relative bg-[#f7f8f9] p-3 rounded-lg border border-[#e3e8ee] space-y-2 transition-all hover:border-[#2c3b6e]">
                           <button onClick={() => setDeleteModal({ show: true, section: "mission.values", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><X className="w-3.5 h-3.5" /></button>
                           <div className="flex items-center gap-2">
                              <div className="group/icon relative flex-shrink-0">
                                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e] transition-all">
                                    {React.createElement(ICON_MAP[v.icon] || Target, { className: "w-4 h-4" })}
                                 </div>
                                 <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-[#e3e8ee] rounded-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-5 gap-1 z-[60] w-48">
                                    {Object.keys(ICON_MAP).map(iconName => {
                                       const Icon = ICON_MAP[iconName];
                                       return (
                                          <button key={iconName} onClick={() => updateItem("mission.values", idx, "icon", iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-[#f7f8f9]", v.icon === iconName ? "bg-[#2c3b6e] text-white" : "text-[#a3acb9]")}>
                                             <Icon className="w-3.5 h-3.5" />
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                              <input value={v.title} onChange={(e) => updateItem("mission.values", idx, "title", e.target.value)} className="bg-transparent border-none p-0 text-[11px] font-bold text-[#1a1f36] outline-none w-full placeholder:text-[#c4cad4]" placeholder="Заголовок" />
                           </div>
                           <textarea value={v.desc} onChange={(e) => updateItem("mission.values", idx, "desc", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1.5 text-[12px] text-[#1a1f36] outline-none min-h-[50px] resize-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" placeholder="Описание..." />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Values Tab */}
         {activeTab === "values" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                        <div>
                          <h3 className="text-[11px] font-bold text-[#1a1f36]">Ценности</h3>
                          <p className="text-[10px] text-[#a3acb9] mt-0.5">Ключевые ценности компании</p>
                        </div>
                     </div>
                     <button onClick={() => addItem("values", { icon: "Award", title: "", description: "" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold">
                        <Plus className="w-3.5 h-3.5" />
                        Добавить
                     </button>
                  </div>

                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                     {data.values.map((v: any, idx: number) => (
                        <div key={idx} className="group relative bg-[#f7f8f9] p-3 rounded-lg border border-[#e3e8ee] space-y-2 overflow-visible transition-all hover:border-[#2c3b6e]">
                           <button onClick={() => setDeleteModal({ show: true, section: "values", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                           <div className="flex items-center gap-2">
                              <div className="group/icon relative flex-shrink-0">
                                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e] transition-all">
                                    {React.createElement(ICON_MAP[v.icon] || Award, { className: "w-4 h-4" })}
                                 </div>
                                 <div className="absolute top-0 right-full mr-2 p-2 bg-white border border-[#e3e8ee] rounded-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all grid grid-cols-4 gap-1 z-[60] w-40">
                                    {Object.keys(ICON_MAP).slice(0, 12).map(iconName => {
                                       const Icon = ICON_MAP[iconName];
                                       return (
                                          <button key={iconName} onClick={() => updateItem("values", idx, "icon", iconName)} className={cn("p-1.5 rounded-md transition-all hover:bg-[#f7f8f9]", v.icon === iconName ? "bg-[#2c3b6e] text-white" : "text-[#a3acb9]")}>
                                             <Icon className="w-3.5 h-3.5" />
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                              <input value={v.title} onChange={(e) => updateItem("values", idx, "title", e.target.value)} className="bg-transparent border-none p-0 text-[12px] font-bold text-[#1a1f36] outline-none placeholder:text-[#c4cad4]" placeholder="Заголовок" />
                           </div>
                           <textarea value={v.description} onChange={(e) => updateItem("values", idx, "description", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1.5 text-[12px] text-[#1a1f36] outline-none min-h-[45px] resize-none leading-relaxed focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" placeholder="Описание..." />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* History Tab */}
         {activeTab === "history" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                        <div>
                          <h3 className="text-[11px] font-bold text-[#1a1f36]">История</h3>
                          <p className="text-[10px] text-[#a3acb9] mt-0.5">Важные события компании по годам</p>
                        </div>
                     </div>
                     <button onClick={() => addItem("milestones", { year: "", title: "" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"><Plus className="w-3.5 h-3.5" /> Добавить</button>
                  </div>
                  <div className="p-4 space-y-2">
                     {data.milestones.map((m: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center group bg-[#f7f8f9] p-3 rounded-lg border border-[#e3e8ee] transition-all hover:border-[#2c3b6e]">
                           <div className="w-14">
                              <input value={m.year} onChange={(e) => updateItem("milestones", idx, "year", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1.5 text-[11px] font-bold text-[#2c3b6e] text-center outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" placeholder="2024" />
                           </div>
                           <input value={m.title} onChange={(e) => updateItem("milestones", idx, "title", e.target.value)} className="flex-1 bg-transparent border-none p-0 text-[13px] font-medium text-[#1a1f36] outline-none placeholder:text-[#c4cad4]" placeholder="Событие" />
                           <button onClick={() => setDeleteModal({ show: true, section: "milestones", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* Team Tab */}
         {activeTab === "team" && (
            <div className="space-y-4">
               <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                        <div>
                          <h3 className="text-[11px] font-bold text-[#1a1f36]">Наша команда</h3>
                          <p className="text-[10px] text-[#a3acb9] mt-0.5">Карточки сотрудников на странице /about</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => addItem("team", { name: "", role: "", image: "" })} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"
                     >
                        <UserPlus className="w-3.5 h-3.5" />
                        Добавить
                     </button>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     {data.team.map((m: any, idx: number) => (
                        <div key={idx} className="group relative bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg p-4 space-y-3 transition-all hover:border-[#2c3b6e]">
                           <button onClick={() => setDeleteModal({ show: true, section: "team", idx })} className="absolute top-2 right-2 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg">
                              <X className="w-4 h-4" />
                           </button>
                           <div className="flex gap-4 items-start">
                              <div className="w-20 h-20 bg-white border border-[#e3e8ee] rounded-lg overflow-hidden flex-shrink-0 relative group/photo">
                                 {m.image ? <img src={m.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-8 h-8" /></div>}
                                 <button onClick={() => { setUploadingIdx(idx); fileInputRef.current?.click(); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-opacity"><Upload className="w-5 h-5" /></button>
                              </div>
                              <div className="flex-1 grid grid-cols-1 gap-3">
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Имя и фамилия</label>
                                    <input value={m.name} placeholder="Иван Иванов" onChange={(e) => updateItem("team", idx, "name", e.target.value)} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Должность</label>
                                    <input value={m.role} placeholder="Генеральный директор" onChange={(e) => updateItem("team", idx, "role", e.target.value)} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-semibold text-[#a3acb9] tracking-wider">URL фотографии</label>
                                    <input value={m.image} placeholder="https://..." onChange={(e) => updateItem("team", idx, "image", e.target.value)} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[11px] text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && createPortal(
        <>
          <div onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="fixed inset-0 z-[99999] bg-[#1a1f36]/60 backdrop-blur-md" />
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none">
             <div className="relative w-full max-w-sm bg-white rounded-xl overflow-hidden border border-[#e3e8ee] pointer-events-auto">
                <div className="p-6 text-center">
                   <div className="w-14 h-14 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6 text-[#cd5c5c]" />
                   </div>
                   <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Удалить элемент?</h3>
                   <p className="text-[13px] text-[#4f566b] leading-relaxed mb-6">Элемент будет удалён из раздела. Это действие нельзя отменить.</p>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="flex-1 py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[13px] hover:bg-[#e3e8ee] transition-all">Отмена</button>
                      <button onClick={confirmDelete} className="flex-1 py-3 bg-[#cd5c5c] text-white rounded-xl font-bold text-[13px] hover:bg-[#b04b4b] transition-all">Да, удалить</button>
                   </div>
                </div>
             </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
