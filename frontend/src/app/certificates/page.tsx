"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, 
  Award, 
  Download, 
  Eye, 
  FileText,
  ShieldCheck,
  X,
  RefreshCw
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/pages/certificates");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.content)) {
            setCertificates(data.content);
          }
        }
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return (
        <div className="w-full h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Breadcrumbs ── */}
      <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8 flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-slate-900 dark:text-slate-200">Сертификаты</span>
      </nav>

      {/* ── Page Header ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 mb-6 lg:mb-8">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-2">
                 <ShieldCheck className="w-4 h-4 text-[#2c3b6e] dark:text-blue-400" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400">Качество</span>
              </div>
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Сертификаты</h1>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-xs font-normal leading-relaxed opacity-70">
                 Международные стандарты безопасности.
              </p>
           </div>
      </section>

      {/* ── Certificates Grid ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-12 lg:pb-20">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {certificates.length > 0 ? certificates.map((cert, idx) => (
                  <div key={cert.id || idx} className="group bg-[#f8f9fa] dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100/50 dark:border-white/5 p-3 lg:p-4 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-300 relative flex flex-col h-full">
                     
                     {/* Image area */}
                     <div className="relative w-full aspect-[4/5] bg-slate-50 dark:bg-slate-900/50 rounded-[1rem] overflow-hidden mb-3 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                           {cert.imageUrl ? (
                             <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 dark:invert-[0.1]" />
                           ) : (
                             <div className="flex flex-col items-center gap-2 text-slate-200 dark:text-slate-700">
                                <FileText className="w-8 h-8" strokeWidth={1.2} />
                                <span className="text-[7px] font-black uppercase tracking-[0.3em]">No Document</span>
                             </div>
                           )}
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                           <button 
                             onClick={() => cert.imageUrl && setSelectedImage(cert.imageUrl)}
                             className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center hover:bg-[#2c3b6e] dark:hover:bg-blue-600 hover:text-white transition-all scale-90 group-hover:scale-100 duration-300 shadow-xl"
                           >
                              <Eye className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>

                     <div className="flex flex-col flex-1 px-1">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#2c3b6e] dark:text-blue-400 mb-1 opacity-60">{cert.provider}</span>
                        <h3 className="text-[11px] lg:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 line-clamp-2 leading-tight">{cert.title}</h3>
                        <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-slate-50 dark:border-white/5">
                           <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{cert.year}</span>
                           <button 
                              onClick={() => cert.imageUrl && setSelectedImage(cert.imageUrl)}
                              className="text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1 group/btn"
                           >
                              Открыть
                              <ChevronRight className="w-2.5 h-2.5 transition-transform group-hover/btn:translate-x-0.5" />
                           </button>
                        </div>
                     </div>
                  </div>
            )) : (
              <div className="col-span-full py-10 text-center text-slate-300 dark:text-slate-700 uppercase text-[8px] font-black tracking-widest border-2 border-dashed border-slate-50 dark:border-white/5 rounded-[1.5rem]">
                 Список пуст
              </div>
            )}
         </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-20">
         <div className="bg-[#1a1a1a] dark:bg-slate-800/50 rounded-2xl lg:rounded-[3rem] p-8 lg:p-12 text-center relative overflow-hidden border border-white/5">
            <div className="absolute top-0 left-0 w-full h-full bg-[#2c3b6e]/5 dark:bg-blue-900/10 blur-[100px] rounded-full" />
               <Award className="w-12 h-12 lg:w-16 lg:h-16 text-[#2c3b6e] dark:text-blue-500 mx-auto mb-4 lg:mb-6" strokeWidth={1} />
               <h2 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-2 lg:mb-4">Гарантия подлинности</h2>
               <p className="text-white/40 max-w-xl mx-auto text-[11px] lg:text-sm font-normal leading-relaxed mb-8 lg:mb-10 opacity-80">
                  Мы работаем напрямую с производителями и гарантируем 100% оригинальность всей продукции.
               </p>
               <Link href="/contacts" className="inline-flex items-center px-8 lg:px-10 h-12 lg:h-14 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black dark:hover:bg-white dark:hover:text-slate-900 transition-all shadow-lg">
                  Связаться с нами
               </Link>
         </div>
      </section>

      {/* ── Image Modal ── */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 lg:p-10">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedImage(null)}
               className="absolute inset-0 bg-slate-900/90 dark:bg-black/95 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
             >
                <img 
                  src={selectedImage} 
                  alt="Certificate Preview" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 lg:-right-12 text-white hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors p-2"
                >
                   <X className="w-8 h-8" />
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
