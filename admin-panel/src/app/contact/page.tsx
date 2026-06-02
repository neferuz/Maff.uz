"use client";
import { 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  Filter,
  Calendar,
  Phone as PhoneIcon,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Tab = "info" | "leads";

export default function ContactEditor() {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Info State
  const [contactInfo, setContactInfo] = useState({
    address: "",
    phone: "",
    email: "",
    hours: "",
    mapUrl: ""
  });

  // Leads State
  const [leads, setLeads] = useState<any[]>([]);
  const [leadDeleting, setLeadDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetching(true);
    try {
      // Fetch Page Info
      const pageRes = await fetch("/api/v1/pages/contact");
      if (pageRes.ok) {
        const data = await pageRes.json();
        setContactInfo(data.content || {
          address: "г. Ташкент, ...",
          phone: "+998 ...",
          email: "info@maff.uz",
          hours: "09:00 – 20:00 (Ежедневно)",
          mapUrl: ""
        });
      }

      // Fetch Leads
      const token = localStorage.getItem("token");
      const leadsRes = await fetch("/api/v1/leads/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (leadsRes.ok) {
        setLeads(await leadsRes.json());
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Fetch error:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSaveInfo = async () => {
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
          slug: "contact",
          content: contactInfo
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

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Update status error:", err);
    }
  };

  const deleteLead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/leads/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
      }
    } catch (err) {
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Delete lead error:", err);
    } finally {
      setLeadDeleting(null);
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
            <PhoneIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Контакты</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Информация и заявки</p>
          </div>
          {hasChanges && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md tracking-wider">Несохранено</span>
          )}
        </div>
        {activeTab === "info" && (
          <button 
            onClick={handleSaveInfo}
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
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e3e8ee]">
        <button 
          onClick={() => setActiveTab("info")}
          className={cn(
            "px-4 py-3 text-[12px] font-semibold border-b-2 transition-all",
            activeTab === "info" ? "text-[#2c3b6e] border-[#2c3b6e]" : "text-[#4f566b] border-transparent hover:text-[#1a1f36]"
          )}
        >
          Информация
        </button>
        <button 
          onClick={() => setActiveTab("leads")}
          className={cn(
            "px-4 py-3 text-[12px] font-semibold border-b-2 transition-all flex items-center gap-2",
            activeTab === "leads" ? "text-[#2c3b6e] border-[#2c3b6e]" : "text-[#4f566b] border-transparent hover:text-[#1a1f36]"
          )}
        >
          Заявки
          {leads.filter(l => l.status === "new").length > 0 && (
            <span className="w-2 h-2 bg-[#cd5c5c] rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "info" ? (
          <motion.div 
            key="info"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             <div className="lg:col-span-12 space-y-4">
                <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                            <Phone className="w-3 h-3 text-[#2c3b6e]" /> Телефон
                         </label>
                         <input 
                           value={contactInfo.phone} 
                           onChange={(e) => { setContactInfo({...contactInfo, phone: e.target.value}); setHasChanges(true); }}
                           className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                           placeholder="+998 ..."
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                            <Mail className="w-3 h-3 text-[#2c3b6e]" /> Email
                         </label>
                         <input 
                           value={contactInfo.email} 
                           onChange={(e) => { setContactInfo({...contactInfo, email: e.target.value}); setHasChanges(true); }}
                           className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                           placeholder="info@maff.uz"
                         />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                         <MapPin className="w-3 h-3 text-[#2c3b6e]" /> Адрес офиса
                      </label>
                      <textarea 
                        value={contactInfo.address} 
                        onChange={(e) => { setContactInfo({...contactInfo, address: e.target.value}); setHasChanges(true); }}
                        rows={2}
                        className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none placeholder:text-[#c4cad4]"
                        placeholder="г. Ташкент, ..."
                      />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                         <Clock className="w-3 h-3 text-[#2c3b6e]" /> Режим работы
                      </label>
                      <input 
                        value={contactInfo.hours} 
                        onChange={(e) => { setContactInfo({...contactInfo, hours: e.target.value}); setHasChanges(true); }}
                        className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                        placeholder="09:00 – 20:00 (Ежедневно)"
                      />
                   </div>
                </div>

                <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 space-y-3">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider flex items-center gap-2">
                         <MapPin className="w-3 h-3 text-[#2c3b6e]" /> Карта (Google Maps Embed)
                      </label>
                      {contactInfo.mapUrl && (
                        <a href={contactInfo.mapUrl} target="_blank" className="text-[10px] text-[#2c3b6e] font-semibold flex items-center gap-1 hover:underline">
                           Проверить <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                   </div>
                   <input 
                     value={contactInfo.mapUrl} 
                     onChange={(e) => { setContactInfo({...contactInfo, mapUrl: e.target.value}); setHasChanges(true); }}
                     placeholder="https://www.google.com/maps/embed?pb=..."
                     className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[11px] font-mono text-[#2c3b6e] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                   />
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="leads"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
             {leads.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                   {leads.map((l) => (
                     <div 
                       key={l.id}
                       className={cn(
                         "bg-white border rounded-lg p-4 transition-all",
                         l.status === "new" ? "border-[#2c3b6e]" : "border-[#e3e8ee] opacity-70"
                       )}
                     >
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                 <span className={cn(
                                   "px-2 py-0.5 rounded-md text-[10px] font-semibold",
                                   l.status === "new" ? "bg-[#2c3b6e] text-white" : "bg-[#e3e8ee] text-[#4f566b]"
                                 )}>
                                   {l.status === "new" ? "Новая" : "Обработана"}
                                 </span>
                                 <span className="text-[11px] text-[#a3acb9]">
                                    {new Date(l.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>

                              <div className="flex items-center gap-4 text-[13px]">
                                 <div>
                                   <span className="text-[#a3acb9] text-[11px]">{l.name}</span>
                                   <span className="text-[#2c3b6e] font-semibold ml-2">{l.phone}</span>
                                 </div>
                                 {l.subject && (
                                   <span className="text-[#4f566b] text-[12px]">• {l.subject}</span>
                                 )}
                              </div>

                              <p className="text-[12px] text-[#4f566b] leading-relaxed line-clamp-2">
                                "{l.message}"
                              </p>
                           </div>

                           <div className="flex items-center gap-2 shrink-0">
                              {l.status === "new" ? (
                                <button 
                                  onClick={() => updateStatus(l.id, "contacted")}
                                  className="p-1.5 bg-[#2c3b6e]/10 text-[#2c3b6e] rounded-lg hover:bg-[#2c3b6e] hover:text-white transition-all"
                                  title="Отметить как обработанную"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateStatus(l.id, "new")}
                                  className="p-1.5 bg-[#f7f8f9] text-[#2c3b6e] rounded-lg hover:bg-white border border-[#e3e8ee] transition-all"
                                  title="Вернуть в новые"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => setLeadDeleting(l.id)}
                                className="p-1.5 text-[#a3acb9] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg transition-all"
                                title="Удалить заявку"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="py-12 bg-white border border-dashed border-[#e3e8ee] rounded-lg flex flex-col items-center justify-center text-center">
                   <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center mb-3 border border-[#e3e8ee]">
                      <Filter className="w-5 h-5 text-slate-400" />
                   </div>
                   <h3 className="text-[13px] font-semibold text-slate-900 tracking-wider">Заявок пока нет</h3>
                   <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">Все входящие сообщения от клиентов с сайта появятся здесь.</p>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Delete Lead Modal */}
      {leadDeleting !== null && createPortal(
        <>
          <div onClick={() => setLeadDeleting(null)} className="fixed inset-0 z-[99999] bg-[#1a1f36]/60 backdrop-blur-md" />
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 pointer-events-none">
             <div className="relative w-full max-w-sm bg-white rounded-xl overflow-hidden border border-[#e3e8ee] pointer-events-auto">
                <div className="p-6 text-center">
                   <div className="w-14 h-14 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6 text-[#cd5c5c]" />
                   </div>
                   <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Удалить заявку?</h3>
                   <p className="text-[13px] text-[#4f566b] leading-relaxed mb-6">Заявка будет удалена из списка. Это действие нельзя отменить.</p>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setLeadDeleting(null)} className="flex-1 py-3 bg-[#f7f8f9] text-[#1a1f36] rounded-xl font-bold text-[13px] hover:bg-[#e3e8ee] transition-all">Отмена</button>
                      <button onClick={() => leadDeleting && deleteLead(leadDeleting)} className="flex-1 py-3 bg-[#cd5c5c] text-white rounded-xl font-bold text-[13px] hover:bg-[#b04b4b] transition-all">Да, удалить</button>
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
