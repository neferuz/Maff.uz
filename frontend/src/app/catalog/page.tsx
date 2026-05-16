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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
  Layers, LayoutGrid, Square, DoorOpen, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

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
                  {categoryId ? "Подкатегории" : "Полный ассортимент"}
                </div>
              </div>
              
              <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-tight">
                 {currentCategory ? (
                   <>
                     {currentCategory.name} <span className="text-[#2c3b6e] dark:text-blue-500">MAFF</span>
                   </>
                 ) : (
                   <>
                     Каталог <span className="text-[#2c3b6e] dark:text-blue-500">продукции</span>
                   </>
                 )}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-[11px] font-semibold leading-relaxed max-w-xl opacity-80 uppercase tracking-widest">
                 {currentCategory 
                   ? `Выбор подкатегорий для ${currentCategory.name}` 
                   : "Более 2000 наименований напольных покрытий, дверей и аксессуаров."
                 }
              </p>
           </div>
        </div>
      </section>

      {/* ── Main Grid ── */}
      <section className="max-w-7xl mx-auto px-2 lg:px-6 py-4 lg:py-10">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {displayCategories.map((cat, idx) => {
              const Icon = categoryIcons[idx % categoryIcons.length];
              const color = categoryColors[idx % categoryColors.length];
              const hasSubs = allCategories.some(c => c.parent_id === cat.id);
              
              return (
                <Link 
                  key={cat.id}
                  href={hasSubs ? `/catalog?category=${cat.id}` : `/outlet?category=${cat.id}`}
                  className="group relative flex flex-col p-4 lg:p-6 rounded-xl lg:rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-500 h-full shadow-none"
                >
                   <div className={cn(color, "dark:bg-slate-700 w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-500")}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors" />
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
              <div className="col-span-full py-16 lg:py-24 text-center">
                 <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                    <Box className="w-7 h-7 lg:w-8 lg:h-8" />
                 </div>
                 <p className="text-[11px] lg:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">В этой категории пока нет товаров</p>
                 <Link href="/catalog" className="mt-4 lg:mt-6 inline-flex items-center gap-2 text-[#2c3b6e] dark:text-blue-400 font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:gap-3 transition-all">
                    <ArrowLeft className="w-3 h-3" /> Вернуться назад
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
