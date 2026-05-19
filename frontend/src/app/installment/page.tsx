"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, Zap, Clock, CreditCard, Smartphone, ArrowRight, ShieldCheck, 
  CheckCircle2, Wallet, BadgePercent, Coins, Handshake, Users, Target, Award, 
  Shield, Search, MessageSquare, Package, Truck, Sparkles, Send, ShieldPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const iconMap: Record<string, any> = {
  CreditCard, Smartphone, Zap, Clock, ShieldCheck, CheckCircle2, Wallet, BadgePercent, Coins, Handshake, Users, Target, Award, Shield, Search, MessageSquare, Package, Truck
};

export default function InstallmentPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/pages/installment")
      .then(res => res.json())
      .then(result => {
        if (result && result.content) {
          setData(result.content);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching installment data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="bg-white dark:bg-[#1a274b] min-h-screen pb-16">
      <nav className="max-w-6xl mx-auto px-6 pt-4 pb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        <span className="w-8 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        <span>/</span>
        <span className="w-16 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
      </nav>
      <div className="max-w-6xl mx-auto px-6 pt-2 space-y-8">
        <div className="max-w-xl space-y-3">
           <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
           <div className="w-80 h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
           <div className="w-full h-14 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
           {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                 <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
                 <div className="w-16 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
           ))}
        </div>
        <div className="space-y-6">
           <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 p-5 rounded-2xl animate-pulse space-y-3">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const partners = data?.partners || [];
  const steps = data?.steps || [];
  const benefits = data?.benefits || [];
  const title = data?.title || "Рассрочка 0%";
  const description = data?.description || "Приобретайте лучшие материалы сегодня, платите потом. Без процентов и скрытых комиссий.";

  return (
    <div className="bg-white dark:bg-[#1a274b] min-h-screen transition-colors duration-500 relative pb-16">
      {/* ── Background Accent ── */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/5 dark:to-transparent pointer-events-none" />

      {/* ── Breadcrumbs ── */}
      <nav className="max-w-6xl mx-auto px-6 pt-4 pb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white">MAFF</Link>
        <ChevronRight className="w-2 h-2 opacity-30" />
        <span className="text-slate-900 dark:text-blue-400/60">Рассрочка</span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 relative z-10 pt-2">
        
        {/* 1. Compact Header */}
        <ScrollReveal>
           <div className="mb-8 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                 <ShieldPlus className="w-3.5 h-3.5 text-[#2c3b6e] dark:text-blue-400" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-400/80">Программа лояльности</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">
                {title}
              </h1>
              <p className="text-[13px] lg:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {description}
              </p>
           </div>
        </ScrollReveal>

        {/* 2. Ultra-Compact Benefits Grid */}
        <ScrollReveal delay={100}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {benefits.map((item: any, i: number) => {
                 const Icon = iconMap[item.icon] || CheckCircle2;
                 return (
                    <div key={i} className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-xl p-4 flex items-center gap-3 group transition-all">
                       <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center text-[#2c3b6e] dark:text-white flex-shrink-0">
                          <Icon className="w-4 h-4" />
                       </div>
                       <h3 className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                          {typeof item === 'string' ? item : item.title}
                       </h3>
                    </div>
                 );
              })}
           </div>
        </ScrollReveal>

        {/* 3. How it Works (Now higher and more compact) */}
        <ScrollReveal delay={200}>
           <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Как оформить</h2>
                 <div className="h-px bg-slate-100 dark:bg-white/5 flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 {steps.map((s: any, idx: number) => {
                    const StepIcon = iconMap[s.icon] || ShieldCheck;
                    return (
                      <div key={idx} className="bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 p-5 rounded-2xl flex flex-col items-start relative overflow-hidden group">
                         <div className="absolute top-2 right-4 text-4xl font-black text-slate-900/5 dark:text-white/[0.02]">0{idx + 1}</div>
                         <div className="w-8 h-8 rounded-lg bg-[#2c3b6e]/5 dark:bg-white/5 flex items-center justify-center text-[#2c3b6e] dark:text-white mb-4">
                            <StepIcon className="w-4 h-4" />
                         </div>
                         <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5 relative z-10">{s.title}</h4>
                         <p className="text-[10px] lg:text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium relative z-10">{s.description}</p>
                      </div>
                    );
                 })}
              </div>
           </div>
        </ScrollReveal>

        {/* 4. Bank Partners (Minimalist footer style) */}
        <ScrollReveal delay={300}>
           <div className="mb-10 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                 <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Партнерские банки</h3>
                 <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">Официальное одобрение за 15 минут</p>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-40 dark:opacity-20 hover:opacity-100 transition-opacity duration-700">
                 {partners.map((p: any, idx: number) => (
                    <div key={idx} className="relative w-16 h-6 grayscale dark:invert dark:brightness-200">
                       <Image src={p.logo} alt={p.name} fill className="object-contain" />
                    </div>
                 ))}
              </div>
           </div>
        </ScrollReveal>

        {/* 5. CTA Button (Slimmer) */}
        <ScrollReveal delay={400}>
           <div className="flex flex-col items-center">
              <Link href="/contacts" className="h-14 px-12 bg-[#2c3b6e] dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#1a1a1a] dark:hover:bg-blue-400 dark:hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-none group">
                 Получить консультацию
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="mt-4 text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Услуга предоставляется бесплатно</p>
           </div>
        </ScrollReveal>

      </section>
    </div>
  );
}
