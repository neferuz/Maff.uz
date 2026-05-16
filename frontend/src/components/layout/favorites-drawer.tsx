"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop } from "@/context/shop-context";

export function FavoritesDrawer({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const { favorites, removeFromFavorites, addToCart } = useShop();
  const [addingId, setAddingId] = useState<number | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const formatPrice = (num: any) => {
    const val = Number(num || 0);
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleAddToCart = (item: any) => {
    setAddingId(item.id);
    addToCart(item);
    
    // Show success for 2 seconds
    setTimeout(() => {
      setAddingId(null);
    }, 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-[100001] h-full w-full lg:max-w-[340px] bg-white dark:bg-slate-900 transition-transform duration-500 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#2c3b6e] dark:text-blue-400 border border-slate-100 dark:border-slate-700">
                 <Heart className="w-4 h-4" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Избранное</h3>
                 <p className="text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest leading-none opacity-60">{favorites.length} товаров</p>
              </div>
           </div>
           <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
           >
              <X className="w-3 h-3" />
           </button>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-4">
           {favorites.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-200 dark:text-slate-700">
                   <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1.5">Пусто</h4>
                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-normal mb-6">Добавьте товары в список</p>
                <button onClick={onClose} className="px-5 py-2 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">В каталог</button>
             </div>
           ) : (
             favorites.map((item) => (
               <div key={item.id} className="relative group flex gap-3 pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div className="w-14 h-14 bg-[#f8f9fa] dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700 relative">
                      <Image src={item.image} alt={item.name || "Товар"} fill className="object-contain p-1.5" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                           <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{item.name}</h4>
                           <button onClick={() => removeFromFavorites(item.id)} className="text-slate-200 dark:text-slate-700 hover:text-red-500 transition-colors">
                              <Trash2 className="w-2.5 h-2.5" />
                           </button>
                        </div>
                        <p className="text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest mt-0.5">{item.variant}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] font-black text-[#2c3b6e] dark:text-blue-400">{formatPrice(item.price)} сум</p>
                        <button 
                          onClick={() => handleAddToCart(item)}
                          disabled={addingId === item.id}
                          className={cn(
                            "h-6 px-2.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                            addingId === item.id 
                              ? "bg-green-500 text-white" 
                              : "bg-[#2c3b6e] dark:bg-blue-600 text-white hover:bg-slate-900 dark:hover:bg-blue-700"
                          )}
                        >
                           {addingId === item.id ? (
                             <>
                               <Check className="w-2 h-2" />
                               Добавлено
                             </>
                           ) : (
                             <>
                               <ShoppingBag className="w-2 h-2" />
                               В корзину
                             </>
                           )}
                        </button>
                      </div>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="p-4 bg-[#f8f9fa] dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 rounded-t-[1.5rem]">
            <button 
               onClick={onClose}
               className="w-full h-11 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-blue-700 transition-all"
            >
               Продолжить покупки
               <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
