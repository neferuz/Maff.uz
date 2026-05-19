"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CheckCircle2, ArrowLeft, Send, User, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const partnerData: Record<string, any> = {
  masters: {
    title: "Мастерам",
    intro: "Уважаемые мастера и специалисты по укладке!",
    content: "Мы ценим ваш профессионализм и знаем, насколько важны качественные материалы для идеального результата. MAFF предлагает мастерам не просто продукцию, а полноценное партнерство, основанное на технической поддержке и выгодных условиях.",
    benefits: [
      "Специальные партнерские цены на весь ассортимент",
      "Техническая поддержка и консультации технологов 24/7",
      "Бесплатные образцы и каталоги для работы с клиентами",
      "Обучение новым технологиям укладки от европейских брендов",
      "Возможность получения заказов от наших шоу-румов",
      "Приоритетное информирование о новинках и складских остатках"
    ],
    detail: "Для мастеров мы разработали программу лояльности, которая позволяет не только получать лучшие цены, но и профессионально расти вместе с нами. Мы регулярно проводим мастер-классы и семинары с участием представителей заводов AGT, Barlinek и Kronotex."
  },
  developers: {
    title: "Застройщикам",
    intro: "Уважаемые застройщики и девелоперы!",
    content: "MAFF предлагает комплексные решения для комплектации жилых и коммерческих объектов любого масштаба. Мы обеспечиваем стабильность поставок и соответствие всем строительным стандартам.",
    benefits: [
      "Объектные скидки и специальные проектные цены",
      "Резервирование больших партий товара на складе",
      "Сертификация всей продукции согласно ГОСТ и ISO",
      "Техническое сопровождение на всех этапах строительства",
      "Индивидуальные графики поставок под этапы работ",
      "Подбор альтернатив под заданный бюджет (value engineering)"
    ],
    detail: "Сотрудничество с нами гарантирует отсутствие простоев на объекте. Мы берем на себя всю логистику и контроль качества, позволяя вам сосредоточиться на строительстве."
  },
  designers: {
    title: "Дизайнерам",
    intro: "Уважаемые дизайнеры и архитекторы!",
    content: "Мы понимаем, что каждый ваш проект уникален. MAFF — это ваш надежный инструмент для реализации самых смелых интерьерных идей с использованием лучших напольных покрытий и дверей.",
    benefits: [
      "Эксклюзивные каталоги и текстуры для 3D-визуализации",
      "Персональный менеджер для оперативного подбора материалов",
      "Специальные бонусы за реализацию проектов",
      "Возможность бронирования образцов для встреч с заказчиками",
      "Участие в закрытых презентациях новых коллекций",
      "Профессиональная фотосъемка ваших реализованных объектов"
    ],
    detail: "Давайте вместе создавать пространства, которые вдохновляют. Мы предоставим вам все необходимые технические данные и образцы, чтобы вы могли уверенно защищать свои проекты перед заказчиками."
  },
  foremen: {
    title: "Прорабам",
    intro: "Уважаемые прорабы и руководители объектов!",
    content: "Ваша задача — сдать объект в срок и качественно. Наша задача — обеспечить вас всем необходимым вовремя и без лишней бюрократии.",
    benefits: [
      "Оперативная доставка день-в-день или по звонку",
      "Гибкие условия возврата остатков продукции",
      "Персональный прайс-лист и система лояльности",
      "Постоянное наличие расходных материалов и аксессуаров",
      "Помощь в расчете точного количества материалов",
      "Контроль качества каждой партии перед отгрузкой"
    ],
    detail: "Работая с MAFF, вы получаете надежного партнера, который понимает специфику работы на стройплощадке. Мы ценим ваше время и гарантируем отсутствие рекламаций по качеству материалов."
  },
  dealers: {
    title: "Дилерам",
    intro: "Уважаемые дилеры и торговые представители!",
    content: "Мы рады пригласить вас к сотрудничеству с нашей компанией! Станьте частью сети MAFF и получите доступ к портфелю ведущих мировых брендов на эксклюзивных условиях.",
    benefits: [
      "Возможность эксклюзивного представления брендов в регионе",
      "Максимальные дилерские скидки и ретро-бонусы",
      "Маркетинговая и информационная поддержка (POS-материалы)",
      "Обучение персонала вашей торговой точки",
      "Регулярное пополнение ассортимента эксклюзивными новинками",
      "Совместные рекламные кампании для привлечения трафика"
    ],
    detail: "Для дилеров мы предлагаем прозрачные условия сотрудничества, четкие границы регионов и защиту проектов. Давайте развивать рынок качественных отделочных материалов вместе!"
  },
  wholesale: {
    title: "Оптовикам",
    intro: "Уважаемые оптовые покупатели!",
    content: "MAFF предлагает выгодные условия для оптовых поставок напольных покрытий и дверей. Мы обеспечиваем конкурентные цены и стабильность складских запасов.",
    benefits: [
      "Индивидуальная система скидок от объема закупок",
      "Приоритетная отгрузка товаров со склада",
      "Помощь в организации логистики",
      "Полный пакет сопроводительных документов",
      "Резервирование продукции под ваши потребности",
      "Маркетинговые материалы для ваших торговых точек"
    ],
    detail: "Мы заинтересованы в долгосрочном и взаимовыгодном партнерстве с оптовыми компаниями. Наша логистическая сеть позволяет оперативно доставлять заказы в любую точку страны."
  },
  architects: {
    title: "Архитекторам",
    intro: "Уважаемые архитекторы!",
    content: "MAFF сотрудничает с ведущими архитектурными бюро, предоставляя полный спектр материалов для создания уникальных пространств.",
    benefits: [
      "Доступ к эксклюзивным коллекциям и лимитированным сериям",
      "Техническая документация и BIM-модели продукции",
      "Профессиональные консультации по подбору материалов",
      "Образцы для шоу-румов и проектных студий",
      "Специальные условия для авторских проектов",
      "Информационная поддержка и освещение проектов в наших медиа"
    ],
    detail: "Ваши архитектурные идеи заслуживают лучшей реализации. Мы предоставим все необходимые инструменты и материалы, чтобы ваш проект стал эталоном качества и стиля."
  }
};

