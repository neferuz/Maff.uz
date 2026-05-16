"use client";

import { 
  Save, 
  Award, 
  Plus, 
  Trash2, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Image as ImageIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CertificatesEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Data State
  const [certificates, setCertificates] = useState<any[]>([]);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    idx: number;
  }>({ show: false, idx: -1 });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/certificates");
      if (response.ok) {
        const result = await response.json();
        setCertificates(Array.isArray(result.content) ? result.content : []);
        setHasChanges(false);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setCertificates([]);
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
          slug: "certificates",
          content: certificates
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
      setErrorMsg("Ошибка подключения к серверу");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const addCertificate = () => {
    const newCert = {
      id: Date.now(),
      title: "Новый сертификат",
      provider: "Наименование компании",
      year: new Date().getFullYear().toString(),
      imageUrl: ""
    };
    setCertificates([...certificates, newCert]);
    setHasChanges(true);
  };

  const removeCertificate = (idx: number) => {
    const newData = certificates.filter((_, i) => i !== idx);
    setCertificates(newData);
    setHasChanges(true);
  };

  const updateCertificate = (idx: number, field: string, value: any) => {
    const newData = [...certificates];
    newData[idx] = { ...newData[idx], [field]: value };
    setCertificates(newData);
    setHasChanges(true);
  };

  const confirmDelete = () => {
    removeCertificate(deleteModal.idx);
    setDeleteModal({ show: false, idx: -1 });
  };

  const handleFileUpload = async (idx: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/admin-maff/api/v1/uploads", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateCertificate(idx, "imageUrl", data.url);
      } else {
        const err = await response.json().catch(() => ({}));
        setErrorMsg(err.detail || "Ошибка при загрузке файла");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения при загрузке");
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  const ModalPortal = () => {
    if (!mounted || typeof document === 'undefined') return null;
    
    return createPortal(
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setDeleteModal({ show: false, idx: -1 })}
               className="absolute inset-0 bg-[#1a1f36]/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="relative w-full max-w-[320px] bg-white rounded-[2rem] overflow-hidden border border-[#e3e8ee] shadow-2xl"
             >
                <div className="p-8 text-center">
                   <div className="w-12 h-12 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6 text-[#cd5c5c]" />
                   </div>
                   <h3 className="text-lg font-black text-[#1a1f36] mb-2 uppercase tracking-tight">Удалить?</h3>
                   <p className="text-[11px] text-[#4f566b] font-medium leading-relaxed mb-8 uppercase tracking-widest">
                     Вы уверены, что хотите удалить этот компонент?
                   </p>
                   <div className="flex flex-col gap-2">
                      <button 
                        onClick={confirmDelete}
                        className="w-full py-3 bg-[#cd5c5c] text-white rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-[#b04b4b] transition-all"
                      >
                        Да, удалить
                      </button>
                      <button 
                        onClick={() => setDeleteModal({ show: false, idx: -1 })}
                        className="w-full py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-[#e3e8ee] transition-all"
                      >
                        Отмена
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Управление Сертификатами</h1>
          <p className="text-[14px] text-[#4f566b]">Добавление и редактирование сертификатов качества и партнерских соглашений.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {certificates.map((cert, idx) => (
          <motion.div 
            key={cert.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e3e8ee] rounded-[2rem] overflow-hidden shadow-none flex flex-col group"
          >
            {/* Certificate Preview/Upload area */}
            <div className="bg-[#f7f8f9] aspect-[3/4] flex flex-col items-center justify-center p-6 border-b border-[#e3e8ee] relative">
               {cert.imageUrl ? (
                 <div className="w-full h-full relative group">
                   <img 
                     src={cert.imageUrl} 
                     alt={cert.title} 
                     className="w-full h-full object-contain transition-all duration-500" 
                   />
                   <button 
                     onClick={() => updateCertificate(idx, "imageUrl", "")}
                     className="absolute top-0 right-0 p-2 bg-white/90 backdrop-blur-md rounded-full text-[#cd5c5c] shadow-none hover:bg-white transition-all"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-3 text-[#a3acb9]">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#e3e8ee] flex items-center justify-center shadow-none">
                       <FileText className="w-8 h-8" strokeWidth={1} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Документ не загружен</span>
                 </div>
               )}
               
               <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-white border border-[#e3e8ee] rounded-xl p-2 flex items-center gap-2">
                     <input 
                       type="text"
                       placeholder="URL документа"
                       value={cert.imageUrl || ""}
                       onChange={(e) => updateCertificate(idx, "imageUrl", e.target.value)}
                       className="flex-1 bg-transparent text-[10px] outline-none px-2"
                     />
                     <label className="w-8 h-8 rounded-lg bg-[#2c3b6e] flex items-center justify-center text-white cursor-pointer hover:bg-[#232f58] transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(idx, file);
                          }}
                        />
                     </label>
                  </div>
               </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-[0.2em] ml-1">Заголовок</label>
                  <input 
                    value={cert.title || ""} 
                    onChange={(e) => updateCertificate(idx, "title", e.target.value)}
                    className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                    placeholder="Сертификат соответствия..."
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-[0.2em] ml-1">Провайдер</label>
                     <input 
                       value={cert.provider || ""} 
                       onChange={(e) => updateCertificate(idx, "provider", e.target.value)}
                       className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[11px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                       placeholder="Название компании"
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-[0.2em] ml-1">Год</label>
                     <input 
                       value={cert.year || ""} 
                       onChange={(e) => updateCertificate(idx, "year", e.target.value)}
                       className="w-full bg-[#f8f9fa] border border-[#e3e8ee] rounded-xl px-3 py-2 text-[11px] font-medium text-[#1a1f36] outline-none focus:border-[#2c3b6e]/30 transition-all"
                       placeholder="2024"
                     />
                  </div>
               </div>

               <div className="pt-2 mt-auto">
                  <button 
                    onClick={() => setDeleteModal({ show: true, idx })}
                    className="w-full py-2 flex items-center justify-center gap-2 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-xl transition-all text-[11px] font-bold border border-transparent hover:border-[#cd5c5c]/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить
                  </button>
               </div>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={addCertificate}
          className="h-full min-h-[350px] border-2 border-dashed border-[#2c3b6e]/20 bg-[#2c3b6e]/5 rounded-[2.5rem] text-[#2c3b6e] hover:bg-[#2c3b6e]/10 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-none group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-[14px] font-bold uppercase tracking-widest">Добавить сертификат</span>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">Сертификаты сохранены!</span>
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

      <ModalPortal />
    </div>
  );
}
