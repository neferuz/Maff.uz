"use client";

import React, { useState, useEffect } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Plus, Minus, HelpCircle, Box, Truck, CreditCard, ShieldCheck, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: { [key: string]: any } = {
  HelpCircle,
  Box,
  Truck,
  CreditCard,
  ShieldCheck
};


export default function FAQPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: number | null }>({});
  const [faqData, setFaqData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const res = await fetch("/api/v1/pages/faq");
        if (res.ok) {
          const data = await res.json();
          setFaqData(data.content || []);
        }
      } catch (err) {
        console.error("Failed to fetch FAQ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    setOpenItems(prev => ({
      ...prev,
      [categoryIndex]: prev[categoryIndex] === itemIndex ? null : itemIndex
    }));
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Page Header ── */}
      <section className="w-full bg-[#f8f9fa] dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-6 lg:py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#2c3b6e]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
             <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 mb-2 lg:mb-2.5">
                   <span className="w-4 lg:w-6 h-[1.5px] bg-[#2c3b6e]" />
                   <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400">Помощь клиентам</span>
                   <span className="w-4 lg:w-6 h-[1.5px] bg-[#2c3b6e]" />
                </div>
                <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Вопросы и ответы</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl text-[9px] lg:text-xs font-medium leading-relaxed opacity-80">
                   Ответы на самые часто задаваемые вопросы
                </p>
             </div>
        </div>
      </section>

      {/* ── FAQ Content ── */}
      <section className="max-w-3xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
         {loading ? (
            <div className="flex justify-center py-12">
               <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
            </div>
         ) : faqData && Array.isArray(faqData) && faqData.length > 0 ? (
           faqData.map((cat, cIdx) => (
            <div key={cIdx} className="mb-6 lg:mb-8 last:mb-0">
               <div className="flex items-center gap-2.5 mb-3 lg:mb-4 px-1">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#2c3b6e] dark:text-blue-400">
                     {(() => {
                        const Icon = ICON_MAP[cat.icon] || HelpCircle;
                        return <Icon className="w-4 h-4" />;
                     })()}
                  </div>
                  <h2 className="text-sm lg:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.category}</h2>
               </div>
               
               <div className="space-y-4">
                  {cat.items && Array.isArray(cat.items) && cat.items.map((item: any, iIdx: number) => (
                    <AccordionItem 
                       key={iIdx}
                       q={item.q}
                       a={item.a}
                       isOpen={openItems[cIdx] === iIdx}
                       onClick={() => toggleItem(cIdx, iIdx)}
                    />
                  ))}
               </div>
            </div>
           ))
         ) : (
            <div className="text-center py-20 text-slate-400 font-medium">
               Вопросы еще не добавлены.
            </div>
         )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-12 lg:pb-16">
         <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-12 flex flex-col items-center text-center">
             <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-[#2c3b6e] dark:text-blue-400 mb-4">
                <HelpCircle className="w-5 lg:w-6 h-5 lg:h-6" />
             </div>
             <h2 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Не нашли ответ?</h2>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] lg:text-xs font-medium mb-6 max-w-md">
                Наши менеджеры всегда на связи и готовы проконсультировать вас.
             </p>
             <div className="flex flex-wrap justify-center gap-2 lg:gap-3 w-full lg:w-auto">
                <button className="flex-grow lg:flex-grow-0 px-8 py-3.5 bg-[#2c3b6e] text-white rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                   Консультация
                </button>
                <button className="flex-grow lg:flex-grow-0 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                   Telegram
                </button>
             </div>
         </div>
      </section>
    </div>
  );
}

function AccordionItem({ q, a, isOpen, onClick }: { q: string, a: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className={cn(
      "group border transition-all duration-500 rounded-[1.5rem] lg:rounded-[2rem] bg-[#f8f9fa] dark:bg-slate-800/50 overflow-hidden",
      isOpen ? "border-[#2c3b6e]/20 bg-white dark:bg-slate-800 shadow-[0_10px_30px_-10px_rgba(44,59,110,0.1)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] scale-[1.02]" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
    )}>
      <button
        onClick={onClick}
        className="w-full px-4 lg:px-6 py-3.5 lg:py-4.5 flex items-center justify-between text-left"
      >
        <span className={cn(
          "text-[10px] lg:text-[13px] font-bold uppercase tracking-tight transition-colors leading-snug pr-4",
          isOpen ? "text-[#2c3b6e] dark:text-blue-400" : "text-slate-900 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-white"
        )}>
          {q}
        </span>
        <div className={cn(
          "w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all duration-300",
          isOpen ? "bg-[#2c3b6e] border-[#2c3b6e] text-white rotate-180" : "bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400"
        )}>
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </div>
      </button>
      <div className={cn(
        "px-4 lg:px-6 transition-all duration-500 ease-in-out overflow-hidden text-[9px] lg:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed",
        isOpen ? "max-h-[500px] pb-4 lg:pb-6 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="pt-3 border-t border-slate-50 dark:border-slate-700/50">
          {a}
        </div>
      </div>
    </div>
  );
}
