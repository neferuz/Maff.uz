"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, RotateCcw, AlertCircle, Phone, Square, ChevronRight, 
  CheckCircle2, Info, ArrowRight, ShieldPlus, BadgeCheck, Sparkles
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function WarrantyPage() {
  const warrantyFeatures = [
    {
      icon: ShieldPlus,
      title: "Заводская гарантия",
      description: "Официальная поддержка от производителя до 30 лет. Мы дистрибьюторы всех брендов.",
      meta: "Гарантийный талон"
    },
    {
      icon: RotateCcw,
      title: "Легкий возврат",
      description: "Обмен или возврат неиспользованного товара в течение 14 дней без лишних вопросов.",
      meta: "Закон РУз"
    },
    {
      icon: BadgeCheck,
      title: "Оригинал 100%",
      description: "Двойной контроль качества на соответствие геометрии перед каждой отгрузкой.",
      meta: "Контроль MAFF"
    }
  ];

  return (
    <div className="bg-white dark:bg-[#1a274b] min-h-screen transition-colors duration-500 relative pb-16">
      {/* ── Background Accent ── */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/5 dark:to-transparent pointer-events-none" />

      {/* ── Breadcrumbs ── */}
      <nav className="max-w-5xl mx-auto px-6 pt-4 pb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2 h-2 opacity-30" />
        <span className="text-slate-900 dark:text-blue-400/70">Гарантия</span>
      </nav>

      <section className="max-w-5xl mx-auto px-6 relative z-10 pt-2">
        
        {/* Header Section */}
        <ScrollReveal>
           <div className="max-w-xl mb-8">
              <div className="flex items-center gap-2 mb-3">
                 <ShieldCheck className="w-3.5 h-3.5 text-[#2c3b6e] dark:text-blue-400" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400/80">Сервисная политика</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">
                Гарантия и Возврат
              </h1>
              <p className="text-[12px] lg:text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Мы берем на себя полную ответственность за продукцию. Каждый клиент MAFF защищен официальными обязательствами производителей.
              </p>
           </div>
        </ScrollReveal>

        {/* Features Grid */}
        <ScrollReveal delay={100}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              {warrantyFeatures.map((feat, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-xl p-5 group transition-all">
                   <div className="w-8 h-8 bg-white dark:bg-white/5 flex items-center justify-center rounded-lg text-[#2c3b6e] dark:text-white mb-4">
                      <feat.icon className="w-4 h-4" />
                   </div>
                   <h3 className="text-[11px] lg:text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{feat.title}</h3>
                   <p className="text-[10px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug mb-4 opacity-90">{feat.description}</p>
                   <div className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-white dark:bg-white/5 rounded-md border border-slate-100 dark:border-white/5 w-fit text-[#2c3b6e] dark:text-blue-400">
                      {feat.meta}
                   </div>
                </div>
              ))}
           </div>
        </ScrollReveal>

        {/* Info & Steps (Tighter) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-10">
           <div className="lg:col-span-4 bg-[#2c3b6e] dark:bg-white p-6 rounded-2xl text-white dark:text-black flex flex-col justify-between">
              <div>
                 <div className="w-8 h-8 bg-white/10 dark:bg-black/5 rounded-lg flex items-center justify-center mb-4">
                    <Info className="w-4 h-4 text-white dark:text-black" />
                 </div>
                 <h2 className="text-lg font-black uppercase tracking-tighter leading-none mb-3">Важно</h2>
                 <p className="text-[9px] font-bold opacity-70 leading-relaxed uppercase tracking-widest">
                    Сохраняйте чек и соблюдайте правила эксплуатации для действия гарантии.
                 </p>
              </div>
              <div className="mt-6">
                 <Link href="tel:+998712055454" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter hover:opacity-70 transition-all">
                    <Phone className="w-3.5 h-3.5" />
                    +998 71 205-54-54
                 </Link>
              </div>
           </div>

           <div className="lg:col-span-8 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Процедура возврата</h3>
                 <div className="h-px bg-slate-200 dark:bg-white/5 flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 {[
                    { s: "01", t: "Заявление", d: "Бланк возврата в любом из шоу-румов." },
                    { s: "02", t: "Осмотр", d: "Проверка сохранности упаковки товара." },
                    { s: "03", t: "Возврат", d: "Выплата средств тем же способом оплаты." }
                 ].map((step, idx) => (
                    <div key={idx} className="space-y-1.5 relative">
                       <div className="text-2xl font-black text-slate-900/5 dark:text-white/[0.02] absolute -top-2 -left-1 pointer-events-none">0{idx + 1}</div>
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400 relative z-10">{step.t}</h4>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight relative z-10 opacity-90">{step.d}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Final CTA (Slimmer) */}
        <ScrollReveal delay={200}>
           <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                 <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Возникли вопросы?</h3>
                 <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Специалисты отдела рекламаций помогут вам</p>
              </div>
              <Link href="/contacts" className="h-12 px-8 bg-[#2c3b6e] dark:bg-white text-white dark:text-black rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#1a1a1a] dark:hover:bg-blue-400 dark:hover:text-white transition-all flex items-center gap-2 active:scale-95 group">
                 Получить помощь
                 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </ScrollReveal>

      </section>
    </div>
  );
}
