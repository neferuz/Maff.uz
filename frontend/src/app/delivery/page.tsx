"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, Truck, Clock, CreditCard, ShieldCheck, MapPin, Phone, Info, RefreshCw, Send, ArrowRight, PackageCheck, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const IconMap: Record<string, any> = {
  Truck, MapPin, Clock, CreditCard, ShieldCheck, Info
};

export default function DeliveryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await fetch("/api/v1/pages/delivery");
        if (res.ok) {
          const result = await res.json();
          setData(result.content);
        }
      } catch (e) {
        console.error("Failed to fetch delivery info", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
           <div className="lg:col-span-7 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8 space-y-8">
              {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-5 animate-pulse">
                    <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="flex-1 space-y-2">
                       <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                       <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                 </div>
              ))}
           </div>
           <div className="lg:col-span-5 bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8 space-y-4">
              {[1, 2, 3].map(i => (
                 <div key={i} className="p-4 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl animate-pulse space-y-2">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                       <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  const deliveryOptions = data?.deliveryOptions || [
    { title: "Доставка по Ташкенту", description: "Осуществляется в течение 24 часов с момента заказа.", meta: "Бесплатно от 10 млн", icon: "Truck" },
    { title: "Доставка по регионам", description: "Отгрузка через транспортные компании во все города Узбекистана.", meta: "По тарифу ТК", icon: "MapPin" },
    { title: "Самовывоз", description: "Заберите заказ из нашего центрального шоу-рума в любое удобное время.", meta: "Пн-Сб 09:00-20:00", icon: "Clock" }
  ];
  const paymentMethods = data?.paymentMethods || [
    { title: "Наличными", description: "Оплата в шоу-руме или курьеру при получении товара.", icon: "CreditCard" },
    { title: "Терминал / Click / Uzum", description: "Все виды электронных платежей и QR-оплата.", icon: "Smartphone" },
    { title: "Безналичный расчет", description: "Для юридических лиц с предоставлением всех закрывающих документов.", icon: "ShieldCheck" }
  ];
  const header = data?.header || { title: "Логистика и Оплата", subtitle: "Обеспечиваем бережную доставку и удобные способы расчета для вашего комфорта." };

  return (
    <div className="bg-white dark:bg-[#1a274b] min-h-screen transition-colors duration-500 relative pb-16">
      {/* ── Background Accent ── */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-50/20 to-transparent dark:from-blue-900/5 dark:to-transparent pointer-events-none" />

      {/* ── Breadcrumbs ── */}
      <nav className="max-w-6xl mx-auto px-6 pt-4 pb-1 flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2 h-2 opacity-30" />
        <span className="text-slate-900 dark:text-blue-400/80">Сервис</span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 relative z-10 pt-4">
        
        {/* Header Section */}
        <ScrollReveal>
           <div className="max-w-2xl mb-10">
              <div className="mb-4">
                 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#2c3b6e] dark:text-blue-400">Сервис и Логистика</span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">
                {header.title}
              </h1>
              <p className="text-[13px] lg:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {header.subtitle}
              </p>
           </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
           
           {/* Left Part: Delivery Options */}
           <div className="lg:col-span-7 space-y-4">
              <ScrollReveal delay={100}>
                 <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3b6e] dark:text-blue-400 mb-8">Условия доставки:</h2>
                    <div className="space-y-8">
                       {deliveryOptions.map((opt: any, idx: number) => {
                          const Icon = IconMap[opt.icon] || Truck;
                          return (
                            <div key={idx} className="flex gap-5 group">
                               <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-[#2c3b6e] dark:text-white border border-slate-100 dark:border-white/5">
                                  <Icon className="w-4.5 h-4.5" />
                               </div>
                               <div className="flex-1">
                                  <h3 className="text-[12px] lg:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{opt.title}</h3>
                                  <p className="text-[11px] lg:text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-3 opacity-90">{opt.description}</p>
                                  {opt.meta && (
                                    <span className="inline-block px-3 py-1 bg-white dark:bg-white/5 text-[#2c3b6e] dark:text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-slate-100 dark:border-white/5">
                                       {opt.meta}
                                    </span>
                                  )}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                 <div className="bg-[#2c3b6e] dark:bg-white p-6 lg:p-8 rounded-[2rem] text-white dark:text-black flex items-center justify-between gap-6 overflow-hidden relative">
                    <div className="relative z-10">
                       <h3 className="text-sm lg:text-base font-black uppercase tracking-tight mb-2">Рассчитать стоимость?</h3>
                       <p className="text-[11px] font-medium opacity-70 mb-0">Свяжитесь с менеджером для точного расчета доставки на ваш объект.</p>
                    </div>
                    <Link href="/contacts" className="flex-shrink-0 w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center text-[#2c3b6e] dark:text-white hover:scale-110 transition-all active:scale-95 shadow-none relative z-10">
                       <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Truck className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 dark:text-black/5 -rotate-12 pointer-events-none" />
                 </div>
              </ScrollReveal>
           </div>

           {/* Right Part: Payment & Support */}
           <div className="lg:col-span-5 space-y-4">
              <ScrollReveal delay={300}>
                 <div className="bg-white dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2c3b6e] dark:text-blue-400 mb-8">Способы оплаты:</h2>
                    <div className="space-y-2">
                       {paymentMethods.map((method: any, idx: number) => {
                          const Icon = IconMap[method.icon] || CreditCard;
                          return (
                            <div key={idx} className="p-4 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-slate-50 dark:border-white/5 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all group">
                               <div className="flex items-center gap-3 mb-2">
                                  <div className="w-7 h-7 bg-white dark:bg-white/5 rounded-lg flex items-center justify-center text-[#2c3b6e] dark:text-white border border-slate-100 dark:border-white/5">
                                     <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{method.title}</h3>
                               </div>
                               <p className="text-[10px] lg:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug opacity-90">
                                  {method.description}
                               </p>
                            </div>
                          );
                       })}
                    </div>
                 </div>
              </ScrollReveal>

              <ScrollReveal delay={400}>
                 <div className="p-6 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors border border-slate-100 dark:border-white/5">
                       <Phone className="w-5 h-5" />
                    </div>
                    <div>
                       <span className="block text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-1">Горячая линия</span>
                       <span className="block text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none">+998 71 205-54-54</span>
                    </div>
                 </div>
              </ScrollReveal>
           </div>

        </div>
      </section>
    </div>
  );
}
