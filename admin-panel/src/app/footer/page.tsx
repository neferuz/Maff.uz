"use client";
import { 
  Save, 
  RefreshCw, 
  AlertCircle, 
  Globe, 
  Layout,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

const DEFAULT_FOOTER = {
  description: "Ведущий дистрибьютор напольных покрытий и дверей в Узбекистане. 20 лет опыта, 17 международных брендов и безупречный сервис.",
  phone: "+998 71 205 54 54",
  address: "г. Ташкент, ул. Уста Ширин",
  telegram: "https://t.me/maffuzbekistan",
  instagram: "https://www.instagram.com/maff.uz?igsh=MTJ5b2VwbHl1eTBodQ%3D%3D&utm_source=qr",
  facebook: "https://www.facebook.com/maff.uzb/?locale=ru_RU"
};

export default function FooterEditor() {
  const [data, setData] = useState<any>(DEFAULT_FOOTER);
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
      const response = await fetch("/api/v1/pages/footer");
      if (response.ok) {
        const result = await response.json();
        const content = result.content || DEFAULT_FOOTER;
        setData(content);
        setOriginalData(JSON.parse(JSON.stringify(content)));
      } else {
        setData(DEFAULT_FOOTER);
        setOriginalData(JSON.parse(JSON.stringify(DEFAULT_FOOTER)));
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch footer data:", err);
      setData(DEFAULT_FOOTER);
      setOriginalData(JSON.parse(JSON.stringify(DEFAULT_FOOTER)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          slug: "footer",
          content: data
        }),
      });

      if (response.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setErrorMsg("Не удалось сохранить данные");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения к серверу");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 text-left">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <Layout className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Футер</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Контакты, соцсети и описание</p>
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

      <div className="max-w-3xl space-y-6">
        
         {/* Main Footer Info Card */}
         <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 min-h-8">
               <Layout className="w-4 h-4 text-[#2c3b6e]" />
               <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Основная информация</h3>
            </div>
            
            <div className="space-y-1">
               <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Описание бренда</label>
               <textarea 
                 rows={3} 
                 value={data.description} 
                 onChange={(e) => setData({...data, description: e.target.value})} 
                 placeholder="Введите описание компании..."
                 className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all leading-relaxed text-[#1a1f36]" 
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Телефон</label>
                  <input 
                    type="text" 
                    value={data.phone} 
                    onChange={(e) => setData({...data, phone: e.target.value})} 
                    placeholder="+998 71 205 54 54"
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all font-semibold text-[#1a1f36]" 
                  />
               </div>
               
               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Адрес</label>
                  <input 
                    type="text" 
                    value={data.address} 
                    onChange={(e) => setData({...data, address: e.target.value})} 
                    placeholder="г. Ташкент, ул. Уста Ширин"
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all font-semibold text-[#1a1f36]" 
                  />
               </div>
            </div>
         </div>

         {/* Social Networks Links */}
         <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 min-h-8">
               <Globe className="w-4 h-4 text-[#2c3b6e]" />
               <h3 className="text-[13px] font-bold text-[#1a1f36] tracking-wider">Социальные сети</h3>
            </div>

            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Telegram URL</label>
                  <input 
                    type="text" 
                    value={data.telegram} 
                    onChange={(e) => setData({...data, telegram: e.target.value})} 
                    placeholder="https://t.me/..."
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all text-[#1a1f36]" 
                  />
               </div>

               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Instagram URL</label>
                  <input 
                    type="text" 
                    value={data.instagram} 
                    onChange={(e) => setData({...data, instagram: e.target.value})} 
                    placeholder="https://instagram.com/..."
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all text-[#1a1f36]" 
                  />
               </div>

               <div className="space-y-1">
                  <label className="block h-4 text-[10px] font-semibold text-[#4f566b] tracking-wider truncate">Facebook URL</label>
                  <input 
                    type="text" 
                    value={data.facebook} 
                    onChange={(e) => setData({...data, facebook: e.target.value})} 
                    placeholder="https://facebook.com/..."
                    className="h-9 w-full px-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all text-[#1a1f36]" 
                  />
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
