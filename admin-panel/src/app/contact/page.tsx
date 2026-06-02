"use client";
import { toast } from "react-hot-toast";
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
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type Tab = "info" | "leads";

export default function ContactEditor() {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e3e8ee] pb-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Контакты и Заявки</h1>
            <p className="text-[14px] text-[#4f566b]">Управление контактной информацией и входящими сообщениями.</p>
          </div>
          
          <div className="flex items-center gap-1 bg-[#f7f8f9] p-1 rounded-xl w-fit border border-[#e3e8ee]">
            <button 
              onClick={() => setActiveTab("info")}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                activeTab === "info" ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-[#2c3b6e]"
              )}
            >
              Информация
            </button>
            <button 
              onClick={() => setActiveTab("leads")}
              className={cn(
                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center gap-2",
                activeTab === "leads" ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-[#2c3b6e]"
              )}
            >
              Заявки
              {leads.filter(l => l.status === "new").length > 0 && (
                <span className="w-2 h-2 bg-[#cd5c5c] rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {activeTab === "info" && (
          <button 
            onClick={handleSaveInfo}
            disabled={loading || !hasChanges}
            className="flex items-center gap-2 px-6 py-3 text-[13px] font-bold text-white bg-[#2c3b6e] rounded-xl hover:bg-[#232f58] transition-all disabled:opacity-30"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Сохранить данные
          </button>
        )}
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
                <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Phone className="w-3 h-3 text-[#2c3b6e]" /> Телефон
                         </label>
                         <input 
                           value={contactInfo.phone} 
                           onChange={(e) => { setContactInfo({...contactInfo, phone: e.target.value}); setHasChanges(true); }}
                           className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3.5 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Mail className="w-3 h-3 text-[#2c3b6e]" /> Email
                         </label>
                         <input 
                           value={contactInfo.email} 
                           onChange={(e) => { setContactInfo({...contactInfo, email: e.target.value}); setHasChanges(true); }}
                           className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3.5 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2 ml-1">
                         <MapPin className="w-3 h-3 text-[#2c3b6e]" /> Адрес офиса
                      </label>
                      <textarea 
                        value={contactInfo.address} 
                        onChange={(e) => { setContactInfo({...contactInfo, address: e.target.value}); setHasChanges(true); }}
                        rows={2}
                        className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3.5 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all resize-none"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2 ml-1">
                         <Clock className="w-3 h-3 text-[#2c3b6e]" /> Режим работы
                      </label>
                      <input 
                        value={contactInfo.hours} 
                        onChange={(e) => { setContactInfo({...contactInfo, hours: e.target.value}); setHasChanges(true); }}
                        className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3.5 py-2 text-[13px] font-semibold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all"
                      />
                   </div>
                </div>

                <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-3">
                   <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2 ml-1">
                         <MapPin className="w-3 h-3 text-[#2c3b6e]" /> Карта (Google Maps Embed)
                      </label>
                      {contactInfo.mapUrl && (
                        <a href={contactInfo.mapUrl} target="_blank" className="text-[10px] text-[#2c3b6e] font-bold flex items-center gap-1 hover:underline">
                           Проверить <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                   </div>
                   <input 
                     value={contactInfo.mapUrl} 
                     onChange={(e) => { setContactInfo({...contactInfo, mapUrl: e.target.value}); setHasChanges(true); }}
                     placeholder="https://www.google.com/maps/embed?pb=..."
                     className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3.5 py-2 text-[11px] font-mono text-[#2c3b6e] outline-none focus:bg-white focus:border-[#2c3b6e]/30 transition-all"
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
                <div className="grid grid-cols-1 gap-4">
                   {leads.map((l) => (
                     <div 
                       key={l.id}
                       className={cn(
                         "bg-white border rounded-xl p-5 transition-all group",
                         l.status === "new" ? "border-l-4 border-l-[#2c3b6e] border-[#e3e8ee]" : "border-[#e3e8ee] opacity-80"
                       )}
                     >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                           <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                 <span className={cn(
                                   "px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                   l.status === "new" ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" : "bg-slate-100 text-slate-500"
                                 )}>
                                   {l.status === "new" ? "Новая" : "Обработана"}
                                 </span>
                                 <div className="flex items-center gap-1.5 text-[10px] text-[#4f566b] font-semibold">
                                    <Calendar className="w-3 h-3 text-[#2c3b6e]" />
                                    {new Date(l.created_at).toLocaleString('ru-RU')}
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div>
                                    <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Имя</p>
                                    <p className="text-[13px] font-bold text-[#1a1f36]">{l.name}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Телефон</p>
                                    <p className="text-[13px] font-black text-[#2c3b6e]">{l.phone}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Тема</p>
                                    <p className="text-[13px] font-semibold text-[#1a1f36]">{l.subject || "—"}</p>
                                 </div>
                              </div>

                              <div className="bg-[#f7f8f9] rounded-lg p-3 border border-[#e3e8ee]">
                                 <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Сообщение</p>
                                 <p className="text-[12px] text-[#4f566b] font-medium leading-relaxed">
                                    "{l.message}"
                                 </p>
                              </div>
                           </div>

                           <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                              {l.status === "new" ? (
                                <button 
                                  onClick={() => updateStatus(l.id, "contacted")}
                                  className="px-4 py-2 bg-[#2c3b6e] text-white rounded-lg text-[11px] font-bold hover:bg-[#232f58] transition-all whitespace-nowrap"
                                >
                                  Отметить как обработанную
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateStatus(l.id, "new")}
                                  className="px-4 py-2 bg-[#f7f8f9] text-[#2c3b6e] rounded-lg text-[11px] font-bold hover:bg-white border border-[#e3e8ee] transition-all whitespace-nowrap"
                                >
                                  Вернуть в новые
                                </button>
                              )}
                              <button 
                                onClick={() => setLeadDeleting(l.id)}
                                className="p-2 text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-lg border border-[#e3e8ee] transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="py-12 bg-white border border-dashed border-[#e3e8ee] rounded-xl flex flex-col items-center justify-center text-center">
                   <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center mb-3 border border-[#e3e8ee]">
                      <Filter className="w-5 h-5 text-slate-400" />
                   </div>
                   <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider">Заявок пока нет</h3>
                   <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">Все входящие сообщения от клиентов с сайта появятся здесь.</p>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-[#1a1f36] text-white rounded-xl border border-white/10 backdrop-blur-md shadow-none">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
                <span className="text-[12px] font-bold tracking-tight">Контактная информация сохранена!</span>
             </div>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-[#cd5c5c] text-white rounded-xl border border-white/10 backdrop-blur-md shadow-none">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><AlertCircle className="w-3 h-3" /></div>
                <span className="text-[12px] font-bold tracking-tight">{errorMsg}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Lead Modal */}
      {mounted && typeof document !== 'undefined' && require('react-dom').createPortal(
        <AnimatePresence>
          {leadDeleting !== null && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setLeadDeleting(null)}
                 className="absolute inset-0 bg-[#1a1f36]/40 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 className="relative w-full max-w-xs bg-white rounded-xl overflow-hidden border border-[#e3e8ee] shadow-none"
               >
                  <div className="p-5 text-center">
                     <div className="w-12 h-12 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#cd5c5c]/20">
                        <Trash2 className="w-5 h-5 text-[#cd5c5c]" />
                     </div>
                     <h3 className="text-[15px] font-bold text-[#1a1f36] mb-1.5 uppercase tracking-wider">Удалить заявку?</h3>
                     <p className="text-[12px] text-[#4f566b] font-medium leading-relaxed mb-5">
                       Это действие безвозвратно удалит контактные данные этого клиента из базы.
                     </p>
                     <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => setLeadDeleting(null)}
                          className="flex-1 py-2 bg-[#f7f8f9] text-[#1a1f36] rounded-lg font-bold text-[12px] hover:bg-[#e3e8ee] transition-all border border-[#e3e8ee]"
                        >
                          Отмена
                        </button>
                        <button 
                          onClick={() => leadDeleting && deleteLead(leadDeleting)}
                          className="flex-1 py-2 bg-[#cd5c5c] text-white rounded-lg font-bold text-[12px] hover:bg-[#b04b4b] transition-all"
                        >
                          Удалить
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
