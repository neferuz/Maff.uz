"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  Layers, 
  LayoutGrid, 
  Square, 
  DoorOpen, 
  Maximize, 
  Layout, 
  Box, 
  Shapes, 
  Hammer, 
  Wind, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Truck,
  Zap,
  Gem,
  Heart,
  Smile,
  Wrench,
  Globe,
  MapPin,
  CreditCard,
  Headset,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/ui/product-card";

const iconMap: Record<string, any> = {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Truck,
  Zap,
  Gem,
  Heart,
  Smile,
  Wrench,
  Globe,
  MapPin,
  CreditCard,
  Headset,
  Star
};

// Fallback data in case API fails
const fallbackData = {
  hero: {
    title: "Идеальные полы для вашего дома",
    highlightWord: "Идеальные",
    subtitle: "Широкий выбор ламината, паркета и дверей премиального качества с доставкой по всему Узбекистану.",
    primaryButton: { text: "Каталог", link: "/catalog" },
    secondaryButton: { text: "О нас", link: "/about" },
    features: [
      { icon: "ShieldCheck", text: "Гарантия качества" },
      { icon: "Truck", text: "Быстрая доставка" }
    ],
    images: ["/kam-idris-U39FPHKfDu0-unsplash.jpg"]
  },
  about: {
    title: "MAFF — ваш эксперт в мире напольных покрытий",
    description: "Мы предлагаем только проверенные бренды и эксклюзивные коллекции, которые преобразят ваш интерьер.",
    stats: [
      { label: "Лет опыта", value: "12+" },
      { label: "Клиентов", value: "5000+" },
      { label: "Товаров", value: "1000+" }
    ]
  },
  brands: ["Kronopol", "Quick-Step", "Tarkett", "Classen", "BerryAlloc"]
};

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/pages/home", { cache: "no-store", mode: "cors" });
        if (res.ok) {
          const data = await res.json();
          setPageData(data.content);
        } else {
          setPageData(fallbackData);
        }
      } catch (err) {
        console.error("Failed to fetch home page content:", err);
        setPageData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!pageData?.hero?.images || pageData.hero.images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % pageData.hero.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [pageData]);

  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch("/api/v1/products?limit=8", { cache: "no-store", mode: "cors" });
        if (res.ok) {
          const allProducts = await res.json();
          if (allProducts.length > 0) {
            const today = new Date().toDateString();
            const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const shuffled = [...allProducts].sort((a, b) => {
              const valA = (a.id * seed) % 100;
              const valB = (b.id * seed) % 100;
              return valA - valB;
            });
            setRecommendedProducts(shuffled.slice(0, 8));
          }
        }
      } catch (err) {
        console.error("Failed to fetch recommended products:", err);
      }
    }
    fetchRecommended();
  }, []);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/v1/categories", { cache: "no-store", mode: "cors" });
        if (res.ok) {
          const allCats = await res.json();
          const mainCats = allCats.filter((c: any) => !c.parent_id).slice(0, 10);
          setCategories(mainCats);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  if (isLoading && !pageData) {
    return (
      <div className="min-h-[60vh] bg-white dark:bg-[#0f172a] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#2c3b6e] animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Загрузка Maff.uz</span>
         </div>
      </div>
    );
  }

  // Use fallback if data is still missing after loading
  const activeData = pageData || fallbackData;
  const hero = activeData.hero || fallbackData.hero;
  const about = activeData.about || fallbackData.about;
  const brands = activeData.brands || fallbackData.brands;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % (hero.images?.length || 1));
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + (hero.images?.length || 1)) % (hero.images?.length || 1));

  const categoryIcons = [Layers, LayoutGrid, Square, DoorOpen, Layout, Box, Shapes, Hammer, Wind, Sparkles];
  const categoryColors = ["bg-blue-50", "bg-slate-50", "bg-slate-50", "bg-blue-50", "bg-slate-50", "bg-blue-50", "bg-emerald-50", "bg-rose-50", "bg-indigo-50", "bg-violet-50"];

  return (
    <div className="flex flex-col items-center w-full transition-colors duration-300">
      <section className="relative w-full py-6 lg:py-10 flex justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none" />
        <div className="max-w-7xl w-full px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start animate-fade-in-up">
               <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-[#2c3b6e] dark:text-blue-400 text-[7px] lg:text-[8px] font-black tracking-[0.15em] rounded-full uppercase mb-4 border border-blue-100/50 dark:border-blue-800/50">
                  <div className="w-1 h-1 rounded-full bg-[#2c3b6e] dark:bg-blue-400" />
                  Maff.uz — Лучшие решения
               </div>

               <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4 lg:mb-5">
                  {hero.title && hero.title.includes(hero.highlightWord) ? (
                    <>
                      {hero.title.split(hero.highlightWord)[0]}
                      <span className="text-[#2c3b6e] dark:text-blue-500">
                        {hero.highlightWord}
                      </span>
                      {hero.title.split(hero.highlightWord)[1]}
                    </>
                  ) : (
                    hero.title
                  )}
               </h1>

               <p className="text-[11px] lg:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mb-6 lg:mb-8 opacity-90">
                  {hero.subtitle}
               </p>

               <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
                  <Link href={hero.primaryButton?.link || "/catalog"} className="bg-[#2c3b6e] hover:bg-[#1a1a1a] text-white px-4 lg:px-7 py-3 lg:py-4 rounded-full font-black text-[9px] lg:text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95">
                     {hero.primaryButton?.text}
                     <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                  </Link>
                  <Link href={hero.secondaryButton?.link || "/about"} className="bg-white dark:bg-slate-800 px-4 lg:px-7 py-3 lg:py-4 rounded-full font-black text-[9px] lg:text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:text-[#2c3b6e] dark:hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                     {hero.secondaryButton?.text}
                  </Link>
               </div>

               <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 w-full max-w-sm mx-auto lg:mx-0">
                  {hero.features?.map((f: any, i: number) => {
                    const Icon = iconMap[f.icon] || CheckCircle2;
                    return (
                      <div key={i} className="flex items-center gap-2 text-[10px] lg:text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <Icon className="w-3.5 h-3.5 text-[#2c3b6e] dark:text-blue-500" strokeWidth={3} />
                        {f.text}
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="lg:col-span-7 xl:col-span-7 relative">
               <div className="relative w-full aspect-[16/9] lg:aspect-[16/10] xl:aspect-[16/9] rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden group">
                  <div className="flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                    {hero.images?.map((src: string, idx: number) => (
                      <div key={src} className="w-full h-full flex-shrink-0 relative overflow-hidden">
                        <Image src={src} alt="Banner" fill priority={idx === 0} className="object-cover transition-transform duration-[8000ms] ease-out scale-110 group-hover:scale-100" />
                        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/20" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-between pointer-events-none">
                     <div className="flex justify-between items-start">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 dark:border-slate-700 flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                           <span className="text-[8px] lg:text-[9px] font-black uppercase text-slate-900 dark:text-white tracking-tighter">Premium Collection</span>
                        </div>
                        <div className="flex gap-1.5 pointer-events-auto">
                           <button onClick={prevImage} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white hover:bg-[#2c3b6e] dark:hover:bg-blue-600 hover:text-white transition-all active:scale-90"><ChevronLeft className="w-4 h-4 lg:w-5 h-5" /></button>
                           <button onClick={nextImage} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-900 dark:text-white hover:bg-[#2c3b6e] dark:hover:bg-blue-600 hover:text-white transition-all active:scale-90"><ChevronRight className="w-4 h-4 lg:w-5 h-5" /></button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-6 mb-6">
          <div className="flex items-center justify-between mb-6 border-l-4 border-[#2c3b6e] dark:border-blue-600 pl-4 lg:pl-6 py-1">
            <h2 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Категории</h2>
            <Link href="/catalog" className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors uppercase tracking-widest">
              Смотреть всё
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4">
            {categories.length > 0 ? (
              categories.map((cat, idx) => {
                const Icon = categoryIcons[idx % categoryIcons.length];
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <Link 
                    key={cat.id} 
                    href={`/catalog?category=${cat.id}`}
                    className="group flex items-center gap-3 p-4 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#161d2f] hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-none"
                  >
                    <div className={cn(color, "dark:bg-slate-800/50 w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform")}>
                        <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    <span className="text-[10px] lg:text-[11px] font-bold text-slate-900 dark:text-slate-300">{cat.name}</span>
                  </Link>
                );
              })
            ) : (
              [1, 2, 3, 4, 5].map(id => (
                <div key={id} className="h-16 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl" />
              ))
            )}
          </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-6 lg:py-10 mb-6">
          <div className="flex items-center justify-between mb-8 border-l-4 border-[#2c3b6e] dark:border-blue-600 pl-4 lg:pl-6 py-1">
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Рекомендуем</h2>
              <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em] opacity-70">Лучший выбор наших экспертов</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
             {recommendedProducts.length > 0 ? (
               recommendedProducts.map((p) => (
                 <ProductCard 
                   key={p.id}
                   id={p.id} 
                   title={p.name} 
                   country="Беларусь" 
                   brand={p.brand || "Maff"} 
                   grade="Премиум" 
                   thickness={p.thickness || "12"} 
                   price={p.price || 0} 
                   inStock={p.stock > 0} 
                   image={p.image_url || "/kam-idris-U39FPHKfDu0-unsplash.jpg"} 
                 />
               ))
             ) : (
               [1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
                <ProductCard 
                  key={id}
                  id={id} 
                  title={`Товар #${id}`} 
                  country="Беларусь" 
                  brand="Maff" 
                  grade="Премиум" 
                  thickness="12" 
                  price="1 404 000" 
                  inStock={true} 
                  image={id % 2 === 0 ? "/kam-idris-U39FPHKfDu0-unsplash.jpg" : "/spacejoy-9M66C_w_ToM-unsplash.jpg"} 
                />
               ))
             )}
          </div>
      </section>

      <section className="w-full py-10 lg:py-16 bg-slate-50/50 dark:bg-[oklch(0.27_0.06_267.62)] border-y border-slate-100 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
             <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white dark:bg-slate-700 text-[#2c3b6e] dark:text-blue-400 text-[8px] font-black tracking-widest rounded-full uppercase mb-4 border border-slate-100 dark:border-slate-600">
                   О компании
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4 uppercase tracking-tight">
                   {about.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] lg:text-sm font-semibold opacity-80 max-w-4xl leading-relaxed">
                   {about.description}
                </p>
             </div>

             <div className="lg:col-span-4 grid grid-cols-3 gap-4 border-l lg:border-l border-slate-200 dark:border-slate-700 lg:pl-12">
                {about.stats?.map((stat: any, idx: number) => (
                   <div key={idx} className="flex flex-col">
                      <span className="text-xl lg:text-2xl font-black text-[#2c3b6e] dark:text-blue-500">{stat.value}</span>
                      <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 lg:py-16 bg-white dark:bg-[oklch(0.27_0.06_267.62)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 mb-10 flex flex-col items-center">
           <h2 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Наши бренды</h2>
           <div className="w-10 h-0.5 bg-[#2c3b6e] dark:bg-blue-600 rounded-full" />
        </div>
        
        <div className="relative w-full overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-[oklch(0.27_0.06_267.62)] to-transparent z-10" />
           <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-[oklch(0.27_0.06_267.62)] to-transparent z-10" />
           <div className="flex w-fit animate-marquee pause-hover gap-16 lg:gap-24 items-center py-2">
              {[...brands, ...brands].map((brand, idx) => {
                 if (!brand) return null;
                 const name = typeof brand === 'string' ? brand : brand.name;
                 const link = typeof brand === 'string' ? `/catalog?brand=${brand}` : brand.link;
                 if (!name) return null;

                 return link ? (
                    <Link key={idx} href={link} className="text-xl lg:text-3xl font-black tracking-tighter text-slate-900/10 dark:text-white/5 hover:text-[#2c3b6e]/40 dark:hover:text-blue-400/30 transition-colors cursor-pointer whitespace-nowrap uppercase">
                       {name}
                    </Link>
                 ) : (
                    <span key={idx} className="text-xl lg:text-3xl font-black tracking-tighter text-slate-900/10 dark:text-white/5 hover:text-[#2c3b6e]/40 dark:hover:text-blue-400/30 transition-colors cursor-default whitespace-nowrap uppercase">
                       {name}
                    </span>
                 );
              })}
           </div>
        </div>

        <style jsx>{`
           @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
           }
           .animate-marquee {
              animation: marquee 30s linear infinite;
           }
           .pause-hover:hover {
              animation-play-state: paused;
           }
        `}</style>
      </section>
    </div>
  );
}

import { Loader2 } from "lucide-react";
