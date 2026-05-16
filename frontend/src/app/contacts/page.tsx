"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

export default function ContactsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [contactInfo, setContactInfo] = useState({
    address: "г. Ташкент, Яккасарайский район, ул. Шота Руставели, 12",
    phone: "+998 71 205 54 54",
    email: "info@maff.uz",
    hours: "09:00 – 20:00 (Ежедневно)",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11986.733795156686!2d69.2483863!3d41.2825125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f6059d0f393%3A0xc331a98075f92!2sTashkent!5e0!3m2!1sen!2suz!4v1713700000000!5m2!1sen!2suz"
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "Общий вопрос",
    message: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/pages/contact");
        if (res.ok) {
          const data = await res.json();
          if (data.content) setContactInfo(data.content);
        }
      } catch (err) {
        console.error("Failed to fetch contact info:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
        <div className="w-full h-screen bg-white flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Breadcrumbs ── */}
      <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6 flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-slate-900 dark:text-slate-200">Контакты</span>
      </nav>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-12 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
               <div className="bg-[#f8f9fa] dark:bg-slate-800/50 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                  {submitted ? (
                    <div className="py-10 lg:py-14 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                       <div className="w-14 h-14 lg:w-16 lg:h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-7 lg:w-8 h-7 lg:h-8 text-green-500" />
                       </div>
                       <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Спасибо!</h2>
                       <p className="text-slate-500 dark:text-slate-400 text-[10px] lg:text-xs font-normal max-w-xs leading-relaxed">Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.</p>
                       <button 
                          onClick={() => setSubmitted(false)}
                          className="mt-6 lg:mt-8 text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400 hover:text-slate-900 dark:hover:text-white transition-all"
                       >
                          Отправить еще раз
                       </button>
                    </div>
                  ) : (
                    <>
                       <div className="mb-6 lg:mb-7">
                          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Напишите нам</h1>
                          <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-xs font-normal opacity-80">Мы всегда на связи и готовы помочь.</p>
                       </div>

                       <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                             <div className="space-y-1.5">
                                <label className="text-[8px] lg:text-[9px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4 leading-none">Имя</label>
                                <input 
                                   required
                                   type="text" 
                                   value={formData.name}
                                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                                   placeholder="Иван Иванов"
                                   className="w-full h-11 lg:h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl lg:rounded-2xl px-5 text-[11px] lg:text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-[#2c3b6e] dark:focus:border-blue-500 transition-all placeholder:opacity-30"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[8px] lg:text-[9px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4 leading-none">Телефон</label>
                                <input 
                                   required
                                   type="tel" 
                                   value={formData.phone}
                                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                   placeholder="+998 (__) ___-__-__"
                                   className="w-full h-11 lg:h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl lg:rounded-2xl px-5 text-[11px] lg:text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-[#2c3b6e] dark:focus:border-blue-500 transition-all placeholder:opacity-30"
                                />
                             </div>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[8px] lg:text-[9px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4 leading-none">Тема</label>
                             <select 
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                className="w-full h-11 lg:h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl lg:rounded-2xl px-5 text-[11px] lg:text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-[#2c3b6e] dark:focus:border-blue-500 transition-all appearance-none"
                             >
                                <option>Общий вопрос</option>
                                <option>Сотрудничество</option>
                                <option>Дизайн-проект</option>
                                <option>Заказ и доставка</option>
                                <option>Другое</option>
                             </select>
                          </div>

                          <div className="space-y-1.5">
                             <label className="text-[8px] lg:text-[9px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4 leading-none">Сообщение</label>
                             <textarea 
                                required
                                rows={2}
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                placeholder="Ваш вопрос..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl lg:rounded-2xl p-5 text-[11px] lg:text-sm font-normal text-slate-900 dark:text-white outline-none focus:border-[#2c3b6e] dark:focus:border-blue-500 transition-all resize-none placeholder:opacity-30"
                             />
                          </div>

                          <button 
                             disabled={loading}
                             className={cn(
                               "w-full h-12 lg:h-13 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                               loading ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#2c3b6e] dark:hover:bg-blue-50"
                             )}
                          >
                             {loading ? (
                               <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                             ) : (
                               <>
                                 Отправить
                                 <Send className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                               </>
                             )}
                          </button>
                       </form>
                    </>
                  )}
               </div>
          </div>

          {/* Right: Info cards */}
          <div className="lg:col-span-5 space-y-4 lg:space-y-6">
               <div className="bg-[#f8f9fa] dark:bg-slate-800/50 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
                  <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-5 lg:mb-6 flex items-center gap-2.5">
                     <span className="w-7 h-7 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg flex items-center justify-center text-[#2c3b6e] dark:text-blue-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                     </span>
                     Контакты
                  </h3>
                  
                  <div className="space-y-4 lg:space-y-5">
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                           <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2c3b6e] dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[7.5px] lg:text-[8.5px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Адрес</p>
                           <p className="text-[10px] lg:text-[12px] font-normal text-slate-900 dark:text-slate-300 leading-snug">{contactInfo.address}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                           <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2c3b6e] dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[7.5px] lg:text-[8.5px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Телефон</p>
                           <p className="text-base lg:text-lg font-black text-slate-900 dark:text-white">{contactInfo.phone}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                           <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2c3b6e] dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[7.5px] lg:text-[8.5px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Email</p>
                           <p className="text-[10px] lg:text-[12px] font-normal text-slate-900 dark:text-slate-300 leading-none">{contactInfo.email}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                           <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2c3b6e] dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[7.5px] lg:text-[8.5px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">График</p>
                           <p className="text-[10px] lg:text-[12px] font-normal text-slate-900 dark:text-slate-300 leading-none">{contactInfo.hours}</p>
                        </div>
                     </div>
                  </div>
               </div>

            {/* Map Area */}
               <div className="bg-[#f8f9fa] dark:bg-slate-800/50 rounded-2xl lg:rounded-[2rem] p-1.5 border border-slate-100 dark:border-slate-800 overflow-hidden h-[180px] lg:h-[220px]">
                  <iframe
                    src={contactInfo.mapUrl}
                    className="w-full h-full rounded-xl lg:rounded-[1.5rem] border-0 grayscale opacity-60 dark:invert dark:opacity-40"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
               </div>
          </div>

        </div>
      </section>
    </div>
  );
}
