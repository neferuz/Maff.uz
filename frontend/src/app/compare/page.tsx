"use client";

import React from "react";
import { 
  ChevronRight, 
  X, 
  BarChart2, 
  ArrowRight,
  ShoppingBag,
  Info,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useShop } from "@/context/shop-context";
import { cn, cleanNameFromDimensions } from "@/lib/utils";

export default function ComparePage() {
  const { compare, removeFromCompare, addToCart } = useShop();

  const features = [
    { label: "Бренд", key: "brand" },
    { label: "Страна", key: "country" },
    { label: "Класс износостойкости", key: "grade" },
    { label: "Толщина", key: "thickness" },
  ];

  const formatPrice = (p: any) => {
    if (!p) return "0";
    const num = typeof p === 'string' ? (parseInt(p.replace(/\s/g, "")) || 0) : p;
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const parsePrice = (p: any) => {
    if (!p) return 0;
    if (typeof p === 'number') return p;
    return parseInt(p.replace(/\s/g, "")) || 0;
  };

  if (compare.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700">
          <BarChart2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Список сравнения пуст</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-8 max-w-xs">
          Добавьте товары в список сравнения, чтобы сопоставить их характеристики и выбрать лучший вариант.
        </p>
        <Link 
          href="/catalog" 
          className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#2c3b6e] transition-all flex items-center gap-2 shadow-lg shadow-black/5"
        >
          Перейти в каталог
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-20 transition-colors duration-300">
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-[#2c3b6e] dark:hover:text-blue-400">MAFF</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-slate-900 dark:text-slate-300">Сравнение</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 lg:px-6 py-6 lg:py-8">
        {/* Minimal Header */}
        <div className="max-w-7xl mx-auto mb-8 lg:mb-10">
           <div className="inline-flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-[#2c3b6e] dark:text-blue-500" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-blue-500">Анализ</span>
           </div>
           <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
             Сравнение товаров
           </h1>
        </div>

        {/* Dynamic Card Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {compare.map((product) => (
            <div 
              key={product.id} 
              className="group bg-[#f8f9fa] dark:bg-slate-800/40 rounded-2xl lg:rounded-[1.5rem] border border-slate-100/50 dark:border-slate-800 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-500 flex flex-col overflow-hidden shadow-none"
            >
              {/* Product Header */}
              <div className="relative p-4 lg:p-5">
                <button 
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-4 right-4 w-7 h-7 lg:w-8 lg:h-8 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded-full flex items-center justify-center transition-all z-10 border border-slate-100 dark:border-slate-800"
                >
                  <X className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                </button>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white dark:bg-white/95 mb-4 border border-slate-50 dark:border-slate-800 relative">
                  <img src={product.image || "/placeholder.png"} alt={product.title} className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 h-8 line-clamp-2 leading-tight">{cleanNameFromDimensions(product.title)}</h3>
                <div className="text-base lg:text-lg font-black text-[#2c3b6e] dark:text-blue-400 mb-1">{formatPrice(product.price)} <span className="text-[9px] text-slate-300 dark:text-slate-600 uppercase tracking-widest font-bold">сум</span></div>
                <p className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-4">за м.кв.</p>
              </div>

              {/* Technical Specs List */}
              <div className="px-4 lg:px-5 py-4 lg:py-5 bg-white dark:bg-slate-800 flex-grow space-y-4 border-t border-slate-50 dark:border-slate-700">
                {features.map((feature) => (
                  <div key={feature.key} className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{feature.label}</span>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{product[feature.key] || "—"}</span>
                  </div>
                ))}
              </div>

              {/* Action Area */}
              <div className="p-4 lg:p-5 border-t border-slate-50 dark:border-slate-700">
                <button 
                  onClick={() => addToCart({ id: product.id, name: product.title, price: parsePrice(product.price), image: product.image, variant: product.brand })}
                  className="w-full h-10 lg:h-11 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  В корзину
                </button>
              </div>
            </div>
          ))}
          
          {compare.length < 4 && (
            <Link 
              href="/catalog"
              className="min-h-[300px] lg:min-h-[400px] rounded-2xl lg:rounded-[1.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-3 hover:border-[#2c3b6e]/30 dark:hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-900/5 transition-all group"
            >
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors border border-slate-100 dark:border-slate-800">
                 <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400">Добавить</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
