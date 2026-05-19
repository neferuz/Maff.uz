"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Heart, BarChart2, ShoppingBag, Image as ImageIcon, Zap } from "lucide-react";
import { useShop } from "@/context/shop-context";

interface ProductCardProps {
  id: number;
  title: string;
  country: string;
  brand: string;
  grade: string;
  thickness: string;
  price: string | number;
  priceOutlet?: number;
  inStock: boolean;
  image: string;
  isDoor?: boolean;
  isOrderOnly?: boolean;
  isPreorder?: boolean;
}

export function ProductCard({
  id,
  title,
  country,
  brand,
  grade,
  thickness,
  price,
  priceOutlet,
  inStock,
  image,
  isDoor: isDoorProp,
  isOrderOnly,
  isPreorder,
}: ProductCardProps) {
  const { 
    isInFavorites, addToFavorites, removeFromFavorites, 
    addToCart, 
    isInCompare, addToCompare, removeFromCompare 
  } = useShop();
  
  const isFavorite = isInFavorites(id);
  const isCompared = isInCompare(id);

  const isDoorBrands = ['portika', 'zadoor', 'profildoors', 'волховец', 'volkhovets', 'filomuro'];
  const isDoorKeywords = ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'];
  const isDoor = isDoorProp ?? (
    isDoorKeywords.some(k => title.toLowerCase().includes(k)) ||
    isDoorBrands.some(b => brand.toLowerCase().includes(b))
  );

  const getNumericPrice = (p: string | number) => {
    if (typeof p === 'number') return p;
    return parseInt(p.replace(/\s/g, "")) || 0;
  };

  const getDisplayPrice = (p: string | number) => {
    if (typeof p === 'number') return p.toLocaleString('ru-RU');
    return p;
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites({ id, name: title, price: getNumericPrice(price), image, variant: brand });
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(id);
    } else {
      addToCompare({ id, title, price: String(price), image, brand, country, grade, thickness, name: title });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      addToCart({ id, name: title, price: getNumericPrice(price), image, variant: brand });
    }
  };

  return (
    <Link 
      href={`/product/${id}`}
      className="group bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 hover:border-[#2c3b6e] dark:hover:border-blue-500 transition-all duration-500 flex flex-col h-full relative overflow-hidden shadow-none"
    >
      {/* Image Area */}
      <div className="relative aspect-square rounded-xl lg:rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50 mb-3 lg:mb-4 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors duration-500">
        {isPreorder && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-[#2c3b6e] text-white rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest z-10 shadow-md">
             Под заказ
          </div>
        )}
        {isOrderOnly && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest z-10 shadow-md">
             Заказать
          </div>
        )}
        {image ? (
          <img
            src={image}
            alt={title}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
              const placeholder = document.createElement('div');
              placeholder.className = 'flex flex-col items-center justify-center gap-2 opacity-20';
              placeholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span class="text-[8px] font-black uppercase tracking-widest">Нет фото</span>
              `;
              (e.target as HTMLImageElement).parentElement?.appendChild(placeholder);
            }}
            className={cn(
              "w-full h-full transition-transform duration-700 group-hover:scale-105",
              isDoor ? "object-contain p-2 lg:p-4" : "object-cover"
            )}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 transition-all duration-500 group-hover:opacity-40">
            <ImageIcon className="w-6 h-6 lg:w-8 lg:h-8 dark:text-white" />
            <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest dark:text-white">Нет фото</span>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 lg:opacity-0 lg:translate-x-4 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 transition-all duration-300 z-10">
          <div 
            onClick={toggleFavorite}
            className={cn(
              "w-7 h-7 lg:w-8 lg:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer",
              isFavorite ? "bg-red-500 text-white" : "bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-blue-400"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", isFavorite && "fill-current")} />
          </div>

          <div 
            onClick={toggleCompare}
            className={cn(
              "w-7 h-7 lg:w-8 lg:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer",
              isCompared ? "bg-[#2c3b6e] dark:bg-blue-600 text-white" : "bg-white/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-blue-400"
            )}
            title="Сравнить"
          >
            <BarChart2 className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4")} />
          </div>
        </div>

      </div>

      {/* Content Area */}
      <div className="px-1 lg:px-2 pb-1 lg:pb-2 flex flex-col flex-grow">
        <h3 className="text-[11px] lg:text-sm font-black text-slate-900 dark:text-white mb-2 lg:mb-4 leading-tight truncate">{title}</h3>
        
        <div className="space-y-1 lg:space-y-1.5 mb-3 lg:mb-6">
          <div className="flex items-center justify-between text-[8px] lg:text-[10px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium tracking-tight">Страна:</span>
            <span className="text-slate-900 dark:text-slate-300 font-black">{country}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] lg:text-[10px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium tracking-tight">Бренд:</span>
            <span className="text-slate-900 dark:text-slate-300 font-black">{brand}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] lg:text-[10px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium tracking-tight">Класс:</span>
            <span className="text-slate-900 dark:text-slate-300 font-black">{grade}</span>
          </div>
        </div>

        <div className="mt-auto space-y-1.5 lg:space-y-2">
          {isOrderOnly ? (
            <div 
              className={cn(
                "w-full py-2 lg:py-2.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-center transition-all cursor-pointer flex items-center justify-center gap-2",
                "bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 hover:bg-[#2c3b6e] dark:hover:bg-blue-50"
              )}
            >
               <Zap className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-[#2c3b6e] dark:text-blue-400" />
               Заказать
            </div>
          ) : (
            <div 
              onClick={handleAddToCart}
              className={cn(
                "w-full py-2 lg:py-2.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-center transition-all cursor-pointer flex items-center justify-center gap-2",
                inStock 
                  ? "bg-[#f1f5f9] dark:bg-slate-800 text-[#2c3b6e] dark:text-white hover:bg-[#2c3b6e] dark:hover:bg-blue-600 hover:text-white" 
                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-white/60 cursor-not-allowed"
              )}
            >
              {inStock ? (
                <>
                  <ShoppingBag className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
                  В корзину
                </>
              ) : "Нет в наличии"}
            </div>
          )}

          <div className="w-full py-2 lg:py-3.5 rounded-full bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 group-hover:border-[#2c3b6e] dark:group-hover:border-blue-500 transition-all flex flex-col items-center justify-center">
            {priceOutlet ? (
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 justify-center leading-none mb-0.5">
                  <span className="text-[11px] lg:text-[13px] font-black text-[#e11d48] dark:text-rose-400 leading-none">{getDisplayPrice(priceOutlet)} сум</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 line-through leading-none">{getDisplayPrice(price)} сум</span>
                </div>
                <span className="text-[7px] lg:text-[9px] font-bold text-slate-400 dark:text-slate-500">стоимость за м.кв.</span>
                <span className="text-[7px] lg:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">от {Math.round(priceOutlet / 12).toLocaleString('ru-RU')} сум/мес</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-[11px] lg:text-[13px] font-black text-slate-900 dark:text-white leading-none mb-0.5">{getDisplayPrice(price)} сум</span>
                <span className="text-[7px] lg:text-[9px] font-bold text-slate-400 dark:text-slate-500">стоимость за м.кв.</span>
                <span className="text-[7px] lg:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">от {Math.round(getNumericPrice(price) / 12).toLocaleString('ru-RU')} сум/мес</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
