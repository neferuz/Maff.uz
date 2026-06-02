"use client";
import { toast } from "react-hot-toast";
import { 
  Save, Handshake, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Layout, ArrowRight, ChevronRight, Type
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PartnersEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Main Page Content
  const [pageData, setPageData] = useState({
    title: "Развивайте бизнес вместе с MAFF",
    subtitle: "Сотрудничество",
    description: "Мы создаем экосистему для профессионалов рынка отделочных материалов. Выберите свою категорию, чтобы узнать о преимуществах работы с нами.",
    partnerTypes: [
      { slug: "masters", title: "Мастерам", description: "Специальные условия для профессиональных монтажников и укладчиков." },
      { slug: "developers", title: "Застройщикам", description: "Комплексные решения для строительных компаний и девелоперов." },
      { slug: "designers", title: "Дизайнерам", description: "Эксклюзивные каталоги и гибкие условия для дизайн-студий и архитекторов." },
      { slug: "foremen", title: "Прорабам", description: "Надежные поставки и техническая поддержка для руководителей объектов." },
      { slug: "dealers", title: "Дилерам", description: "Возможность стать официальным представителем ведущих брендов в вашем регионе." },
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/partners-main");
      if (response.ok) {
        const result = await response.json();
        if (result.content) setPageData(result.content);
        setHasChanges(false);
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
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ slug: "partners-main", content: pageData }),
      });

      if (response.ok) {
        toast.success("Изменения успешно сохранены!");
        setHasChanges(false);
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

  const updateField = (field: string, value: any) => {
    setPageData({ ...pageData, [field]: value });
    setHasChanges(true);
  };

  const updateType = (idx: number, field: string, value: string) => {
    const newTypes = [...pageData.partnerTypes];
    newTypes[idx] = { ...newTypes[idx], [field]: value };
    setPageData({ ...pageData, partnerTypes: newTypes });
    setHasChanges(true);
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Партнерская программа</h1>
          <p className="text-[13px] text-[#4f566b] font-medium">Управление общим контентом и категориями партнеров.</p>
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
        <div className="lg:col-span-12 space-y-6">
           
           {/* Hero Editor Card */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl overflow-hidden shadow-none">
              <div className="bg-[#f7f8f9] px-6 py-3 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <Type className="w-4 h-4" />
                 </div>
                 <h3 className="text-base font-bold text-[#1a1f36]">Общий контент (Hero)</h3>
              </div>
              
              <div className="p-5 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Главный заголовок</label>
                       <input 
                         value={pageData.title} 
                         onChange={(e) => updateField("title", e.target.value)}
                         className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Надзаголовок</label>
                       <input 
                         value={pageData.subtitle} 
                         onChange={(e) => updateField("subtitle", e.target.value)}
                         className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e]/30 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Описание</label>
                    <textarea 
                      value={pageData.description} 
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={2}
                      className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[12px] text-[#4f566b] font-medium outline-none focus:border-[#2c3b6e]/30 transition-all resize-none leading-relaxed"
                    />
                 </div>
              </div>
           </div>

           {/* Categories List */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Категории:</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pageData.partnerTypes.map((type, idx) => (
                    <div key={type.slug} className="group bg-white border border-[#e3e8ee] rounded-xl p-4 hover:border-[#2c3b6e]/30 transition-all shadow-none flex flex-col h-full">
                       <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee]">
                             <Handshake className="w-4 h-4" />
                          </div>
                          <Link 
                            href={`/partners/${type.slug}`}
                            className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-slate-300 hover:text-[#2c3b6e] transition-all"
                          >
                             <ChevronRight className="w-4 h-4" />
                          </Link>
                       </div>
                       
                       <input 
                         value={type.title} 
                         onChange={(e) => updateType(idx, "title", e.target.value)}
                         className="w-full bg-transparent border-none p-0 text-[14px] font-bold text-[#1a1f36] outline-none mb-1"
                         placeholder="Заголовок"
                       />
                       <textarea 
                         value={type.description} 
                         onChange={(e) => updateType(idx, "description", e.target.value)}
                         rows={2}
                         className="w-full bg-transparent border-none p-0 text-[11px] text-[#4f566b] font-medium leading-snug outline-none resize-none flex-1"
                         placeholder="Краткое описание"
                       />
                       
                       <div className="mt-3 pt-3 border-t border-slate-50">
                          <Link href={`/partners/${type.slug}`} className="text-[8px] font-black uppercase tracking-widest text-[#2c3b6e] flex items-center gap-1 hover:gap-1.5 transition-all group/btn">
                             Изменить <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                       </div>
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
                <span className="text-[13px] font-bold">Изменения сохранены!</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
