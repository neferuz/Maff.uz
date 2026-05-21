"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ChevronDown, 
  Home, 
  Users, 
  Box, 
  Zap, 
  FileText, 
  Code, 
  ShoppingBag, 
  Search, 
  Bell, 
  Settings,
  LogOut,
  UserCircle,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { evolventa } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

const mainNav = [
  { icon: Home, label: "Дашборд", href: "/" },
  { icon: ShoppingBag, label: "Заказы", href: "/orders" },
  { icon: Layers, label: "Категории", href: "/categories" },
  { icon: Box, label: "Товары", href: "/products" },
  { icon: Users, label: "Клиенты", href: "/customers" },
  { icon: Zap, label: "Интеграции", href: "/integrations" },
];

const pageSections = [
  { 
    icon: FileText, 
    label: "Страницы", 
    href: "/pages",
    subItems: [
      { label: "Главная", href: "/pages/home" },
      { label: "Соц. сети", href: "/socials" },
      { label: "О нас", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Шоу-румы", href: "/showrooms" },
      { label: "Контакты", href: "/contact" },
      { label: "Сертификаты", href: "/certificates" },
      { label: "Партнеры", href: "/partners" },
      { label: "Блог", href: "/blog" },
      { label: "Доставка", href: "/delivery" },
      { label: "Рассрочка", href: "/installment" },
      { label: "Гарантия", href: "/warranty" },
      { label: "Футер", href: "/footer" }
    ]
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Auth Check
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (!token && pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsProfileOpen(false);
    router.push("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Logic
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const allSearchableItems = [
    ...mainNav,
    ...pageSections[0].subItems
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allSearchableItems.filter(item => 
        item.label.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/login") {
    return (
      <html lang="ru" className={evolventa.variable}>
        <body className="antialiased font-evolventa bg-[#f7f8f9]">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="ru" className={evolventa.variable}>
      <body className="antialiased font-evolventa bg-white text-[#1a1f36]">
        <div className="min-h-screen flex">
          {/* Sidebar - No Shadows */}
          <aside className="w-64 bg-[#f7f8f9] border-r border-[#e3e8ee] flex flex-col sticky top-0 h-screen flex-shrink-0 z-40 no-shadow">
            {/* Workspace Selector */}
            <div className="px-3 py-3">
               <button className="w-full flex items-center gap-2 p-1.5 hover:bg-[#e3e8ee] transition-colors rounded-lg group text-left text-[#1a1f36] no-shadow">
                  <div className="w-8 h-8 bg-white border border-[#e3e8ee] rounded flex items-center justify-center text-[13px] font-bold text-slate-900 flex-shrink-0">
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold leading-none truncate">MAFF Admin</p>
                    <p className="text-[11px] text-[#4f566b] leading-tight truncate">Панель управления</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#4f566b] group-hover:text-slate-900 transition-colors flex-shrink-0" />
               </button>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5 mb-6">
                <div className="px-3 py-3">
                  <p className="text-[11px] font-medium text-[#4f566b] uppercase tracking-wider">Управление</p>
                </div>
                {mainNav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all no-shadow",
                      pathname === item.href 
                        ? "text-[#2c3b6e] bg-white border border-[#e3e8ee]/50" 
                        : "text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-[#2c3b6e]" : "text-[#4f566b]")} strokeWidth={1.5} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Pages Section */}
              <div>
                <p className="px-3 text-[11px] font-medium text-[#4f566b] mb-2 uppercase tracking-wider">Контент</p>
                <div className="space-y-0.5">
                  {pageSections.map((section, idx) => (
                    <div key={section.label}>
                      <button className="w-full flex items-center justify-between px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all group no-shadow">
                        <div className="flex items-center gap-3">
                          <section.icon className="w-5 h-5" strokeWidth={1.5} />
                          {section.label}
                        </div>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {section.subItems && (
                        <div className="mt-1 space-y-1 pb-2 px-1">
                          {section.subItems.map(sub => (
                            <Link 
                              key={typeof sub === 'string' ? sub : sub.label} 
                              href={typeof sub === 'string' ? "#" : sub.href} 
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all no-shadow",
                                pathname === (typeof sub === 'string' ? "" : sub.href)
                                  ? "text-[#2c3b6e] bg-white border border-[#e3e8ee]/50" 
                                  : "text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50"
                              )}
                            >
                              <div className={cn("w-1.5 h-1.5 rounded-full transition-all", pathname === (typeof sub === 'string' ? "" : sub.href) ? "bg-[#f0a400] scale-110" : "bg-[#e3e8ee]")} />
                              {typeof sub === 'string' ? sub : sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>

            {/* Footer Nav */}
            <div className="px-2.5 py-4 border-t border-[#e3e8ee] space-y-0.5">
               <button className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all no-shadow">
                  <Settings className="w-5 h-5" strokeWidth={1.5} />
                  Настройки
               </button>
               <button className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all no-shadow">
                  <Code className="w-5 h-5" strokeWidth={1.5} />
                  Разработчикам
               </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Top Header - No Shadows */}
            <header className="h-16 border-b border-[#e3e8ee] flex items-center justify-between px-8 sticky top-0 z-30 bg-white/80 backdrop-blur-md no-shadow">
              <div className="flex items-center gap-8 flex-1">
                <div className="relative w-full max-w-sm group" ref={searchRef}>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <Search className="w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск разделов..." 
                    className="w-full bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white pl-10 pr-12 py-2 text-[13px] font-medium rounded-lg transition-all outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] pointer-events-none uppercase tracking-tighter">
                    <span className="text-[9px]">⌘</span>K
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl z-[100] overflow-hidden py-2"
                      >
                         {searchResults.map((result) => (
                           <Link
                             key={result.label}
                             href={result.href}
                             onClick={() => setSearchQuery("")}
                             className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f8f9] transition-colors group"
                           >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#4f566b] group-hover:text-[#2c3b6e] group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] transition-all">
                                {result.icon ? <result.icon className="w-4 h-4" strokeWidth={1.5} /> : <div className="w-1.5 h-1.5 rounded-full bg-[#f0a400]" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-[#1a1f36]">{result.label}</span>
                                <span className="text-[10px] text-[#4f566b] uppercase tracking-widest font-bold">Перейти в раздел</span>
                              </div>
                           </Link>
                         ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border-r border-[#e3e8ee] pr-4 mr-1 gap-1">
                  <button className="p-2 text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] rounded-lg transition-all relative group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#cd5c5c] border-2 border-white rounded-full" />
                  </button>
                  <button className="p-2 text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] rounded-lg transition-all group">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={cn(
                      "flex items-center gap-2.5 p-1 rounded-full transition-all group no-shadow",
                      isProfileOpen ? "bg-[#f7f8f9]" : "hover:bg-[#f7f8f9]"
                    )}
                  >
                    <div className="w-8 h-8 bg-gradient-to-tr from-[#2c3b6e] to-[#4a5e9e] rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-transparent group-hover:ring-[#2c3b6e]/20 transition-all">
                      AU
                    </div>
                    <div className="hidden lg:flex flex-col items-start pr-1">
                      <span className="text-[12px] font-bold text-[#1a1f36] leading-none mb-1">Admin User</span>
                      <span className="text-[10px] text-[#4f566b] font-medium leading-none">Версия 2.4.0</span>
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-[#4f566b] transition-transform duration-200", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-[#e3e8ee] rounded-xl shadow-none z-[100] overflow-hidden py-1.5"
                      >
                        <div className="px-4 py-3 border-b border-[#f7f8f9]">
                          <p className="text-[12px] font-bold text-[#1a1f36]">Admin User</p>
                          <p className="text-[11px] text-[#4f566b]">admin@maff.uz</p>
                        </div>
                        
                        <div className="py-1">
                           <Link 
                             href="/profile" 
                             onClick={() => setIsProfileOpen(false)}
                             className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] transition-all"
                           >
                             <UserCircle className="w-4 h-4" />
                             Мой профиль
                           </Link>
                           <Link 
                             href="/settings" 
                             onClick={() => setIsProfileOpen(false)}
                             className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] transition-all"
                           >
                             <Settings className="w-4 h-4" />
                             Настройки
                           </Link>
                        </div>

                        <div className="border-t border-[#f7f8f9] mt-1 pt-1">
                           <button 
                             onClick={handleLogout}
                             className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#cd5c5c] hover:bg-[#cd5c5c]/5 transition-all"
                           >
                             <LogOut className="w-4 h-4" />
                             Выйти
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
