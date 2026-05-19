"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Box, 
  ShoppingBag, 
  Users, 
  Settings, 
  ChevronRight,
  LogOut,
  Store,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  BarChart3,
  Handshake,
  Award,
  Info,
  CreditCard,
  HelpCircle,
  PhoneCall,
  Truck,
  Share2,
  Zap,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { group: "Основные", items: [
    { label: "Дашборд", href: "/", icon: LayoutDashboard },
    { label: "Заказы", href: "/orders", icon: ShoppingBag },
    { label: "Категории", href: "/categories", icon: Layers },
    { label: "Товары", href: "/products", icon: Box },
    { label: "Клиенты", href: "/customers", icon: Users },
    { label: "Интеграции", href: "/integrations", icon: Zap },
  ]},
  { group: "Контент", items: [
    { label: "Главная", href: "/pages/home", icon: ImageIcon },
    { label: "Соц. сети", href: "/socials", icon: Share2 },
    { label: "О нас", href: "/about", icon: Info },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
    { label: "Шоу-румы", href: "/showrooms", icon: Store },
    { label: "Контакты", href: "/contact", icon: PhoneCall },
    { label: "Сертификаты", href: "/certificates", icon: Award },
    { label: "Партнеры", href: "/partners", icon: Handshake },
    { label: "Блог", href: "/blog", icon: MessageSquare },
    { label: "Доставка", href: "/delivery", icon: Truck },
    { label: "Рассрочка", href: "/installment", icon: CreditCard },
    { label: "Гарантия", href: "/warranty", icon: ShieldCheck },
  ]},
  { group: "Система", items: [
    { label: "Аналитика", href: "/analytics", icon: BarChart3 },
    { label: "Настройки", href: "/settings", icon: Settings },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#0a0a0a] text-white flex flex-col sticky top-0 left-0 z-50 border-r border-white/5">
      {/* Brand Header */}
      <div className="p-8 pb-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-[#2c3b6e] rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110">
            <Store className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black uppercase tracking-tighter leading-none text-white">MAFF</span>
            <span className="text-[8px] font-black text-[#2c3b6e] uppercase tracking-[0.25em] mt-1 opacity-80">Admin Center</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-grow px-4 overflow-y-auto pb-10">
        {menuItems.map((group, gidx) => (
          <div key={gidx} className="mb-6">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] px-4 mb-3">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-[#2c3b6e] text-white shadow-lg shadow-blue-900/20" 
                        : "text-white/40 hover:bg-white/[0.03] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-white/10 group-hover:text-[#2c3b6e]")} strokeWidth={2.5} />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-white/50" strokeWidth={3} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Session */}
      <div className="p-4 mt-auto">
        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-[10px] shadow-inner border border-white/10">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white">Administrator</span>
              <span className="text-[8px] text-[#2c3b6e] font-black uppercase tracking-widest">Superuser</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-400/5 rounded-xl transition-all border border-red-400/10 active:scale-95">
            <LogOut className="w-3 h-3" />
            Выход
          </button>
        </div>
      </div>
    </aside>
  );
}
