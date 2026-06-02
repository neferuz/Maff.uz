"use client";
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
  ChevronUp,
  HelpCircle as HelpIcon,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
        setShowToast(true);
        setHasChanges(false);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || "Не удалось сохранить");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">FAQ</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Вопросы и ответы</p>
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

      <div className="space-y-8">
        {faqData.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
            {/* Category Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
              <div className="flex items-center gap-2 flex-1">
                 <div className="relative group">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-[#2c3b6e]">
                       {(() => {
                         const Icon = ICON_MAP[cat.icon] || HelpCircle;
                         return <Icon className="w-4 h-4" />;
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
                   className="bg-transparent text-[13px] font-bold text-[#1a1f36] outline-none border-none px-2 py-1 flex-1 placeholder:text-[#c4cad4]"
                   placeholder="Название категории"
                 />
              </div>
              <button 
                onClick={() => setDeleteModal({ show: true, type: "category", catIdx })}
                className="p-1.5 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                title="Удалить категорию"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Items List */}
            <div className="p-4 space-y-3">
               {cat.items && Array.isArray(cat.items) && cat.items.map((item: any, itemIdx: number) => (
                 <div key={itemIdx} className="group relative bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg p-4 space-y-3 transition-all hover:border-[#2c3b6e]">
                    <div className="flex items-start justify-between gap-4">
                       <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                             <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Вопрос</label>
                             <input 
                               value={item.q} 
                               onChange={(e) => updateItem(catIdx, itemIdx, "q", e.target.value)}
                               className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                               placeholder="Введите вопрос"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Ответ</label>
                             <textarea 
                               value={item.a} 
                               onChange={(e) => updateItem(catIdx, itemIdx, "a", e.target.value)}
                               rows={3}
                               className="w-full bg-white border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] text-[#1a1f36] outline-none focus:border-[#2c3b6e] transition-all resize-none placeholder:text-[#c4cad4]"
                               placeholder="Введите ответ"
                             />
                          </div>
                       </div>
                       <button 
                         onClick={() => setDeleteModal({ show: true, type: "item", catIdx, itemIdx })}
                         className="mt-6 p-1.5 text-[#4f566b] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
               ))}
               
               <button 
                 onClick={() => addItem(catIdx)}
                 className="w-full py-3 border-2 border-dashed border-[#e3e8ee] rounded-lg text-[#4f566b] hover:text-[#2c3b6e] hover:border-[#2c3b6e]/30 hover:bg-[#2c3b6e]/5 transition-all flex items-center justify-center gap-2 text-[12px] font-semibold"
               >
                 <Plus className="w-3.5 h-3.5" /> Добавить вопрос
               </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addCategory}
          className="w-full py-4 border-2 border-dashed border-[#e3e8ee] bg-[#f7f8f9] rounded-xl text-[#4f566b] hover:text-[#2c3b6e] hover:border-[#2c3b6e]/30 hover:bg-[#2c3b6e]/5 transition-all flex items-center justify-center gap-2 text-[12px] font-semibold"
        >
          <Plus className="w-4 h-4" /> Добавить категорию
        </button>
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
                   <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Удалить {deleteModal.type === "category" ? "категорию" : "вопрос"}?</h3>
                   <p className="text-[13px] text-[#4f566b] leading-relaxed mb-6">Элемент будет удалён из списка FAQ. Это действие нельзя отменить.</p>
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
