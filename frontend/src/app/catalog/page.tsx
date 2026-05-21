"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
  Layers, 
  LayoutGrid, 
  Square, 
  Home as HomeIcon, 
  DoorOpen, 
  Maximize, 
  Layout, 
  Box, 
  Shapes, 
  Hammer, 
  Wind, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
  ArrowLeft,
  // Additional icons for 34 category list
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Layers, LayoutGrid, Square, DoorOpen, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award
};

const lucideMap: Record<string, any> = {
  Home: HomeIcon, DoorOpen, Layers, LayoutGrid, Square, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award,
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Pallet: Boxes, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [displayCategories, setDisplayCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/categories/");
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data);
          
          if (categoryId) {
            const current = data.find((c: any) => c.id === parseInt(categoryId));
            setCurrentCategory(current);
            const subs = data.filter((c: any) => c.parent_id === parseInt(categoryId));
            setDisplayCategories(subs);
          } else {
            setCurrentCategory(null);
            const mains = data.filter((c: any) => !c.parent_id);
            setDisplayCategories(mains);
          }
        }
      } catch (err) {
        console.error("Failed to fetch catalog data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId]);



  const categoryIcons = [Layers, LayoutGrid, Square, DoorOpen, Layout, Box, Shapes, Hammer, Wind, Sparkles];
  const categoryColors = ["bg-blue-50", "bg-slate-50", "bg-slate-50", "bg-blue-50", "bg-slate-50", "bg-blue-50", "bg-emerald-50", "bg-rose-50", "bg-indigo-50", "bg-violet-50"];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* ── Header Section ── */}
      <section className="w-full bg-slate-50/50 dark:bg-slate-950 pt-4 lg:pt-8 pb-6 lg:pb-10 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
           <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-4 lg:mb-5">
                {categoryId && (
                  <Link 
                    href="/catalog"
                    className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-[#2c3b6e] dark:hover:text-blue-400 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all shadow-none"
                    title="Назад в каталог"
                  >
                    <ArrowLeft className="w-4 h-4 lg:w-5 h-5" />
                  </Link>
                )}
                <div className="inline-flex items-center gap-2 px-2 lg:px-2.5 py-0.5 bg-blue-100/50 dark:bg-blue-900/30 text-[#2c3b6e] dark:text-blue-400 text-[7px] lg:text-[8px] font-black tracking-widest rounded-full uppercase border border-blue-200/50 dark:border-blue-800/50">
                  <Sparkles className="w-2.5 h-2.5" />
                  {loading ? (
                    <span className="inline-block w-16 h-2 bg-slate-200/60 dark:bg-slate-700/60 animate-pulse rounded" />
                  ) : categoryId ? (
                    "Подкатегории"
                  ) : (
                    "Полный ассортимент"
                  )}
                </div>
              </div>
              
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-tight min-h-[28px] lg:min-h-[36px]">
                 {loading ? (
                   <span className="inline-block w-48 h-6 lg:h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
                 ) : currentCategory ? (
                   <>
                     {currentCategory.name}
                   </>
                 ) : (
                   <>
                     Каталог <span className="text-[#2c3b6e] dark:text-blue-500">продукции</span>
                   </>
                 )}
              </h1>
              <div className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-[11px] font-semibold leading-relaxed max-w-xl opacity-80 uppercase tracking-widest min-h-[14px]">
                 {loading ? (
                   <span className="inline-block w-64 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                 ) : currentCategory ? (
                   `Выбор подкатегорий для ${currentCategory.name}` 
                 ) : (
                   "Более 2000 наименований напольных покрытий, дверей и аксессуаров."
                 )}
              </div>
           </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="max-w-7xl mx-auto px-2 lg:px-6 py-4 lg:py-10">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex flex-col p-4 lg:p-6 rounded-xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 animate-pulse h-[180px] lg:h-[220px]">
                  {/* Icon box skeleton */}
                  <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-4 lg:mb-5" />
                  
                  {/* Text skeletons */}
                  <div className="space-y-2 flex-grow">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded w-1/2" />
                  </div>
                  
                  {/* Footer line skeleton */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/80">
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/80 rounded w-1/3" />
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-slate-100 dark:bg-slate-800/80" />
                  </div>
                </div>
              ))
            ) : displayCategories.map((cat, idx) => {
              const color = categoryColors[idx % categoryColors.length];
              const hasSubs = allCategories.some(c => c.parent_id === cat.id);
              
              // Determine icon or photo
              const renderIconContent = () => {
                const url = cat.image_url;
                if (url && (url.startsWith("http") || url.startsWith("/"))) {
                  return <img src={url} alt={cat.name} className="w-full h-full object-cover rounded-xl" />;
                }
                if (url && lucideMap[url]) {
                  const IconComp = lucideMap[url];
                  return <IconComp className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors" />;
                }
                // Fallback
                const IconComp = categoryIcons[idx % categoryIcons.length];
                return <IconComp className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors" />;
              };

              return (
                <Link 
                  key={cat.id}
                  href={hasSubs ? `/catalog?category=${cat.id}` : `/catalog/products?category=${cat.id}`}
                  className="group relative flex flex-col p-4 lg:p-6 rounded-xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-500 h-full shadow-none"
                >
                   <div className={cn(color, "dark:bg-slate-700 w-9 h-9 lg:w-11 lg:h-11 rounded-xl overflow-hidden flex items-center justify-center mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-500")}>
                      {renderIconContent()}
                   </div>
                   
                   <div className="flex-grow">
                      <h3 className="text-[10px] lg:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-[8px] lg:text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-tight mb-4 lg:mb-5 opacity-70 uppercase tracking-widest">
                        {hasSubs ? "Перейти к выбору" : "Смотреть товары"}
                      </p>
                   </div>

                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                         <span className="text-[9px] lg:text-[10px] font-black text-[#2c3b6e] dark:text-blue-500">MAFF</span>
                         <span className="text-[7px] lg:text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{hasSubs ? "Подкатегории" : "Каталог"}</span>
                      </div>
                      <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-[#2c3b6e] dark:group-hover:bg-blue-600 group-hover:text-white transition-all">
                         <ChevronRight className="w-3.5 h-3.5 lg:w-4 h-4" />
                      </div>
                   </div>
                </Link>
              );
            })}
            
            {displayCategories.length === 0 && !loading && (
              <div className="col-span-full py-12 lg:py-16 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 shadow-none">
                    <Box className="w-5 h-5 lg:w-6 lg:h-6 text-[#2c3b6e] dark:text-blue-400" />
                 </div>
                 <h4 className="text-[10px] lg:text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">
                    В этой категории пока нет товаров
                 </h4>
                 <p className="text-[8px] lg:text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-5 opacity-70 leading-none">
                    мы скоро добавим новые поступления
                 </p>
                 <Link 
                   href="/catalog" 
                   className="inline-flex items-center gap-2 px-5 py-2 h-9 rounded-full bg-[#2c3b6e] text-white hover:bg-[#2c3b6e]/90 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 shadow-none"
                 >
                    <ArrowLeft className="w-3.5 h-3.5 text-white" /> Вернуться назад
                 </Link>
              </div>
            )}
         </div>
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900" />}>
      <CatalogContent />
    </Suspense>
  );
}
