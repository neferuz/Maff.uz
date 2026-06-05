"use client";

import Link from "next/link";
import { cn, cleanNameFromDimensions } from "@/lib/utils";
import { Heart, BarChart2, ShoppingBag, Image as ImageIcon, Zap } from "lucide-react";
import { useShop } from "@/context/shop-context";
import { getProductUnit } from "@/lib/units";

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
  images?: string[];
  isDoor?: boolean;
  isOrderOnly?: boolean;
  isPreorder?: boolean;
  orderLink?: string;
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
  images,
  isDoor: isDoorProp,
  isOrderOnly,
  isPreorder,
  orderLink,
}: ProductCardProps) {
  const { 
    isInFavorites, addToFavorites, removeFromFavorites, 
    addToCart, 
    isInCompare, addToCompare, removeFromCompare 
  } = useShop();
  
  const isFavorite = isInFavorites(id);
  const isCompared = isInCompare(id);

  let parsedImages = images;
  if (typeof images === 'string') {
    try {
      parsedImages = JSON.parse(images);
    } catch {
      parsedImages = [];
    }
  }

  // Check if we should show the second image (for AGT wall decors/panels, where the first image is a duplicate room scene)
  const isAgtWallPanel = brand && brand.toLowerCase() === 'agt' && (
    /\blb\b/i.test(title) || 
    title.toLowerCase().includes('декор') ||
    title.toLowerCase().includes('панел') ||
    title.toLowerCase().includes('акустическ')
  );

  const mainImage = (isAgtWallPanel && Array.isArray(parsedImages) && parsedImages.length > 1) ? parsedImages[1] : image;

  // Normalize image URL path to prevent protocol-relative (//) URL interpretation by browsers
  const cleanImage = mainImage ? (mainImage.startsWith('http') ? mainImage : `/${mainImage.replace(/^\/+/, "")}`) : "";

  const isDoorBrands = ['portika', 'zadoor', 'profildoors', 'волховец', 'volkhovets', 'filomuro'];
  const isDoorKeywords = ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'];
  const isDoor = isDoorProp ?? (
    isDoorKeywords.some(k => title.toLowerCase().includes(k)) ||
    isDoorBrands.some(b => brand.toLowerCase().includes(b))
  );

  const unit = isDoor ? "шт" : getProductUnit(title, brand);

  const getProductSize = (name: string) => {
    const m = name.match(/(?:\b|^)(\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?)/i);
    if (!m) return "";
    return m[1].replace(/\s+/g, "").replace(/[х\*×]/g, "x");
  };

  // Dynamic specifications builder
  const specs = [];
  if (brand && brand.trim() !== "" && brand.trim() !== "MAFF" && !/^[0-9a-f-]{36}$/.test(brand)) {
    specs.push({ label: "Бренд", value: brand });
  }

  const size = getProductSize(title);
  if (size) {
    specs.push({ label: "Размер", value: `${size} мм` });
  }

  if (country && country.trim() !== "" && country.trim() !== "Европа") {
    specs.push({ label: "Страна", value: country });
  }
  if (!isDoor) {
    if (grade && grade.trim() !== "" && grade.trim() !== "Premium" && grade.trim() !== "Premium класс") {
      specs.push({ label: "Класс", value: grade });
    }
    if (thickness && thickness.trim() !== "" && thickness.trim() !== "8мм") {
      specs.push({ label: "Толщина", value: thickness });
    }
  }

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
      addToFavorites({ id, name: title, price: getNumericPrice(price), image: cleanImage, variant: brand });
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(id);
    } else {
      addToCompare({ id, title, price: String(price), image: cleanImage, brand, country, grade, thickness, name: title });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inStock) {
      addToCart({ id, name: title, price: getNumericPrice(price), image: cleanImage, variant: brand });
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(orderLink || "https://t.me/maff_uz", "_blank");
  };

  return (
    <Link 
      href={`/product/${id}`}
      className="group bg-[#2c3b6e]/[0.03] dark:bg-slate-900/40 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-slate-200/60 dark:border-white/5 p-2 lg:p-2.5 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:bg-[#2c3b6e]/[0.06] dark:hover:bg-slate-800/60 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Image Area */}
      <div className="relative aspect-square rounded-lg lg:rounded-xl overflow-hidden bg-white dark:bg-slate-900 mb-2.5 lg:mb-3 transition-colors duration-500">
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 flex flex-col items-start gap-1.5 z-10">
          {isPreorder && (
            <div className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[#2c3b6e] dark:text-blue-400 rounded-md border border-slate-100 dark:border-slate-800 text-[8px] lg:text-[9px] font-black uppercase tracking-widest">
               Под заказ
            </div>
          )}
          <div className="px-2 py-1 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 backdrop-blur-md rounded-md border border-slate-200/80 dark:border-slate-800/80 text-[8px] lg:text-[10px] font-black tracking-wider">
             {Math.round(priceOutlet || getNumericPrice(price)).toLocaleString('ru-RU')} сум
          </div>
        </div>
        {cleanImage ? (
          <img
            src={cleanImage}
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
      <div className="px-1 flex flex-col flex-grow">
        <h3 
          className="text-[11px] lg:text-sm font-black text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2 min-h-[32px] lg:min-h-[40px]" 
          title={title}
        >
          {cleanNameFromDimensions(title)}
        </h3>
        
        {specs.length > 0 && (
          <div className="space-y-1 mb-3">
            {specs.slice(0, 3).map((spec, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] lg:text-[10px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium tracking-tight">{spec.label}:</span>
                <span className="text-slate-900 dark:text-slate-300 font-black truncate max-w-[125px]" title={spec.value}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-1.5 lg:space-y-2">
          {(isOrderOnly || isPreorder) ? (
            <div 
              onClick={handleOrderClick}
              className={cn(
                "w-full py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-center transition-all cursor-pointer flex items-center justify-center gap-2",
                "bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 hover:bg-[#2c3b6e] dark:hover:bg-blue-50"
              )}
            >
               <Zap className="w-3 h-3 text-current" />
               {isPreorder ? "Под заказ" : "Заказать"}
            </div>
          ) : (
            <div 
              onClick={handleAddToCart}
              className={cn(
                "w-full py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-center transition-all cursor-pointer flex items-center justify-center gap-2",
                inStock 
                  ? "bg-white dark:bg-slate-700 text-[#2c3b6e] dark:text-white border border-[#2c3b6e]/20 hover:bg-[#2c3b6e] dark:hover:bg-blue-600 hover:text-white" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-white/60 cursor-not-allowed"
              )}
            >
              {inStock ? (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  В корзину
                </>
              ) : "Нет в наличии"}
            </div>
          )}

          <div className="w-full py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-white/5 transition-all flex flex-col items-center justify-center">
            {priceOutlet ? (
              <div className="flex flex-col items-center justify-center">
                <div className="flex flex-wrap items-center gap-1.5 justify-center leading-none">
                  <span className="text-xs lg:text-[14px] font-black text-[#e11d48] dark:text-rose-400 leading-none">{getDisplayPrice(priceOutlet)} сум</span>
                  <span className="text-[9px] lg:text-[11px] font-bold text-slate-400 line-through leading-none">{getDisplayPrice(price)} сум</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs lg:text-[14px] font-black text-slate-900 dark:text-white leading-none text-center">
                  {getNumericPrice(price) > 0 ? `${getDisplayPrice(price)} сум` : "Цена по запросу"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
