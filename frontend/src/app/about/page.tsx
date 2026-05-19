"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  ChevronRight,
  Award,
  Globe,
  MapPin,
  RefreshCw,
  Clock,
  Target,
  Users2,
  Phone,
  ShieldCheck,
  Truck,
  HeartHandshake,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const IconMap: Record<string, any> = {
  Clock, Gem: Award, Users, Building2: Globe, ShieldCheck, Truck, HeartHandshake, Target, Award, MapPin, Phone, Globe, Users2, Check: CheckCircle2, CheckCircle2
};

export default function AboutPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/pages/about");
        if (res.ok) {
          const data = await res.json();
          setPageData(data.content);
        }
      } catch (err) {
        console.error("Failed to fetch about page content:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading || !pageData) {
    return (
      <div className="bg-white dark:bg-slate-950 min-h-screen pb-16">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        </nav>
        <div className="max-w-7xl mx-auto px-6 pt-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
             <div className="lg:col-span-6 space-y-4 animate-pulse">
                <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded" />
             </div>
             <div className="lg:col-span-6 aspect-[16/9] lg:aspect-[4/2.5] bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[1.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  const hero = pageData.hero || {};
  const mission = pageData.mission || { values: [] };
  const history = pageData.history || { milestones: pageData.milestones || [] };
  const stats = pageData.stats || [];
  const coreValues = pageData.values || [];
  const team = pageData.team || [];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-12 selection:bg-[#2c3b6e] selection:text-white transition-colors duration-500">
      
      {/* ── Compact Nav ── */}
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF.UZ</Link>
          <ChevronRight className="w-2 h-2 opacity-30" />
          <span className="text-slate-900 dark:text-slate-200">ABOUT</span>
        </div>
        <div className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">EST. 2004</div>
      </nav>

      {/* ── 1. Hero Section ── */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-12">
        <ScrollReveal direction="up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-[1.5px] bg-[#2c3b6e] dark:bg-blue-500" />
                     <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-500">Экспертиза</span>
                  </div>
                  <h1 className="text-[36px] lg:text-[44px] font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.95]">
                    {hero.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] lg:text-[13px] font-medium leading-relaxed uppercase tracking-tight max-w-sm">
                    {hero.description || hero.subtitle}
                  </p>
               </div>
               <div className="flex items-center gap-4 pt-2">
                  <Link href="/catalog" className="px-6 h-10 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:bg-slate-900 dark:hover:bg-blue-500 transition-all">
                     Каталог
                  </Link>
                  <Link href="/contacts" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200 flex items-center gap-2 group">
                     Контакты
                     <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
            <div className="lg:col-span-6">
               <img 
                 src={hero.image} 
                 alt="Hero" 
                 className="w-full h-auto rounded-[1.5rem] border border-slate-100 dark:border-slate-800 opacity-90 dark:opacity-80"
               />
            </div>
          </div>
        </ScrollReveal>
      </header>

      {/* ── 2. Mission & Statistics ── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Mission Content */}
            <div className="lg:col-span-7 space-y-8">
               <ScrollReveal direction="up">
                 <div className="space-y-3">
                    <span className="text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-[0.4em]">Наше видение</span>
                    <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                      {mission.title}
                    </h2>
                    <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-2xl">
                      {mission.description}
                    </p>
                 </div>
               </ScrollReveal>

               {/* Mission Values Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mission.values?.map((v: any, i: number) => {
                    const Icon = IconMap[v.icon] || Target;
                    return (
                      <ScrollReveal key={i} direction="up" delay={i * 0.05}>
                        <div className="flex gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#2c3b6e] dark:text-blue-400 flex-shrink-0">
                             <Icon className="w-4 h-4" />
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black uppercase text-slate-900 dark:text-white mb-0.5 tracking-tight">{v.title}</h4>
                             <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{v.desc || v.description}</p>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
               </div>
            </div>

            {/* Statistics Sidebar */}
            <div className="lg:col-span-5 flex flex-col justify-center">
               <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                  {stats.map((s: any, i: number) => (
                    <ScrollReveal key={i} direction="right" delay={i * 0.05}>
                      <div className="flex items-end justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                         <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{s.label}</div>
                         <div className="text-2xl lg:text-3xl font-black text-[#2c3b6e] dark:text-blue-400 tracking-tighter leading-none">{s.value}</div>
                      </div>
                    </ScrollReveal>
                  ))}
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Our Story ── */}
      <section className="py-12 max-w-7xl mx-auto px-6 overflow-hidden">
         <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[9px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-[0.5em]">История развития</h3>
               <div className="w-16 h-[1px] bg-slate-100 dark:bg-slate-800 hidden lg:block" />
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
               {history.milestones?.map((m: any, i: number) => (
                 <div key={i} className="min-w-[180px] lg:min-w-[240px] space-y-3">
                    <div className="text-[9px] font-black text-[#2c3b6e] dark:text-blue-500">{m.year}</div>
                    <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 relative">
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2c3b6e] dark:bg-blue-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200 tracking-tight leading-tight">
                       {m.title || m.event}
                    </p>
                 </div>
               ))}
            </div>
         </ScrollReveal>
      </section>

      {/* ── 4. The Team ── */}
      <section className="bg-[#2c3b6e] dark:bg-slate-900 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[8px] font-black text-white/40 dark:text-white/20 uppercase tracking-[0.5em] mb-3 block">Команда</span>
              <h2 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                Наши эксперты
              </h2>
            </div>
            <p className="text-white/40 dark:text-white/20 text-[9px] lg:text-[11px] font-medium uppercase tracking-tight max-w-[280px]">
              Создаем лучшие решения для ваших интерьеров.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {team.map((member: any, i: number) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.05}>
                <div className="bg-white/5 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700/50 rounded-[1.5rem] overflow-hidden group hover:bg-white/10 dark:hover:bg-slate-800 transition-all duration-300">
                  <div className="aspect-[4/5] relative grayscale hover:grayscale-0 transition-all duration-700">
                    <Image 
                      src={member.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"} 
                      alt={member.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-[11px] lg:text-[12px] font-black uppercase tracking-tight text-white mb-0.5 leading-none">{member.name}</h4>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30 leading-none">{member.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Values & CTA ── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Core Values List */}
            <div className="lg:col-span-7 space-y-8">
               <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-[0.5em]">Принципы</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {coreValues.map((v: any, i: number) => {
                    const Icon = IconMap[v.icon] || Award;
                    return (
                      <div key={i} className="space-y-2">
                         <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#f0a400]" />
                            <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-tight">{v.title}</h4>
                         </div>
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{v.description}</p>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Final CTA */}
            <div className="lg:col-span-5">
               <div className="bg-[#f8f9fa] dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 lg:p-10 text-center space-y-6 shadow-none">
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                     Сделаем ваш <br/>дом уютнее
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-[12px] font-medium uppercase tracking-tight max-w-[200px] mx-auto">
                     Бесплатная консультация и точный замер объекта.
                  </p>
                  <Link href="/contacts" className="inline-flex items-center justify-center gap-2 w-full h-12 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 dark:hover:bg-blue-500 transition-all group">
                    Начать проект
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

         </div>
      </section>

    </div>
  );
}
