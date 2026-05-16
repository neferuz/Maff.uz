"use client";

import { 
  Save, Plus, Trash2, RefreshCw, Check, Type, Share2, Globe, Sparkles, Info, ExternalLink, Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

/* ── Custom Icons (Robust for any version) ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

const availableIcons = [
  { name: "Instagram", icon: InstagramIcon },
  { name: "Telegram", icon: TelegramIcon },
  { name: "TikTok", icon: TikTokIcon },
  { name: "Youtube", icon: YoutubeIcon },
  { name: "Globe", icon: Globe },
  { name: "Share2", icon: Share2 },
  { name: "Link", icon: LinkIcon },
];

const DEFAULT_LINKS = [
  { id: "1", name: "Instagram", username: "@maff.uz", desc: "Тренды, новинки и живые обзоры интерьеров", href: "https://instagram.com/maff.uz", icon: "Instagram" },
  { id: "2", name: "Telegram", username: "Maff | Мебель и Дизайн", desc: "Эксклюзивные предложения и быстрая связь с нами", href: "https://t.me/maff_uz", icon: "Telegram" },
  { id: "3", name: "TikTok", username: "@maff.uz", desc: "Короткие видео и вдохновение на каждый день", href: "https://tiktok.com/@maff.uz", icon: "TikTok" },
  { id: "4", name: "Youtube", username: "MAFF Interior", desc: "Обзоры наших проектов и советы по дизайну", href: "https://youtube.com/c/maff_uz", icon: "Youtube" }
];

export default function SocialsEditor() {
  const [data, setData] = useState<any>({
    header: { title: "Мы в социальных сетях", subtitle: "Следите за нами там, где вам удобно" },
    links: DEFAULT_LINKS
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
      const response = await fetch("/api/v1/pages/socials");
      if (response.ok) {
        const result = await response.json();
        const content = result.content || {
          header: { title: "Мы в социальных сетях", subtitle: "Следите за нами там, где вам удобно" },
          links: DEFAULT_LINKS
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
          slug: "socials",
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

  const addItem = () => {
    setData({ 
      ...data, 
      links: [
        ...data.links, 
        { id: Date.now().toString(), name: "Новая сеть", username: "@handle", desc: "Описание", href: "https://", icon: "Link" }
      ] 
    });
  };

  const removeItem = (idx: number) => {
    const next = data.links.filter((_: any, i: number) => i !== idx);
    setData({ ...data, links: next });
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const next = [...data.links];
    next[idx][field] = value;
    setData({ ...data, links: next });
  };

  const openLink = (url: string) => {
    if (typeof window !== "undefined" && url && url.length > 8 && url.startsWith("http")) {
      try {
        // Simple check to see if it's a valid URL format
        new URL(url);
        window.open(url, "_blank");
      } catch (e) {
        console.error("Invalid URL:", url);
      }
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
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Управление соцсетями</h1>
          <p className="text-[12px] text-[#4f566b]">Редактирование страницы maff.uz/socials</p>
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
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white transition-all font-bold text-[#1a1f36]" 
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    rows={2} 
                    value={data.header.subtitle} 
                    onChange={(e) => setData({...data, header: {...data.header, subtitle: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white transition-all" 
                  />
               </div>
            </div>

            {/* Links Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <Share2 className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Список социальных сетей</h3>
                  </div>
                  <button 
                    onClick={addItem} 
                    className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold shadow-none"
                  >
                     <Plus className="w-3 h-3" />
                     Добавить сеть
                  </button>
               </div>

               <div className="space-y-4">
                  {data.links.map((item: any, idx: number) => (
                    <div key={item.id} className="p-5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-2xl relative group transition-all hover:border-[#2c3b6e]/30">
                       <button 
                         onClick={() => removeItem(idx)} 
                         className="absolute top-3 right-3 p-1.5 bg-white rounded-lg text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee] hover:bg-red-50"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>

                       <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Название</label>
                                <input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[12px] font-bold text-[#1a1f36] outline-none" />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Никнейм / Хэндл</label>
                                <div className="relative">
                                   <input value={item.username} onChange={(e) => updateItem(idx, "username", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg pl-3 pr-8 py-2 text-[12px] font-bold text-[#2c3b6e] outline-none" />
                                   <button 
                                     onClick={() => openLink(item.href)}
                                     title="Проверить ссылку"
                                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2c3b6e]/5 rounded-md text-[#2c3b6e] transition-colors"
                                   >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Ссылка (URL)</label>
                             <div className="relative group/url">
                                <input value={item.href} onChange={(e) => updateItem(idx, "href", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg pl-8 pr-8 py-2 text-[11px] font-medium text-slate-600 outline-none" />
                                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within/url:text-[#2c3b6e]" />
                                <button 
                                  onClick={() => openLink(item.href)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2c3b6e]/5 rounded-md text-[#2c3b6e] transition-colors"
                                >
                                   <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                             <textarea rows={2} value={item.desc} onChange={(e) => updateItem(idx, "desc", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[11px] font-medium text-slate-500 outline-none resize-none" />
                          </div>
                          
                          {/* Icon Selector */}
                          <div className="space-y-2">
                             <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Иконка</label>
                             <div className="flex flex-wrap gap-2">
                                {availableIcons.map(iconObj => (
                                   <button 
                                     key={iconObj.name} 
                                     onClick={() => updateItem(idx, "icon", iconObj.name)} 
                                     className={cn(
                                       "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                                       item.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e] shadow-md shadow-blue-900/20" : "bg-white text-slate-300 border-[#e3e8ee] hover:border-slate-400"
                                     )}
                                   >
                                      <iconObj.icon className="w-4 h-4" />
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
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e3e8ee] shadow-sm">
                  <Sparkles className="w-6 h-6 text-[#2c3b6e]" />
               </div>
               <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider mb-2">Ваш социальный хаб</h3>
               <p className="text-[11px] text-[#4f566b] font-medium leading-relaxed max-w-xs mx-auto">
                  Эти настройки управляют страницей maff.uz/socials. Добавляйте только активные ссылки, чтобы клиенты могли легко найти вас во всех сетях.
               </p>
            </div>

            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Подсказка</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed">
                  Используйте короткие и понятные описания для каждой соцсети. Например: «Наши интерьеры в Reels» или «Быстрые ответы в Telegram».
               </p>
            </div>
         </div>

      </div>
    </div>
  );
}
