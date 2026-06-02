"use client";
import { toast } from "react-hot-toast";
import { 
  Save, 
  HelpCircle, 
  Box, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ICON_MAP: { [key: string]: any } = {
  HelpCircle,
  Box,
  Truck,
  CreditCard,
  ShieldCheck
};

export default function FAQEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data State
  const [faqData, setFaqData] = useState<any[]>([]);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    type: "category" | "item";
    catIdx: number;
    itemIdx?: number;
  }>({ show: false, type: "category", catIdx: -1 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/faq");
      if (response.ok) {
        const result = await response.json();
        const content = result.content;
        setFaqData(Array.isArray(content) ? content : []);
        setHasChanges(false);
      } else {
        // If not found, use default or empty
        setFaqData([]);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch data:", err);
      setFaqData([]);
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
          slug: "faq",
          content: faqData
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

  const addCategory = () => {
    const newCategory = {
      category: "Новая категория",
      icon: "HelpCircle",
      items: [{ q: "Ваш вопрос?", a: "Ваш ответ." }]
    };
    setFaqData([...faqData, newCategory]);
    setHasChanges(true);
  };

  const removeCategory = (idx: number) => {
    const newData = faqData.filter((_, i) => i !== idx);
    setFaqData(newData);
    setHasChanges(true);
  };

  const updateCategory = (idx: number, field: string, value: any) => {
    const newData = [...faqData];
    newData[idx] = { ...newData[idx], [field]: value };
    setFaqData(newData);
    setHasChanges(true);
  };

  const addItem = (catIdx: number) => {
    const newData = [...faqData];
    newData[catIdx].items.push({ q: "Новый вопрос?", a: "Ваш ответ." });
    setFaqData(newData);
    setHasChanges(true);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    const newData = [...faqData];
    newData[catIdx].items = newData[catIdx].items.filter((_: any, i: number) => i !== itemIdx);
    setFaqData(newData);
    setHasChanges(true);
  };

  const updateItem = (catIdx: number, itemIdx: number, field: string, value: string) => {
    const newData = [...faqData];
    newData[catIdx].items[itemIdx] = { ...newData[catIdx].items[itemIdx], [field]: value };
    setFaqData(newData);
    setHasChanges(true);
  };

  const confirmDelete = () => {
    if (deleteModal.type === "category") {
      removeCategory(deleteModal.catIdx);
    } else if (deleteModal.type === "item" && deleteModal.itemIdx !== undefined) {
      removeItem(deleteModal.catIdx, deleteModal.itemIdx);
    }
    setDeleteModal({ ...deleteModal, show: false });
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Управление FAQ</h1>
          <p className="text-[14px] text-[#4f566b]">Настройка вопросов и ответов для ваших клиентов.</p>
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

      <div className="space-y-8">
        {faqData.map((cat, catIdx) => (
          <motion.div 
            key={catIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e3e8ee] rounded-2xl overflow-hidden shadow-none"
          >
            {/* Category Header */}
            <div className="bg-[#f7f8f9] px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                 <div className="relative group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       {(() => {
                         const Icon = ICON_MAP[cat.icon] || HelpCircle;
                         return <Icon className="w-5 h-5" />;
                       })()}
                    </div>
                    <select 
                      value={cat.icon} 
                      onChange={(e) => updateCategory(catIdx, "icon", e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {Object.keys(ICON_MAP).map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                      ))}
                    </select>
                 </div>
                 <input 
                   value={cat.category} 
                   onChange={(e) => updateCategory(catIdx, "category", e.target.value)}
                   className="bg-transparent text-lg font-bold text-[#1a1f36] outline-none border-b border-transparent focus:border-[#2c3b6e]/30 px-1 py-0.5 flex-1"
                   placeholder="Название категории"
                 />
              </div>
              <button 
                onClick={() => setDeleteModal({ show: true, type: "category", catIdx })}
                className="p-2 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                title="Удалить категорию"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-6 space-y-4">
               {cat.items && Array.isArray(cat.items) && cat.items.map((item: any, itemIdx: number) => (
                 <div key={itemIdx} className="group relative bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Вопрос</label>
                             <input 
                               value={item.q} 
                               onChange={(e) => updateItem(catIdx, itemIdx, "q", e.target.value)}
                               className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Ответ</label>
                             <textarea 
                               value={item.a} 
                               onChange={(e) => updateItem(catIdx, itemIdx, "a", e.target.value)}
                               rows={3}
                               className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#4f566b] outline-none focus:border-[#2c3b6e]/30 transition-all resize-none"
                             />
                          </div>
                       </div>
                       <button 
                         onClick={() => setDeleteModal({ show: true, type: "item", catIdx, itemIdx })}
                         className="mt-6 p-2 text-[#4f566b] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
               ))}
               
               <button 
                 onClick={() => addItem(catIdx)}
                 className="w-full py-3 border-2 border-dashed border-[#e3e8ee] rounded-xl text-[#4f566b] hover:text-[#2c3b6e] hover:border-[#2c3b6e]/30 hover:bg-[#2c3b6e]/5 transition-all flex items-center justify-center gap-2 text-[13px] font-bold"
               >
                 <Plus className="w-4 h-4" /> Добавить вопрос
               </button>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={addCategory}
          className="w-full py-6 border-2 border-dashed border-[#2c3b6e]/20 bg-[#2c3b6e]/5 rounded-2xl text-[#2c3b6e] hover:bg-[#2c3b6e]/10 transition-all flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[14px] font-bold">Добавить новую категорию FAQ</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">FAQ успешно обновлен!</span>
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

      {/* Custom Delete Modal (Quiet Luxury Style) */}
      {mounted && typeof document !== 'undefined' && require('react-dom').createPortal(
        <AnimatePresence>
          {deleteModal.show && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setDeleteModal({ ...deleteModal, show: false })}
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
                     <h3 className="text-2xl font-bold text-[#1a1f36] mb-3 tracking-tight leading-tight">
                       Удалить {deleteModal.type === "category" ? "категорию" : "вопрос"}?
                     </h3>
                     <p className="text-[14px] text-[#4f566b] font-medium leading-relaxed mb-8">
                       Это действие нельзя будет отменить. Данные будут навсегда удалены из списка FAQ.
                     </p>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setDeleteModal({ ...deleteModal, show: false })}
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
