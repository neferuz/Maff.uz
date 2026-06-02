"use client";
import { toast } from "react-hot-toast";
import { 
  Save, Plus, Trash2, RefreshCw, Check, Type, Share2, Globe, Sparkles, Info, ExternalLink, Link as LinkIcon, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

/* ── Custom Icons (Robust for any version) ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
        toast.success("Изменения успешно сохранены!");
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setErrorMsg("Не удалось сохранить");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
        new URL(url);
        window.open(url, "_blank");
      } catch (e) {
      toast.error("Произошла ошибка: " + (e instanceof Error ? e.message : "Неизвестная ошибка"));
        console.error("Invalid URL:", url);
      }
    }
  };

  const handleFileUpload = async (idx: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadToastId = toast.loading("Загрузка иконки...");
      
      const response = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        updateItem(idx, "icon", result.url);
        toast.success("Иконка загружена", { id: uploadToastId });
      } else {
        toast.error("Не удалось загрузить изображение", { id: uploadToastId });
      }
    } catch (err) {
      toast.error("Ошибка сети при загрузке: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-24 text-left">
      
      {/* Success Toast */}
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

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Управление соцсетями</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">maff.uz / socials</p>
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

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
         
         {/* Page Header Content */}
         <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                  <div>
                    <h3 className="text-[11px] font-bold text-[#1a1f36]">Шапка страницы</h3>
                    <p className="text-[10px] text-[#a3acb9] mt-0.5">Заголовок и подзаголовок в начале страницы /socials</p>
                  </div>
               </div>
               <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Главный заголовок</label>
                     <input 
                       type="text" 
                       value={data.header.title} 
                       placeholder="Напр: Мы в социальных сетях"
                       onChange={(e) => setData({...data, header: {...data.header, title: e.target.value}})} 
                       className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all font-bold text-[#1a1f36] placeholder:font-normal placeholder:text-[#c4cad4]" 
                     />
                     <p className="text-[10px] text-[#a3acb9]">Крупный текст в шапке страницы</p>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                     <textarea 
                       rows={1} 
                       value={data.header.subtitle} 
                       placeholder="Напр: Следите за нами там, где вам удобно"
                       onChange={(e) => setData({...data, header: {...data.header, subtitle: e.target.value}})} 
                       className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:bg-white focus:border-[#2c3b6e] transition-all min-h-[42px] placeholder:text-[#c4cad4]" 
                     />
                     <p className="text-[10px] text-[#a3acb9]">Подзаголовок под основным текстом</p>
                  </div>
               </div>
            </div>

            {/* Links Section */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                     <div>
                       <h3 className="text-[11px] font-bold text-[#1a1f36]">Социальные сети</h3>
                       <p className="text-[10px] text-[#a3acb9] mt-0.5">Карточки с ссылками на ваши соцсети</p>
                     </div>
                  </div>
                  <button 
                    onClick={addItem} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold"
                  >
                     <Plus className="w-3.5 h-3.5" />
                     Добавить
                  </button>
               </div>

               <div className="p-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {data.links.map((item: any, idx: number) => (
                    <div key={item.id} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl relative group transition-all hover:border-[#2c3b6e]">
                       <button 
                         onClick={() => removeItem(idx)} 
                         className="absolute top-2.5 right-2.5 p-1.5 bg-white rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]"
                       >
                          <Trash2 className="w-3 h-3" />
                       </button>

                       <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-[#4f566b] tracking-wider">Название</label>
                                <input value={item.name} placeholder="Instagram" onChange={(e) => updateItem(idx, "name", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-2 text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                             </div>
                             <div className="space-y-1">
                                <label className="text-[9px] font-semibold text-[#4f566b] tracking-wider">Никнейм</label>
                                <div className="relative">
                                   <input value={item.username} placeholder="@maff.uz" onChange={(e) => updateItem(idx, "username", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg pl-2.5 pr-8 py-2 text-[12px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                                   <button 
                                     onClick={() => openLink(item.href)}
                                     title="Проверить ссылку"
                                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2c3b6e]/5 rounded-md text-[#2c3b6e] transition-colors"
                                   >
                                      <ExternalLink className="w-3 h-3" />
                                   </button>
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                             <label className="text-[9px] font-semibold text-[#4f566b] tracking-wider">Ссылка (URL)</label>
                             <div className="relative group/url">
                                <input value={item.href} placeholder="https://..." onChange={(e) => updateItem(idx, "href", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg pl-7 pr-8 py-2 text-[11px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a3acb9] group-focus-within/url:text-[#2c3b6e]" />
                                <button 
                                  onClick={() => openLink(item.href)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2c3b6e]/5 rounded-md text-[#2c3b6e] transition-colors"
                                >
                                   <ExternalLink className="w-3 h-3" />
                                </button>
                             </div>
                          </div>

                          <div className="space-y-1">
                             <label className="text-[9px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                             <textarea rows={2} value={item.desc} placeholder="Короткое описание..." onChange={(e) => updateItem(idx, "desc", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2.5 py-2 text-[11px] font-medium text-[#1a1f36] outline-none resize-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                          </div>
                          
                          {/* Icon Selector */}
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-semibold text-[#4f566b] tracking-wider">Иконка</label>
                             <div className="flex flex-wrap items-center gap-2">
                                {availableIcons.map(iconObj => (
                                   <button 
                                     key={iconObj.name} 
                                     onClick={() => updateItem(idx, "icon", iconObj.name)} 
                                     className={cn(
                                       "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                                       item.icon === iconObj.name ? "bg-[#2c3b6e] text-white border-[#2c3b6e]" : "bg-white text-[#a3acb9] border-[#e3e8ee] hover:border-[#2c3b6e]"
                                     )}
                                     title={iconObj.name}
                                   >
                                      <iconObj.icon className="w-4 h-4" />
                                   </button>
                                ))}
                                
                                {/* Custom Image Upload */}
                                <div 
                                  className={cn(
                                    "relative w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-colors cursor-pointer group/upload",
                                    item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/'))
                                      ? "border-[#2c3b6e] overflow-hidden" 
                                      : "border-[#e3e8ee] bg-[#f7f8f9] hover:bg-white hover:border-[#2c3b6e]"
                                  )}
                                  title="Загрузить свое фото/иконку"
                                >
                                  {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
                                    <>
                                      <img src={item.icon} alt="icon" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    </>
                                  ) : (
                                    <Upload className="w-3.5 h-3.5 text-[#a3acb9] group-hover/upload:text-[#2c3b6e]" />
                                  )}
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => {
                                          if (e.target.files?.[0]) handleFileUpload(idx, e.target.files[0]);
                                      }}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

      </div>
    </div>
  );
}
