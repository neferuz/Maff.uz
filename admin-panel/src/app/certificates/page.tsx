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
  X,
  Award as AwardIcon,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function CertificatesEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Data State
  const [certificates, setCertificates] = useState<any[]>([]);

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
      const response = await fetch("/api/v1/pages/certificates");
      if (response.ok) {
        const result = await response.json();
        setCertificates(Array.isArray(result.content) ? result.content : []);
        setHasChanges(false);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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


  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <AwardIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Сертификаты</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Сертификаты и соглашения</p>
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
        {certificates.map((cert, idx) => (
          <motion.div 
            key={cert.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden p-4 flex gap-4 relative group"
          >
            {/* Left side: Certificate Preview/Upload area */}
            <div className="w-28 h-36 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0">
               {cert.imageUrl ? (
                 <div className="w-full h-full relative group/img">
                   <img 
                     src={cert.imageUrl} 
                     alt={cert.title} 
                     className="w-full h-full object-contain" 
                   />
                   <button 
                     onClick={() => updateCertificate(idx, "imageUrl", "")}
                     className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-md rounded-full text-[#cd5c5c] hover:bg-white transition-all shadow-sm"
                   >
                     <X className="w-3 h-3" />
                   </button>
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-1.5 text-[#a3acb9] text-center p-2">
                    <FileText className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[9px] font-semibold leading-tight">Нет файла</span>
                 </div>
               )}
               
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center text-[#2c3b6e] cursor-pointer hover:bg-white transition-all shadow-sm">
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

            {/* Right side: Input fields */}
            <div className="flex-1 flex flex-col justify-between">
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Заголовок</label>
                     <input 
                       value={cert.title || ""} 
                       onChange={(e) => updateCertificate(idx, "title", e.target.value)}
                       className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                       placeholder="Сертификат соответствия..."
                     />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                     <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Провайдер</label>
                        <input 
                          value={cert.provider || ""} 
                          onChange={(e) => updateCertificate(idx, "provider", e.target.value)}
                          className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                          placeholder="Название компании"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Год</label>
                        <input 
                          value={cert.year || ""} 
                          onChange={(e) => updateCertificate(idx, "year", e.target.value)}
                          className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                          placeholder="2024"
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Ссылка на файл</label>
                     <input 
                       value={cert.imageUrl || ""} 
                       onChange={(e) => updateCertificate(idx, "imageUrl", e.target.value)}
                       placeholder="Вставьте URL изображения"
                       className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-1.5 text-[10px] font-mono text-[#2c3b6e] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all"
                     />
                  </div>
               </div>

               <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setDeleteModal({ show: true, idx })}
                    className="p-1.5 text-[#a3acb9] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                    title="Удалить сертификат"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}

        <button 
          onClick={addCertificate}
          className="h-full min-h-[170px] border-2 border-dashed border-[#e3e8ee] bg-[#f7f8f9] rounded-xl text-[#4f566b] hover:text-[#2c3b6e] hover:border-[#2c3b6e]/30 hover:bg-[#2c3b6e]/5 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[13px] font-bold tracking-wider">Добавить сертификат</span>
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
                   <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Удалить сертификат?</h3>
                   <p className="text-[13px] text-[#4f566b] leading-relaxed mb-6">Сертификат будет удалён из списка. Это действие нельзя отменить.</p>
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
