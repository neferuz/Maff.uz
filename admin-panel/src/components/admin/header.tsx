"use client";

import React from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  Globe, 
  Menu,
  ChevronDown,
  LayoutGrid,
  Maximize
} from "lucide-react";

export function Header() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40 no-shadow">
      <div className="flex items-center gap-8 flex-grow">
        <button className="lg:hidden p-2 text-slate-500 hover:text-[#f0a400] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative max-w-lg w-full hidden md:block group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#f0a400] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Поиск по системе..." 
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#f0a400] focus:ring-4 focus:ring-amber-500/5 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">⌘</kbd>
             <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-[#f0a400] hover:bg-amber-50 rounded-xl transition-all relative group">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f0a400] rounded-full border-2 border-white animate-pulse" />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all hidden sm:block">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
        
        <div className="w-px h-8 bg-slate-100" />
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="relative">
             <div className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-white flex items-center justify-center text-white font-black text-[11px] group-hover:scale-105 transition-transform">
               MA
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-black text-slate-900 leading-none mb-1">Мафф Админ</span>
            <span className="text-[9px] font-black text-[#f0a400] uppercase tracking-widest opacity-80">Online</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
