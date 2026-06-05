"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  // In a real app, we would clear cart and session storage here if not done before.

  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-[340px] w-full bg-white dark:bg-[#121212] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/10 rounded-full blur-lg animate-pulse"></div>
            <CheckCircle2 className="relative w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-tighter text-[#2c3b6e] dark:text-white">
            Заказ Оформлен!
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mx-auto">
            Спасибо за покупку. Мы уже начали обрабатывать ваш заказ.
          </p>
        </div>

        {orderId && (
          <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
            <Package className="w-4 h-4 text-[#2c3b6e] dark:text-slate-400" />
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-tight">Номер заказа</p>
              <p className="text-xs font-black text-[#2c3b6e] dark:text-white leading-tight">ORD-{orderId}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Link 
            href="/profile" 
            className="w-full flex justify-center items-center gap-1.5 py-2.5 bg-[#2c3b6e] hover:bg-[#1a2444] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Мои заказы
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link 
            href="/catalog" 
            className="w-full flex justify-center items-center py-2.5 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-[#2c3b6e] dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
