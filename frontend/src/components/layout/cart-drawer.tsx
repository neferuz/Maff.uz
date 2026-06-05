"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, AlertCircle } from "lucide-react";
import { cn, cleanNameFromDimensions } from "@/lib/utils";
import { useShop } from "@/context/shop-context";

export function CartDrawer({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const { cart, updateQuantity, removeFromCart } = useShop();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setDeletingId(null);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const formatPrice = (num: any) => {
    const val = Number(num || 0);
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price || 0);
    return acc + (price * item.quantity);
  }, 0);

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
                 <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Корзина</h3>
                 <p className="text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest leading-none opacity-60">{cart.length} поз.</p>
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
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-200 dark:text-slate-700">
                   <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1.5">Пусто</h4>
                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-normal mb-6">Добавьте что-нибудь</p>
                <button onClick={onClose} className="px-5 py-2 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">В каталог</button>
             </div>
           ) : (
             cart.map((item) => (
               <div key={item.id} className="relative group">
                  {/* Delete Confirmation */}
                  {deletingId === item.id && (
                    <div className="absolute inset-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl border border-red-50 dark:border-red-900/30 flex items-center justify-between px-3 animate-in fade-in zoom-in-95 duration-300">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Удалить?</span>
                       <div className="flex items-center gap-1">
                          <button onClick={() => setDeletingId(null)} className="h-7 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Нет</button>
                          <button onClick={() => removeFromCart(item.id)} className="h-7 px-2.5 rounded-lg bg-red-500 text-[8px] font-black uppercase tracking-widest text-white">Да</button>
                       </div>
                    </div>
                  )}

                  <div className={cn("flex gap-3 transition-all duration-300", deletingId === item.id ? "opacity-20 blur-[1px]" : "opacity-100")}>
                    <div className="w-14 h-14 bg-[#f8f9fa] dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700 relative">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{cleanNameFromDimensions(item.name)}</h4>
                          <p className="text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest mt-0.5">{item.variant}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700 scale-90 origin-left">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-5 text-center text-[10px] font-black text-slate-900 dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                          </div>
                          <p className="text-[11px] font-black text-[#2c3b6e] dark:text-blue-400">{formatPrice(item.price)} сум</p>
                        </div>
                    </div>
                    <button onClick={() => setDeletingId(item.id)} className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                        <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#f8f9fa] dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 rounded-t-[1.5rem]">
            <div className="space-y-1.5 mb-4 px-1">
                <div className="flex items-center justify-between text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                   <span>Подитог</span>
                   <span>{formatPrice(subtotal)} сум</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">Итого</span>
                   <span className="text-sm lg:text-base font-black text-[#2c3b6e] dark:text-blue-400">{formatPrice(subtotal)} сум</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
                <Link 
                  href="/checkout"
                  onClick={onClose}
                  className="w-full h-11 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-blue-700 transition-all"
                >
                  Оформить заказ
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link 
                  href="/cart"
                  onClick={onClose}
                  className="w-full h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Перейти в корзину
                </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
