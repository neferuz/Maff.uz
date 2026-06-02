"use client";
import { 
  Save, Handshake, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Layout, ArrowRight, ChevronRight, Type, Handshake as HandshakeIcon, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <HandshakeIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Партнеры</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Партнерская программа</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
           
           {/* Hero Editor Card */}
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="bg-[#f7f8f9] px-4 py-3 border-b border-[#e3e8ee] flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <Type className="w-4 h-4" />
                 </div>
                 <h3 className="text-[13px] font-bold text-[#1a1f36]">Общий контент</h3>
              </div>
              
              <div className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Главный заголовок</label>
                       <input 
                         value={pageData.title} 
                         onChange={(e) => updateField("title", e.target.value)}
                         className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Надзаголовок</label>
                       <input 
                         value={pageData.subtitle} 
                         onChange={(e) => updateField("subtitle", e.target.value)}
                         className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#2c3b6e] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                    <textarea 
                      value={pageData.description} 
                      onChange={(e) => updateField("description", e.target.value)}
                      rows={2}
                      className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[12px] text-[#1a1f36] font-medium outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none leading-relaxed"
                    />
                 </div>
              </div>
           </div>

           {/* Categories List */}
           <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <h3 className="text-[11px] font-bold text-[#4f566b] tracking-wider">Категории</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pageData.partnerTypes.map((type, idx) => (
                    <div key={type.slug} className="group bg-white border border-[#e3e8ee] rounded-xl p-4 hover:border-[#2c3b6e] transition-all flex flex-col h-full">
                       <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee]">
                             <Handshake className="w-4 h-4" />
                          </div>
                          <Link 
                            href={`/partners/${type.slug}`}
                            className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#a3acb9] hover:text-[#2c3b6e] transition-all"
                          >
                             <ChevronRight className="w-4 h-4" />
                          </Link>
                       </div>
                       
                       <input 
                         value={type.title} 
                         onChange={(e) => updateType(idx, "title", e.target.value)}
                         className="w-full bg-transparent border-none p-0 text-[14px] font-bold text-[#1a1f36] outline-none mb-1 placeholder:text-[#c4cad4]"
                         placeholder="Заголовок"
                       />
                       <textarea 
                         value={type.description} 
                         onChange={(e) => updateType(idx, "description", e.target.value)}
                         rows={2}
                         className="w-full bg-transparent border-none p-0 text-[11px] text-[#4f566b] font-medium leading-snug outline-none resize-none flex-1"
                         placeholder="Краткое описание"
                       />
                       
                       <div className="mt-3 pt-3 border-t border-[#e3e8ee]">
                          <Link href={`/partners/${type.slug}`} className="text-[10px] font-semibold text-[#2c3b6e] flex items-center gap-1 hover:gap-1.5 transition-all group/btn">
                             Изменить <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Link>
                       </div>
                    </div>
                 ))}
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