export default function PartnerPageClient({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/pages/partner-${slug}`);
        if (res.ok) {
          const result = await res.json();
          if (result.content) setData(result.content);
        }
      } catch (err) {
        console.error("Failed to fetch partner data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
     return (
        <div className="bg-white dark:bg-[#1a274b] min-h-screen pb-12">
          <nav className="max-w-6xl mx-auto px-6 pt-4 pb-2 flex items-center gap-2 text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
             <span className="w-8 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
             <span>/</span>
             <span className="w-16 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          </nav>
          <div className="max-w-6xl mx-auto px-6 pt-2 pb-12 space-y-8">
             <div className="max-w-3xl space-y-4 animate-pulse">
                <div className="w-12 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-14 bg-slate-200 dark:bg-slate-800 rounded" />
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8 space-y-4 animate-pulse">
                   <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex gap-2">
                            <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                         </div>
                      ))}
                   </div>
                </div>
                <div className="lg:col-span-4 bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8 animate-pulse space-y-4">
                   <div className="w-full h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                   <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
             </div>
          </div>
        </div>
     );
  }

  const currentData = data || partnerData[slug];

  if (!currentData) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-[#1a274b] transition-colors duration-500 relative pb-12">
      {/* ── Background Accent ── */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-900/5 dark:to-transparent pointer-events-none" />

      {/* ── Breadcrumbs ── */}
      <nav className="max-w-6xl mx-auto px-6 pt-4 pb-2 flex items-center gap-2 text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">MAFF</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-30" />
        <Link href="/partners" className="hover:text-slate-900 dark:hover:text-white transition-colors">Партнеры</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-30" />
        <span className="text-slate-900 dark:text-blue-400/70">{currentData.title}</span>
      </nav>

      {/* ── Content Section ── */}
      <section className="max-w-6xl mx-auto px-6 pt-2 pb-12 relative z-10">
        <ScrollReveal>
           <div className="max-w-3xl mb-8">
              <Link href="/partners" className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all mb-3 group">
                 <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                 Назад
              </Link>
              <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-3">
                 {currentData.title}
              </h1>
              <p className="text-sm lg:text-base font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-tight mb-2">
                 {currentData.intro}
              </p>
              <p className="text-[13px] lg:text-sm text-slate-600 dark:text-slate-400 font-medium leading-snug">
                 {currentData.content}
              </p>
           </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Left Part: Benefits */}
           <div className="lg:col-span-8 space-y-8">
              <ScrollReveal delay={100}>
                 <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8">
                    <h2 className="text-sm lg:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6">Ваши преимущества:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                       {currentData.benefits?.map((benefit: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5">
                             <CheckCircle2 className="w-4.5 h-4.5 text-[#2c3b6e] dark:text-blue-500 flex-shrink-0 mt-0.5" />
                             <p className="text-[13px] lg:text-[14px] text-slate-700 dark:text-slate-300 font-bold leading-tight">{benefit}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </ScrollReveal>

              {/* Individual Conditions Callout */}
              <ScrollReveal delay={200}>
                 <div className="p-5 lg:p-6 bg-[#2c3b6e]/5 dark:bg-blue-900/10 rounded-2xl border border-[#2c3b6e]/10 dark:border-blue-400/10">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 rounded-lg bg-[#2c3b6e] dark:bg-blue-600 flex items-center justify-center text-white">
                          <Star className="w-4 h-4" />
                       </div>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400">Особые условия</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-snug font-medium text-[13px] lg:text-[15px]">
                       {currentData.detail}
                    </p>
                 </div>
              </ScrollReveal>
           </div>

           {/* Right Part: Final CTA & Signature */}
           <div className="lg:col-span-4 lg:sticky lg:top-8">
              <ScrollReveal delay={300}>
                 <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-6 lg:p-8 text-center space-y-6">
                    <p className="text-sm lg:text-base text-slate-900 dark:text-white font-black uppercase tracking-tight leading-tight">
                       Готовы начать сотрудничество?
                    </p>
                    <Link href="/contacts" className="w-full h-12 px-6 bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-none group">
                       <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                       Отправить запрос
                    </Link>
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                       <span className="block text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">С уважением,</span>
                       <span className="block text-sm font-black uppercase tracking-tighter dark:text-white">Команда MAFF.</span>
                    </div>
                 </div>
              </ScrollReveal>
           </div>
        </div>

        {/* ── Masters Section (If exists) ── */}
        {slug === "masters" && currentData.experts && currentData.experts.length > 0 && (
           <ScrollReveal delay={400}>
              <div className="mt-12">
                 <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-sm lg:text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Сертифицированные мастера</h2>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                 </div>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {currentData.experts.map((expert: any, i: number) => (
                       <div key={i} className="group bg-slate-50 dark:bg-[#161d2f] border border-slate-100 dark:border-white/5 rounded-2xl p-4 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-300">
                          <div className="relative mb-3 flex justify-center">
                             <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center">
                                {expert.photo ? (
                                   <img src={expert.photo} alt={expert.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                   <User className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                )}
                             </div>
                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-800 flex items-center gap-0.5">
                                <Star className="w-2 h-2 text-[#2c3b6e] dark:text-blue-500 fill-[#2c3b6e] dark:fill-blue-500" />
                                <span className="text-[8px] font-black dark:text-white">{expert.rating || "5.0"}</span>
                             </div>
                          </div>
                          <div className="text-center space-y-1">
                             <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{expert.name}</h4>
                             <p className="text-[7px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest line-clamp-1">{expert.specialty}</p>
                             <button className="w-full mt-2 h-7 rounded-full border border-slate-200 dark:border-slate-800 text-[7px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-[#1a1a1a] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                                Контакт
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </ScrollReveal>
        )}
      </section>
    </div>
  );
}
