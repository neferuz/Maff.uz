"use client";
import { toast } from "react-hot-toast";
import { 
  Save, 
  Phone, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Globe, 
  Send,
  MessageCircle,
  Sparkles,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

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
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
        toast.success("Изменения успешно сохранены!");
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setErrorMsg("Не удалось сохранить данные");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 text-left px-4">
      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]"
          >
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[13px] font-bold tracking-tight">Изменения сохранены в базе!</span>
             </div>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]"
          >
             <div className="flex items-center gap-3 px-6 py-3 bg-[#cd5c5c] text-white rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                <AlertCircle className="w-4 h-4 text-white" />
                <span className="text-[13px] font-bold tracking-tight">{errorMsg}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e3e8ee] pb-4 -mt-2">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Управление футером (Подвалом сайта)</h1>
          <p className="text-[12px] text-[#4f566b]">Глобальные контактные данные, социальные сети и описание внизу всех страниц</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-lg transition-all border shadow-none",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] border-[#2c3b6e] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border-[#e3e8ee]"
          )}
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        
         {/* Main Footer Info Card */}
         <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
            <div className="flex items-center gap-2 mb-2 border-b border-[#f7f8f9] pb-3">
               <Layout className="w-4 h-4 text-[#2c3b6e]" />
               <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Основная информация</h3>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание бренда</label>
               <textarea 
                 rows={3} 
                 value={data.description} 
                 onChange={(e) => setData({...data, description: e.target.value})} 
                 placeholder="Введите описание компании для левой колонки футера..."
                 className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all leading-relaxed" 
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <Phone className="w-3 h-3 text-[#2c3b6e]" /> Телефон
                  </label>
                  <input 
                    type="text" 
                    value={data.phone} 
                    onChange={(e) => setData({...data, phone: e.target.value})} 
                    placeholder="+998 71 205 54 54"
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all font-semibold text-[#1a1f36]" 
                  />
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <MapPin className="w-3 h-3 text-[#2c3b6e]" /> Адрес
                  </label>
                  <input 
                    type="text" 
                    value={data.address} 
                    onChange={(e) => setData({...data, address: e.target.value})} 
                    placeholder="г. Ташкент, ул. Уста Ширин"
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all font-semibold text-[#1a1f36]" 
                  />
               </div>
            </div>
         </div>

         {/* Social Networks Links */}
         <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
            <div className="flex items-center gap-2 mb-2 border-b border-[#f7f8f9] pb-3">
               <Globe className="w-4 h-4 text-[#2c3b6e]" />
               <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Социальные сети</h3>
            </div>

            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <Send className="w-3 h-3 text-[#0088cc]" /> Telegram URL
                  </label>
                  <input 
                    type="text" 
                    value={data.telegram} 
                    onChange={(e) => setData({...data, telegram: e.target.value})} 
                    placeholder="https://t.me/..."
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all text-blue-600 font-medium" 
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <InstagramIcon className="w-3.5 h-3.5 text-[#e1306c]" /> Instagram URL
                  </label>
                  <input 
                    type="text" 
                    value={data.instagram} 
                    onChange={(e) => setData({...data, instagram: e.target.value})} 
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all text-pink-600 font-medium" 
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <FacebookIcon className="w-3.5 h-3.5 text-[#1877f2]" /> Facebook URL
                  </label>
                  <input 
                    type="text" 
                    value={data.facebook} 
                    onChange={(e) => setData({...data, facebook: e.target.value})} 
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all text-blue-800 font-medium" 
                  />
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
