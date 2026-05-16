"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Handshake, CheckCircle2, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

export default function PartnersPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/pages/partners-main");
        if (res.ok) {
          const data = await res.json();
          if (data.content) setPageData(data.content);
        }
      } catch (err) {
        console.error("Failed to fetch partners page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const data = pageData || {
    title: "Развивайте бизнес вместе с MAFF",
    subtitle: "Сотрудничество",
    description: "Мы создаем экосистему для профессионалов рынка отделочных материалов. Выберите свою категорию, чтобы узнать о преимуществах работы с нами.",
    partnerTypes: [
      { slug: "masters", title: "Мастерам", description: "Специальные условия для профессиональных монтажников и укладчиков." },
      { slug: "developers", title: "Застройщикам", description: "Комплексные решения для строительных компаний и девелоперов." },
      { slug: "designers", title: "Дизайнерам", description: "Эксклюзивные каталоги и гибкие условия для дизайн-студий и архитекторов." },
      { slug: "foremen", title: "Прорабам", description: "Надежные поставки и техническая поддержка для руководителей объектов." },
      { slug: "dealers", title: "Дилерам", description: "Возможность стать официальным представителем ведущих брендов в вашем регионе." },
    ]
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Breadcrumbs ── */}
      <nav className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6 flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-slate-900 dark:text-slate-200">Для партнеров</span>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 pt-2 lg:pt-4 pb-6 lg:pb-8 border-b border-slate-50 dark:border-slate-800">
        <ScrollReveal>
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 lg:gap-2.5 mb-3 lg:mb-4">
                 <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg lg:rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                    <Handshake className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2c3b6e] dark:text-blue-400" />
                 </div>
                 <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400">{data.subtitle}</span>
              </div>
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight lg:leading-none mb-3 lg:mb-4">
                 {data.title}
              </h1>
              <p className="text-[10px] lg:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl opacity-80">
                 {data.description}
              </p>
           </div>
        </ScrollReveal>
      </section>

      {/* ── Partner Grid ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {(data.partnerTypes || []).map((type: any, idx: number) => (
               <ScrollReveal key={type.slug} delay={idx * 100}>
                  <Link 
                     href={`/partners/${type.slug}`}
                     className="group block p-5 lg:p-7 bg-slate-50 dark:bg-slate-800/50 rounded-xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-500 h-full relative overflow-hidden"
                  >
                     <div className="absolute top-0 right-0 p-4 lg:p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Handshake className="w-12 h-12 lg:w-16 lg:h-16 text-[#2c3b6e] dark:text-blue-400 -rotate-12" />
                     </div>
                     <h3 className="text-[14px] lg:text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1.5 lg:mb-2.5 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors">{type.title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-[9px] lg:text-[11px] leading-relaxed mb-4 lg:mb-6 max-w-[220px] lg:max-w-none">{type.description}</p>
                     
                     <div className="flex items-center gap-2 text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-300 group-hover:gap-3 transition-all">
                        Узнать больше
                        <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#2c3b6e] dark:text-blue-400" />
                     </div>
                  </Link>
               </ScrollReveal>
            ))}
         </div>
      </section>
    </div>
  );
}
