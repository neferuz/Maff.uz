"use client";

import React, { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight, 
  Share2, 
  Navigation, 
  X, 
  Copy, 
  Check,
  Link as LinkIcon,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShowroomsPage() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeShowroom = showrooms.find(s => s.id === activeId) || showrooms[0];

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        const res = await fetch("/api/v1/pages/showrooms");
        if (res.ok) {
          const data = await res.json();
          const content = data.content || [];
          setShowrooms(content);
          if (content.length > 0) {
            setActiveId(content[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch showrooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowrooms();
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }
  }, [isModalOpen]);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
    }, 400); 
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
     return (
        <div className="w-full h-screen bg-white flex items-center justify-center">
           <RefreshCw className="w-10 h-10 animate-spin text-[#2c3b6e]" />
        </div>
     );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Share Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className={cn(
              "absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500 ease-out",
              isAnimating ? "opacity-100" : "opacity-0"
            )} 
            onClick={handleClose} 
          />
          
          <div 
            className={cn(
              "relative w-full max-w-[320px] bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 transition-all duration-500 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center",
              isAnimating 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-90 translate-y-12"
            )}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 lg:top-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
               <X className="w-4 h-4" />
            </button>

            <div className="mb-6 lg:mb-8">
               <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-5 border border-slate-100 dark:border-slate-600">
                  <LinkIcon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" />
               </div>
               <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1.5 lg:mb-2">Поделиться</h3>
               <p className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase tracking-widest leading-none">Ссылка на локацию</p>
            </div>

            <div className="w-full relative mb-4 lg:mb-6">
               <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl lg:rounded-2xl p-3 lg:p-4 pr-10 lg:pr-12 text-[10px] lg:text-[11px] font-bold text-slate-400 truncate border border-slate-100 dark:border-slate-700 text-left">
                  {shareUrl}
               </div>
               <button 
                  onClick={handleCopy} 
                  className={cn(
                    "absolute top-1/2 right-1 lg:right-1.5 -translate-y-1/2 w-9 h-7 lg:w-11 lg:h-9 flex items-center justify-center border border-slate-100 dark:border-slate-700 rounded-lg lg:rounded-xl transition-all",
                    copied ? "bg-green-500 border-green-500 text-white" : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
               </button>
            </div>

            <button 
               onClick={handleCopy}
               className={cn(
                 "w-full py-3.5 lg:py-4 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all",
                 copied ? "bg-green-500 text-white" : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-[#2c3b6e]"
               )}
            >
               {copied ? "Скопировано!" : "Копировать"}
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <section className="w-full bg-[#f8f9fa] dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-6 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
             <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 mb-2 lg:mb-3">
                   <span className="w-4 lg:w-6 h-[1.5px] bg-[#2c3b6e]" />
                   <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400">Наши локации</span>
                   <span className="w-4 lg:w-6 h-[1.5px] bg-[#2c3b6e]" />
                </div>
                <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Шоу-румы MAFF</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl text-[9px] lg:text-xs font-medium leading-relaxed opacity-80">
                   Посетите наши выставочные залы, чтобы вживую оценить качество материалов.
                </p>
             </div>
        </div>
      </section>

      {/* ── Main Layout ── */}
      <section className="max-w-7xl mx-auto px-2 lg:px-6 py-4 lg:py-8">
        {showrooms.length > 0 ? (
           <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[500px]">
             
             {/* Left Side: Showroom List */}
             <div className="lg:w-4/12 flex flex-col gap-3 order-2 lg:order-1">
                {showrooms.map((s) => (
                   <div
                      key={s.id}
                      onClick={() => setActiveId(s.id)}
                      className={cn(
                        "group w-full p-4 lg:p-6 text-left transition-all duration-500 relative overflow-hidden cursor-pointer",
                        "bg-[#f8f9fa] dark:bg-slate-800/50 border rounded-xl lg:rounded-[2rem]",
                        activeId === s.id 
                          ? "border-[#2c3b6e] dark:border-blue-500" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                   >
                      {/* Selection Indicator */}
                      {activeId === s.id && (
                        <div className="absolute top-0 right-0 p-3 lg:p-4">
                           <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-[#2c3b6e] dark:bg-blue-600 flex items-center justify-center text-white">
                              <MapPin className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                           </div>
                        </div>
                      )}
                      
                      <h3 className={cn(
                        "text-sm lg:text-base font-black uppercase tracking-tight mb-3 transition-colors",
                        activeId === s.id ? "text-[#2c3b6e] dark:text-blue-400" : "text-slate-900 dark:text-white group-hover:text-[#2c3b6e]"
                      )}>
                        {s.name}
                      </h3>
                      
                      <div className="space-y-2">
                         <div className="flex items-start gap-2.5">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-100 dark:border-slate-600">
                               <MapPin className="w-3 lg:w-3.5 text-[#2c3b6e] dark:text-blue-400" />
                            </div>
                            <p className="text-[9px] lg:text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-snug">{s.address}</p>
                         </div>
                         <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-600">
                               <Phone className="w-3 lg:w-3.5 text-[#2c3b6e] dark:text-blue-400" />
                            </div>
                            <p className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white">{s.phone}</p>
                         </div>
                         <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-600">
                               <Clock className="w-3 lg:w-3.5 text-[#2c3b6e] dark:text-blue-400" />
                            </div>
                            <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-500">{s.hours}</p>
                         </div>
                      </div>

                      <div className="mt-4 lg:mt-6 flex items-center gap-2">
                         <button className="flex-grow py-3 rounded-full bg-white dark:bg-slate-900 border border-[#2c3b6e] dark:border-blue-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400 hover:bg-[#2c3b6e] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2">
                           <Navigation className="w-3 h-3" />
                           Маршрут
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleOpen(); }} className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-[#2c3b6e] hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-all flex items-center justify-center">
                           <Share2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             {/* Right Side: Map Area */}
             <div className="lg:w-8/12 order-1 lg:order-2">
                <div className="w-full h-[300px] lg:h-full bg-white dark:bg-slate-900 rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[300px] lg:min-h-[500px] relative p-1.5 lg:p-2 transition-colors">
                   <iframe
                     src={activeShowroom?.mapUrl}
                     className="w-full h-full rounded-xl lg:rounded-[2.2rem] border-0 dark:invert dark:opacity-70 dark:contrast-125"
                     allowFullScreen
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                   ></iframe>
                   
                   {/* Overlay Info */}
                   <div className="hidden sm:flex absolute bottom-4 lg:bottom-6 left-4 lg:left-6 right-4 lg:right-6 p-4 lg:p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl lg:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 items-center justify-between transition-colors">
                      <div className="flex items-center gap-3 lg:gap-4">
                         <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#2c3b6e] dark:bg-blue-600 flex items-center justify-center text-white">
                            <MapPin className="w-5 lg:w-6 h-5 lg:h-6" />
                         </div>
                         <div>
                            <h4 className="text-[11px] lg:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{activeShowroom?.name}</h4>
                            <p className="text-[9px] lg:text-[11px] font-bold text-slate-400 mt-1 truncate max-w-[150px] lg:max-w-none">{activeShowroom?.address}</p>
                         </div>
                      </div>
                      <button className="px-4 lg:px-6 py-2.5 lg:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] lg:text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#2c3b6e] dark:hover:bg-blue-50 transition-all flex items-center gap-2">
                         В карты
                         <ChevronRight className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                      </button>
                   </div>
                </div>
             </div>
           </div>
        ) : (
           <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
              Локации скоро появятся...
           </div>
        )}
      </section>
    </div>
  );
}
