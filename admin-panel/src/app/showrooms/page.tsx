"use client";
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
  X,
  MapPin as MapIcon,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
            <MapIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Шоу-румы</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Адреса и контакты</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {showrooms.map((s, idx) => (
          <div key={s.id || idx} className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
               <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#2c3b6e] flex items-center justify-center text-white">
                     <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    value={s.name} 
                    onChange={(e) => updateShowroom(idx, "name", e.target.value)}
                    className="bg-transparent text-[13px] font-bold text-[#1a1f36] outline-none border-none px-2 py-1 flex-1 placeholder:text-[#c4cad4]"
                    placeholder="Название шоу-рума"
                  />
               </div>
               <button 
                 onClick={() => setDeleteModal({ show: true, idx })}
                 className="p-1.5 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>

            <div className="p-4 space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Адрес
                     </label>
                     <textarea 
                       value={s.address} 
                       onChange={(e) => updateShowroom(idx, "address", e.target.value)}
                       rows={2}
                       className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none placeholder:text-[#c4cad4]"
                     />
                  </div>
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                           <Phone className="w-3 h-3" /> Телефон
                        </label>
                        <input 
                          value={s.phone} 
                          onChange={(e) => updateShowroom(idx, "phone", e.target.value)}
                          className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                           <Clock className="w-3 h-3" /> Режим работы
                        </label>
                        <input 
                          value={s.hours} 
                          onChange={(e) => updateShowroom(idx, "hours", e.target.value)}
                          className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-medium text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-1 pt-2">
                  <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                     <Navigation className="w-3 h-3" /> Google Maps Embed URL
                  </label>
                  <input 
                    value={s.mapUrl} 
                    onChange={(e) => updateShowroom(idx, "mapUrl", e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[11px] text-[#2c3b6e] font-mono outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                  />
                  <p className="text-[9px] text-[#a3acb9] font-medium">Скопируйте `src` из кода вставки Google Maps.</p>
               </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addShowroom}
          className="h-full min-h-[250px] border-2 border-dashed border-[#e3e8ee] bg-[#f7f8f9] rounded-xl text-[#4f566b] hover:text-[#2c3b6e] hover:border-[#2c3b6e]/30 hover:bg-[#2c3b6e]/5 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[15px] font-bold">Добавить шоу-рум</span>
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
          <div onClick={() => setDeleteModal({ show: false, idx: -1 })} className="fixed inset-0 z-[99999] bg-[#1a1f36]/60 backdrop-blur-md" />
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none">
             <div className="relative w-full max-w-sm bg-white rounded-xl overflow-hidden border border-[#e3e8ee] pointer-events-auto">
                <div className="p-6 text-center">
                   <div className="w-14 h-14 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6 text-[#cd5c5c]" />
                   </div>
                   <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Удалить шоу-рум?</h3>
                   <p className="text-[13px] text-[#4f566b] leading-relaxed mb-6">Локация будет удалена из списка. Это действие нельзя отменить.</p>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setDeleteModal({ show: false, idx: -1 })} className="flex-1 py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[13px] hover:bg-[#e3e8ee] transition-all">Отмена</button>
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
