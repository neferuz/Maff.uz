"use client";
import { toast } from "react-hot-toast";
import { 
  Save, ArrowLeft, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Upload, User, X, PlusCircle, Handshake, Layout, Award, Zap, Type, MessageSquare, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function PartnerTypeEditor({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Data State
  const [data, setData] = useState({
    title: "",
    intro: "",
    content: "",
    detail: "",
    benefits: [] as string[],
    experts: [] as any[]
  });

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    section: string;
    idx: number;
  }>({ show: false, section: "", idx: -1 });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/v1/pages/partner-${slug}`);
      if (response.ok) {
        const result = await response.json();
        if (result.content) {
            setData({
               ...data,
               ...result.content,
               benefits: result.content.benefits || [],
               experts: result.content.experts || []
            });
        }
      } else {
          // Default titles based on slug
          const titles: Record<string, string> = {
             masters: "Мастерам",
             architects: "Архитекторам",
             designers: "Дизайнерам",
             developers: "Застройщикам",
             foremen: "Прорабам",
             dealers: "Дилерам",
             wholesale: "Оптовикам"
          };
          setData({
              title: titles[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
              intro: "",
              content: "",
              detail: "",
              benefits: [],
              experts: []
          });
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
        body: JSON.stringify({ slug: `partner-${slug}`, content: data }),
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
    setData({ ...data, [field]: value });
    setHasChanges(true);
  };

  const addBenefit = () => {
    setData({ ...data, benefits: [...data.benefits, ""] });
    setHasChanges(true);
  };

  const updateBenefit = (idx: number, value: string) => {
    const newBenefits = [...data.benefits];
    newBenefits[idx] = value;
    setData({ ...data, benefits: newBenefits });
    setHasChanges(true);
  };

  const removeBenefit = (idx: number) => {
    setData({ ...data, benefits: data.benefits.filter((_, i) => i !== idx) });
    setHasChanges(true);
  };

  const addExpert = () => {
    const newExpert = {
      id: Date.now(),
      name: "Имя Фамилия",
      specialty: "Мастер-укладчик",
      experience: "5 лет",
      photo: "",
      rating: "5.0"
    };
    setData({ ...data, experts: [...(data.experts || []), newExpert] });
    setHasChanges(true);
  };

  const updateExpert = (idx: number, field: string, value: any) => {
    const newExperts = [...data.experts];
    newExperts[idx] = { ...newExperts[idx], [field]: value };
    setData({ ...data, experts: newExperts });
    setHasChanges(true);
  };

  const confirmDelete = () => {
    if (deleteModal.section === "benefits") {
      removeBenefit(deleteModal.idx);
    } else if (deleteModal.section === "experts") {
      const newExperts = [...data.experts];
      newExperts.splice(deleteModal.idx, 1);
      setData({ ...data, experts: newExperts });
      setHasChanges(true);
    }
    setDeleteModal({ show: false, section: "", idx: -1 });
  };

  const handleFileUpload = async (idx: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/admin-maff/api/v1/uploads", { method: "POST", body: formData });
      if (response.ok) {
        const result = await response.json();
        updateExpert(idx, "photo", result.url);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка")); console.error("Upload failed", err); }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/partners" className="flex items-center gap-2 text-[10px] font-bold text-[#4f566b] uppercase tracking-widest hover:text-[#2c3b6e] transition-colors">
             <ArrowLeft className="w-3 h-3" /> Все категории
          </Link>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Редактор: {data.title}</h1>
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
        
        {/* ── Main Content ── */}
        <div className="lg:col-span-7 space-y-8">
           
           {/* General Settings Card */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none overflow-hidden">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <Layout className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1a1f36]">Общая информация</h3>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Заголовок страницы</label>
                       <input 
                         value={data.title} 
                         onChange={(e) => updateField("title", e.target.value)}
                         className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[14px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Вступление (Intro)</label>
                       <input 
                         value={data.intro} 
                         onChange={(e) => updateField("intro", e.target.value)}
                         className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-bold text-[#2c3b6e] outline-none focus:border-[#2c3b6e]/30"
                         placeholder="Уважаемые мастера..."
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Основное описание</label>
                       <textarea 
                         value={data.content} 
                         onChange={(e) => updateField("content", e.target.value)}
                         rows={4}
                         className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 resize-none leading-relaxed"
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* Experts Section (Only for Masters) */}
           {slug === "masters" && (
             <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none overflow-hidden">
                <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                         <User className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1a1f36]">Список мастеров</h3>
                   </div>
                   <button 
                      onClick={addExpert}
                      className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold text-[#2c3b6e] border border-dashed border-[#2c3b6e]/30 rounded-lg hover:bg-[#2c3b6e]/5 transition-all uppercase tracking-widest"
                   >
                      <PlusCircle className="w-3.5 h-3.5" /> Добавить
                   </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                   {data.experts?.map((expert, idx) => (
                      <div key={expert.id || idx} className="bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl p-4 space-y-4 group relative transition-all hover:bg-white shadow-none">
                         <button 
                           onClick={() => setDeleteModal({ show: true, section: "experts", idx })}
                           className="absolute top-2 right-2 p-1.5 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-lg"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>

                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white border border-[#e3e8ee] overflow-hidden flex-shrink-0 relative group/photo">
                               {expert.photo ? <img src={expert.photo} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-200" />}
                               <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                                  <Upload className="w-4 h-4" />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, e.target.files[0])} />
                               </label>
                            </div>
                            <div className="flex-1 space-y-1">
                               <input 
                                 value={expert.name || ""} 
                                 onChange={(e) => updateExpert(idx, "name", e.target.value)}
                                 className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-[#1a1f36] outline-none"
                                 placeholder="Имя Фамилия"
                               />
                               <input 
                                 value={expert.specialty || ""} 
                                 onChange={(e) => updateExpert(idx, "specialty", e.target.value)}
                                 className="w-full bg-transparent border-none p-0 text-[9px] font-bold text-[#2c3b6e] outline-none uppercase tracking-widest"
                                 placeholder="Специализация"
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Опыт</label>
                               <input value={expert.experience || ""} onChange={(e) => updateExpert(idx, "experience", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1 text-[11px] outline-none" />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Рейтинг</label>
                               <input value={expert.rating || ""} onChange={(e) => updateExpert(idx, "rating", e.target.value)} className="w-full bg-white border border-[#e3e8ee] rounded-lg px-2 py-1 text-[11px] outline-none text-center" />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* Detail Text Block */}
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none overflow-hidden">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                    <MessageSquare className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-[#1a1f36]">Дополнительно (Индивидуальные условия)</h3>
              </div>
              <div className="p-6">
                 <textarea 
                   value={data.detail} 
                   onChange={(e) => updateField("detail", e.target.value)}
                   rows={3}
                   placeholder="Детальное описание условий..."
                   className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 resize-none leading-relaxed"
                 />
              </div>
           </div>
        </div>

        {/* ── Sidebar: Benefits ── */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-white border border-[#e3e8ee] rounded-2xl shadow-none overflow-hidden">
              <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">Выгоды</h3>
                 </div>
                 <button onClick={addBenefit} className="p-1.5 hover:bg-[#2c3b6e]/5 rounded-lg text-[#2c3b6e] transition-all"><Plus className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-3">
                 {data.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                       <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#2c3b6e]/5 flex items-center justify-center text-[#2c3b6e]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                       </div>
                       <input 
                         value={benefit} 
                         onChange={(e) => updateBenefit(idx, e.target.value)}
                         className="flex-1 bg-[#f8f9fa] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30"
                         placeholder="Новая выгода..."
                       />
                       <button onClick={() => setDeleteModal({ show: true, section: "benefits", idx })} className="text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                 ))}
                 {data.benefits.length === 0 && <div className="text-center py-10 text-slate-300 text-[11px] font-bold uppercase tracking-widest border-2 border-dashed border-[#e3e8ee] rounded-xl">Список пуст</div>}
              </div>
           </div>

           <div className="bg-[#2c3b6e]/5 border border-[#2c3b6e]/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3 text-[#2c3b6e]">
                 <Zap className="w-4 h-4" />
                 <h3 className="text-[11px] font-black uppercase tracking-widest">Совет</h3>
              </div>
              <p className="text-[12px] text-[#4f566b] leading-relaxed">
                 Этот контент отображается на фронтенде по адресу: <br />
                 <span className="text-[#2c3b6e] font-bold">/partners/{slug}</span>. <br /><br />
                 Убедитесь, что заголовки соответствуют целевой аудитории (мастера, дизайнеры и т.д.).
              </p>
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
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {deleteModal.show && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="absolute inset-0 bg-[#1a1f36]/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white rounded-[2rem] overflow-hidden border border-[#e3e8ee] shadow-2xl">
                  <div className="p-8 text-center">
                     <div className="w-16 h-16 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-8 h-8 text-[#cd5c5c]" /></div>
                     <h3 className="text-xl font-bold text-[#1a1f36] mb-3">Удалить элемент?</h3>
                     <p className="text-[13px] text-[#4f566b] leading-relaxed mb-8">Это действие нельзя отменить. Подтвердите удаление выбранного элемента.</p>
                     <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ ...deleteModal, show: false })} className="flex-1 py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[13px]">Отмена</button>
                        <button onClick={confirmDelete} className="flex-1 py-3 bg-[#cd5c5c] text-white rounded-xl font-bold text-[13px]">Удалить</button>
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
