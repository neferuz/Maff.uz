"use client";
import { toast } from "react-hot-toast";
import { 
  Save, 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCw,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function ShowroomsEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data State
  const [showrooms, setShowrooms] = useState<any[]>([]);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    idx: number;
  }>({ show: false, idx: -1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/showrooms");
      if (response.ok) {
        const result = await response.json();
        const content = result.content;
        setShowrooms(Array.isArray(content) ? content : []);
        setHasChanges(false);
      } else {
        setShowrooms([]);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch data:", err);
      setShowrooms([]);
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
        body: JSON.stringify({
          slug: "showrooms",
          content: showrooms
        }),
      });

      if (response.ok) {
        toast.success("Изменения успешно сохранены!");
        setHasChanges(false);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || "Не удалось сохранить");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      setErrorMsg("Ошибка подключения к серверу");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const addShowroom = () => {
    const newShowroom = {
      id: Date.now(),
      name: "Новый шоу-рум",
      address: "г. Ташкент, ...",
      phone: "+998 (...) ...",
      hours: "09:00 – 20:00 (Ежедневно)",
      mapUrl: ""
    };
    setShowrooms([...showrooms, newShowroom]);
    setHasChanges(true);
  };

  const removeShowroom = (idx: number) => {
    const newData = showrooms.filter((_, i) => i !== idx);
    setShowrooms(newData);
    setHasChanges(true);
  };

  const updateShowroom = (idx: number, field: string, value: any) => {
    const newData = [...showrooms];
    newData[idx] = { ...newData[idx], [field]: value };
    setShowrooms(newData);
    setHasChanges(true);
  };

  const confirmDelete = () => {
    removeShowroom(deleteModal.idx);
    setDeleteModal({ show: false, idx: -1 });
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Управление Шоу-румами</h1>
          <p className="text-[14px] text-[#4f566b]">Настройка адресов и контактов выставочных залов.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleSave}
             disabled={loading || !hasChanges}
             className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
           >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить изменения
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {showrooms.map((s, idx) => (
          <motion.div 
            key={s.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e3e8ee] rounded-2xl overflow-hidden shadow-none flex flex-col"
          >
            <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between gap-4">
               <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#2c3b6e] flex items-center justify-center text-white">
                     <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    value={s.name} 
                    onChange={(e) => updateShowroom(idx, "name", e.target.value)}
                    className="bg-transparent text-[15px] font-bold text-[#1a1f36] outline-none border-b border-transparent focus:border-[#2c3b6e]/30 px-1 py-0.5 flex-1"
                    placeholder="Название шоу-рума"
                  />
               </div>
               <button 
                 onClick={() => setDeleteModal({ show: true, idx })}
                 className="p-2 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            <div className="p-6 space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Адрес
                     </label>
                     <textarea 
                       value={s.address} 
                       onChange={(e) => updateShowroom(idx, "address", e.target.value)}
                       rows={2}
                       className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all resize-none"
                     />
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                           <Phone className="w-3 h-3" /> Телефон
                        </label>
                        <input 
                          value={s.phone} 
                          onChange={(e) => updateShowroom(idx, "phone", e.target.value)}
                          className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3 h-3" /> Режим работы
                        </label>
                        <input 
                          value={s.hours} 
                          onChange={(e) => updateShowroom(idx, "hours", e.target.value)}
                          className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f566b] outline-none focus:border-[#2c3b6e]/30 transition-all"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                     <Navigation className="w-3 h-3" /> Google Maps Embed URL
                  </label>
                  <input 
                    value={s.mapUrl} 
                    onChange={(e) => updateShowroom(idx, "mapUrl", e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[11px] text-[#2c3b6e] font-mono outline-none focus:border-[#2c3b6e]/30 transition-all"
                  />
                  <p className="text-[9px] text-[#a3acb9] font-medium">Скопируйте `src` из кода вставки Google Maps.</p>
               </div>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={addShowroom}
          className="h-full min-h-[250px] border-2 border-dashed border-[#2c3b6e]/20 bg-[#2c3b6e]/5 rounded-2xl text-[#2c3b6e] hover:bg-[#2c3b6e]/10 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[15px] font-bold">Добавить новый шоу-рум</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">Данные шоу-румов сохранены!</span>
             </div>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#cd5c5c] text-white rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><AlertCircle className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">{errorMsg}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {mounted && typeof document !== 'undefined' && require('react-dom').createPortal(
        <AnimatePresence>
          {deleteModal.show && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setDeleteModal({ show: false, idx: -1 })}
                 className="absolute inset-0 bg-[#1a1f36]/60 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden border border-[#e3e8ee] shadow-2xl"
               >
                  <div className="p-8 text-center">
                     <div className="w-20 h-20 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-10 h-10 text-[#cd5c5c]" />
                     </div>
                     <h3 className="text-2xl font-bold text-[#1a1f36] mb-3 tracking-tight leading-tight">Удалить шоу-рум?</h3>
                     <p className="text-[14px] text-[#4f566b] font-medium leading-relaxed mb-8">
                       Данная локация будет полностью удалена из списка на сайте. Это действие нельзя отменить.
                     </p>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setDeleteModal({ show: false, idx: -1 })}
                          className="flex-1 py-4 bg-[#f7f8f9] text-[#1a1f36] rounded-2xl font-bold text-[14px] hover:bg-[#e3e8ee] transition-all"
                        >
                          Отмена
                        </button>
                        <button 
                          onClick={confirmDelete}
                          className="flex-1 py-4 bg-[#cd5c5c] text-white rounded-2xl font-bold text-[14px] hover:bg-[#b04b4b] transition-all shadow-lg shadow-red-500/20"
                        >
                          Да, удалить
                        </button>
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
