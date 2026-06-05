"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, BarChart2, ShoppingBag, User, Menu, Search, ChevronDown, Phone, MapPin, X, Grid3X3, Sofa, Store, Handshake, HelpCircle, Award, Star, PhoneCall, Box, Sparkles, Layers, ChevronRight, Hammer, Building2, Palette, Users, Briefcase, CheckCircle2, CameraOff, Sun, Moon, Loader2, Image as ImageIcon,
  Home as HomeIcon, DoorOpen, LayoutGrid, Square, Maximize, Layout, Shapes, Wind, Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Compass, Scissors, ShieldCheck, PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Sparkle, Gem
} from "lucide-react";

const lucideMap: Record<string, any> = {
  Home: HomeIcon, DoorOpen, Layers, LayoutGrid, Square, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award,
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
};
const categoryIcons = [Layers, LayoutGrid, Square, DoorOpen, Layout, Box, Shapes, Hammer, Wind, Sparkles];
import { cn, cleanNameFromDimensions } from "@/lib/utils";

import { CartDrawer } from "./cart-drawer";
import { FavoritesDrawer } from "./favorites-drawer";
import { useShop } from "@/context/shop-context";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/translation-context";
import { usePathname, useRouter } from "next/navigation";

/* ── Custom Social Icons (Safe for any Lucide version) ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

/* ── Custom Burger Icon ── */
function CustomBurgerIcon() {
  return (
    <div className="flex flex-col gap-1.5 items-start transition-all">
      <div className="w-7 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all" />
      <div className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all" />
      <div className="w-3 h-0.5 bg-slate-900 dark:bg-white rounded-full transition-all" />
    </div>
  );
}

/* ── Theme Toggle Component ── */
function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group rounded-xl transition-all duration-300 flex items-center gap-3",
        showLabel ? "w-full bg-slate-50 dark:bg-slate-800 p-3" : "w-8 h-8 lg:w-10 lg:h-10 bg-slate-50 dark:bg-slate-800 justify-center"
      )}
      aria-label="Toggle Theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-slate-500 group-hover:text-[#2c3b6e] transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-white transition-colors" />
      )}
      {showLabel && (
        <span className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          {theme === "light" ? "Темная тема" : "Светлая тема"}
        </span>
      )}
    </button>
  );
}

/* ── NAV LINKS DATA ── */
const serviceLinks = [
  { label: "О компании", href: "/about" },
  { label: "Блог", href: "/blog" },
  { label: "Доставка и оплата", href: "/delivery" },
  { label: "Гарантия и возврат", href: "/warranty" },
  { label: "Рассрочка", href: "/installment" },
];

const socialLinks = [
  { icon: InstagramIcon, href: "https://instagram.com/maff.uz", label: "Instagram" },
  { icon: TelegramIcon, href: "https://t.me/maff_uz", label: "Telegram" },
  { icon: TikTokIcon, href: "https://tiktok.com/@maff.uz", label: "TikTok" },
];

const navLinks = [
  { label: "3D Визуализатор", href: "/3d", icon: Sparkles },
  { label: "Каталог", href: "/catalog", icon: Layers },
  { label: "Шоурумы", href: "/showrooms", icon: Store },
  { 
    label: "Партнерам", 
    href: "/partners", 
    icon: Handshake,
    dropdown: [
      { label: "Архитекторам", href: "/partners/architects", icon: Palette },
      { label: "Дизайнерам", href: "/partners/designers", icon: Hammer },
      { label: "Застройщикам", href: "/partners/developers", icon: Building2 },
      { label: "Оптовикам", href: "/partners/wholesale", icon: Briefcase },
    ]
  },
  { label: "Вопросы и ответы", href: "/faq", icon: HelpCircle },
  { label: "Аутлет", href: "/outlet", icon: Box },
  { label: "Сертификаты", href: "/certificates", icon: Award },
];





const RuFlag = () => (
  <svg viewBox="0 0 100 100" className="w-4 h-4 rounded-full overflow-hidden inline-block align-middle border border-white/20">
    <rect y="0" width="100" height="33.3" fill="#FFFFFF" />
    <rect y="33.3" width="100" height="33.4" fill="#0039A6" />
    <rect y="66.7" width="100" height="33.3" fill="#D52B1E" />
  </svg>
);

const UzFlag = () => (
  <svg viewBox="0 0 100 100" className="w-4 h-4 rounded-full overflow-hidden inline-block align-middle border border-white/20">
    <rect y="0" width="100" height="30" fill="#0099B5" />
    <rect y="30" width="100" height="5" fill="#DA291C" />
    <rect y="35" width="100" height="30" fill="#FFFFFF" />
    <rect y="65" width="100" height="5" fill="#DA291C" />
    <rect y="70" width="100" height="30" fill="#1EB53A" />
    <circle cx="20" cy="15" r="7" fill="#FFFFFF" />
    <circle cx="23" cy="15" r="7" fill="#0099B5" />
    <circle cx="34" cy="9" r="1.5" fill="#FFFFFF" />
    <circle cx="40" cy="9" r="1.5" fill="#FFFFFF" />
    <circle cx="46" cy="9" r="1.5" fill="#FFFFFF" />
    <circle cx="34" cy="15" r="1.5" fill="#FFFFFF" />
    <circle cx="40" cy="15" r="1.5" fill="#FFFFFF" />
    <circle cx="46" cy="15" r="1.5" fill="#FFFFFF" />
    <circle cx="34" cy="21" r="1.5" fill="#FFFFFF" />
    <circle cx="40" cy="21" r="1.5" fill="#FFFFFF" />
    <circle cx="46" cy="21" r="1.5" fill="#FFFFFF" />
  </svg>
);

const EnFlag = () => (
  <svg viewBox="0 0 100 100" className="w-4 h-4 rounded-full overflow-hidden inline-block align-middle border border-white/20">
    <rect width="100" height="100" fill="#012169" />
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#FFFFFF" strokeWidth="12" />
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#C8102E" strokeWidth="4" />
    <path d="M50,0 L50,100 M0,50 L100,50" stroke="#FFFFFF" strokeWidth="20" />
    <path d="M50,0 L50,100 M0,50 L100,50" stroke="#C8102E" strokeWidth="12" />
  </svg>
);

const languages = [
  { code: "ru", name: "Русский", flag: <RuFlag /> },
  { code: "uz", name: "O'zbekcha", flag: <UzFlag /> },
  { code: "en", name: "English", flag: <EnFlag /> }
];

export function Header() {
  const { cart, favorites, compare } = useShop();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCatalogExpanded, setIsMobileCatalogExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [catalogData, setCatalogData] = useState<any[]>([]);
  const [notification, setNotification] = useState<{message: string} | null>(null);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ isLoggedIn: boolean, name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("user_name");
    
    if (token) {
      // For immediate UI update, we check if name exists in localStorage,
      // otherwise fallback to fetching from API or just show default
      setUser({ isLoggedIn: true, name: name || "Профиль" });
      
      const fetchUser = async () => {
        try {
          const res = await fetch("/api/v1/users/me", {
             headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
             const data = await res.json();
             if (data.full_name) {
               setUser({ isLoggedIn: true, name: data.full_name });
               localStorage.setItem("user_name", data.full_name);
             }
          } else {
             // Token invalid, clear it
             localStorage.removeItem("token");
             setUser({ isLoggedIn: false, name: "" });
          }
        } catch (e) {
           console.error("Failed to fetch user in header", e);
        }
      };
      fetchUser();
    } else {
      setUser({ isLoggedIn: false, name: "" });
    }
  }, [pathname]);

  const { locale: currentLang, changeLanguage, t } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const uiKeys: Record<string, string> = {
    "О компании": "about_company",
    "Блог": "blog",
    "Доставка и оплата": "delivery_payment",
    "Гарантия и возврат": "warranty_return",
    "Рассрочка": "installment",
    "3D Визуализатор": "3d_visualizer",
    "Каталог": "catalog",
    "Шоурумы": "showrooms",
    "Партнерам": "partners",
    "Архитекторам": "architects",
    "Дизайнерам": "designers",
    "Застройщикам": "developers",
    "Оптовикам": "wholesalers",
    "Вопросы и ответы": "faq_qa",
    "Аутлет": "outlet",
    "Сертификаты": "certificates",
    "Все категории": "all_categories",
    "Поиск товаров...": "search_placeholder",
    "Соцсети": "socials",
    "Личный кабинет": "profile",
    "Войти": "login",
    "Смотреть всё": "view_all",
    "Смотреть все": "view_all",
    "категорий": "categories_count",
    "Каталог товаров": "catalog_products",
    "Сравнение товаров": "compare_products",
    "Выберите категорию": "select_category",
    "Сравнение": "compare",
    "Избранное": "favorites",
    "Корзина": "cart",
  };

  const getTranslation = (text: string) => {
    const key = uiKeys[text];
    if (key) {
      return t(key, text);
    }
    return text;
  };

  const handleLangChange = (lang: string) => {
    const host = window.location.hostname;
    const dotDomain = host.startsWith(".") ? host : "." + host;

    // Delete existing googtrans cookies on all possible domains and paths
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dotDomain};`;
    
    changeLanguage(lang);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderCategoryIcon = (cat: any) => {
    const url = cat.imageUrl;
    if (url && (url.startsWith("http") || url.startsWith("/"))) {
      return <img src={url} alt={cat.title} className="w-full h-full object-cover rounded-lg" />;
    }
    if (url && lucideMap[url]) {
      const IconComp = lucideMap[url];
      return <IconComp className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors" />;
    }
    const IconComp = categoryIcons[cat.fallbackIconIdx % categoryIcons.length];
    return <IconComp className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors" />;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/categories/");
        if (!res.ok) return;
        const data = await res.json();
        const mainCats = data.filter((c: any) => !c.parent_id);
        const mappedData = mainCats.map((cat: any, idx: number) => {
          const subs = data.filter((c: any) => c.parent_id === cat.id).map((c: any) => {
            const hasChildren = data.some((child: any) => child.parent_id === c.id);
            return {
              id: c.id,
              name: c.name,
              hasChildren
            };
          });
          return { 
            id: cat.id, 
            title: cat.name, 
            subcategories: subs, 
            imageUrl: cat.image_url,
            fallbackIconIdx: idx
          };
        });
        if (mappedData.length > 0) { setCatalogData(mappedData); setActiveCategory(mappedData[0].id); }
      } catch (e) { console.error("Failed to fetch catalog", e); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/v1/products/?q=${encodeURIComponent(searchQuery)}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen || isCatalogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen, isCatalogOpen]);

  return (
    <>
      <header className="w-full sticky top-0 z-[9999] bg-white dark:bg-[#0f172a] shadow-none transition-colors">
        <div className={cn("fixed top-4 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-300 pointer-events-none", notification ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0")}>
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 border border-white/10 shadow-none">
            <div className="flex items-center justify-center text-amber-400"><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">{notification?.message}</p>
          </div>
        </div>

        <div className="hidden lg:block w-full bg-[#2c3b6e] dark:bg-[#0f172a] text-white/90 border-b border-white/5 shadow-none">
          <div className="max-w-7xl mx-auto px-6 h-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {serviceLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-[11px] font-medium hover:text-white transition-colors">
                  {getTranslation(link.label)}
                </Link>
              ))}
              <Link href="/socials" className="text-[11px] font-medium hover:text-white transition-colors">
                {getTranslation("Соцсети")}
              </Link>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors notranslate" translate="no">
                 <MapPin className="w-3.5 h-3.5" />
                 <span className="text-[11px] font-medium">Ташкент</span>
               </div>
               <div className="w-px h-3 bg-white/10" />
               <Link href="tel:+998712055454" className="flex items-center gap-1.5 hover:text-white transition-colors notranslate" translate="no">
                 <Phone className="w-3.5 h-3.5" />
                 <span className="text-[11px] font-black text-white">+998 (71) 205-54-54</span>
               </Link>
               <div className="w-px h-3 bg-white/10" />
               <div className="relative" ref={langDropdownRef}>
                 <button 
                   onClick={() => setIsLangOpen(!isLangOpen)}
                   className="flex items-center gap-1.5 text-[11px] font-medium hover:text-white transition-colors cursor-pointer notranslate"
                   translate="no"
                 >
                   <span>{languages.find(l => l.code === currentLang)?.flag}</span>
                   <span className="uppercase">{currentLang}</span>
                   <ChevronDown className="w-3 h-3 opacity-60" />
                 </button>
                 {isLangOpen && (
                   <div className="absolute right-0 top-full mt-2 w-28 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl py-1.5 shadow-2xl z-[10002] animate-slide-down">
                     {languages.map((lang) => (
                       <button
                         key={lang.code}
                         onClick={() => {
                           handleLangChange(lang.code);
                           setIsLangOpen(false);
                         }}
                         className={cn(
                           "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left notranslate",
                           currentLang === lang.code && "text-[#2c3b6e] dark:text-blue-400 font-bold"
                         )}
                         translate="no"
                       >
                         <span>{lang.flag}</span>
                         <span>{lang.name}</span>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-white dark:bg-[#0f172a] border-b border-[#f3f4f6] dark:border-slate-800 shadow-none relative h-16 lg:h-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 h-full flex items-center justify-between gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2"><CustomBurgerIcon /></button>
            <Link href="/" translate="no" className="flex-shrink-0 group lg:relative absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 notranslate">
               <img src="/maff-brand-logo.png" alt="MAFF" className="w-auto h-12 lg:h-14 object-contain dark:invert" />
            </Link>
            
            <div className="hidden lg:flex flex-grow items-center gap-4 max-w-3xl relative" ref={searchRef}>
              <button onClick={() => setIsCatalogOpen(!isCatalogOpen)} className={cn("flex items-center gap-3 px-6 py-3 rounded-full font-bold text-[14px] transition-all active:scale-95 shadow-none", isCatalogOpen ? "bg-[#1a1a1a] text-white" : "bg-[#2c3b6e] text-white")}>
                {isCatalogOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}{getTranslation("Каталог")}
              </button>
              
              <div className="relative flex-grow group shadow-none">
                <input 
                  type="text" 
                  placeholder={getTranslation("Поиск товаров...")} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full py-3.5 pl-12 pr-16 text-sm outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-[#2c3b6e]/5 transition-all shadow-none" 
                  onFocus={() => setSearchFocused(true)} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {isSearching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                   <button className="w-10 h-10 rounded-full bg-[#2c3b6e] text-white flex items-center justify-center shadow-none"><Search className="w-4 h-4" /></button>
                </div>

                {searchFocused && (searchQuery.length >= 2 || searchResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl z-[10001]">
                    <div className="p-2">
                       {searchResults.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                             {searchResults.map((item) => (
                               <Link key={item.id} href={`/product/${item.id}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                 <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                                    {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon className="w-4 h-4" /></div>}
                                 </div>
                                 <div className="flex-grow flex flex-col justify-center min-w-0">
                                    <span className="text-[12px] font-bold text-slate-900 dark:text-white group-hover:text-[#2c3b6e] dark:group-hover:text-blue-400 transition-colors truncate">{cleanNameFromDimensions(item.name)}</span>
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight truncate">
                                       <span className="notranslate" translate="no">{item.brand ? item.brand : ""}</span> {item.brand ? "• " : ""}<span className="notranslate" translate="no">{item.price?.toLocaleString()} сум</span>
                                    </span>
                                 </div>
                                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#2c3b6e] dark:group-hover:bg-blue-600 transition-all">
                                   <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                                 </div>
                               </Link>
                             ))}
                          </div>
                       ) : searchQuery.length >= 2 && !isSearching ? (
                          <div className="p-8 text-center">
                             <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                             <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Ничего не найдено</p>
                          </div>
                       ) : null}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 px-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Найдено результатов: {searchResults.length}</span>
                        <Link href="/catalog" className="text-[10px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest hover:underline">Смотреть всё</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 lg:gap-3 flex-shrink-0">
              <Link href="/compare" className="hidden lg:flex group items-center gap-2.5 relative px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-none">
                <div className="relative">
                  <BarChart2 className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                  {compare.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#2c3b6e] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-none">{compare.length}</span>}
                </div>
                <div className="hidden lg:flex flex-col text-left"><span className="text-[9px] font-bold text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white leading-none mb-0.5">{getTranslation("Сравнение")}</span><span className={cn("text-[11px] font-bold leading-none", compare.length > 0 ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600")}>{compare.length > 0 ? `${compare.length}` : "—"}</span></div>
              </Link>
              <button onClick={() => setIsFavoritesOpen(true)} className="group flex items-center gap-2.5 relative px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-none">
                <div className="relative">
                  <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                  {favorites.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#2c3b6e] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-none">{favorites.length}</span>}
                </div>
                <div className="hidden lg:flex flex-col text-left"><span className="text-[9px] font-bold text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white leading-none mb-0.5">{getTranslation("Избранное")}</span><span className={cn("text-[11px] font-bold leading-none", favorites.length > 0 ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600")}>{favorites.length > 0 ? `${favorites.length}` : "—"}</span></div>
              </button>
              <button onClick={() => setIsCartOpen(true)} className="group flex items-center gap-2.5 relative px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-none">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                  {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-[#2c3b6e] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-none">{cart.length}</span>}
                </div>
                <div className="hidden lg:flex flex-col text-left"><span className="text-[9px] font-bold text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white leading-none mb-0.5">{getTranslation("Корзина")}</span><span className={cn("text-[11px] font-bold leading-none", cart.length > 0 ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600")}>{cart.length > 0 ? `${cart.length} ед.` : "—"}</span></div>
              </button>
              <div className="hidden lg:block w-px h-10 bg-slate-100 dark:bg-slate-800 mx-1" />
              <div className="hidden lg:block"><ThemeToggle /></div>
              <div className="hidden lg:block w-px h-10 bg-slate-100 dark:bg-slate-800 mx-1" />
              <Link href={user?.isLoggedIn ? "/profile" : "/login"} className="group flex items-center gap-2.5 relative px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-none">
                 <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full lg:bg-slate-100 dark:lg:bg-slate-800 flex items-center justify-center group-hover:bg-[#2c3b6e] transition-colors"><User className="w-5 h-5 text-slate-400 group-hover:text-white" strokeWidth={1.5} /></div>
                 <div className="hidden lg:flex flex-col text-left"><span className="text-[9px] font-bold text-slate-400 group-hover:text-[#2c3b6e] leading-none mb-0.5">{getTranslation("Личный кабинет")}</span><span className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{user?.isLoggedIn ? user.name : getTranslation("Войти")}</span></div>
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-full bg-white dark:bg-[#0f172a] shadow-none">
          <div className="max-w-7xl mx-auto px-6 flex items-center h-10 shadow-none">
            <nav className="flex items-center gap-4 h-full shadow-none">
              {navLinks.map((item) => (
                <div key={item.label} className="relative h-full flex items-center group shadow-none" onMouseEnter={() => setHoveredLink(item.label)} onMouseLeave={() => setHoveredLink(null)}>
                  <Link href={item.href} className="flex items-center gap-2 text-[12px] font-medium text-slate-600 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-white px-2 py-1.5 transition-all tracking-tight shadow-none">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-blue-500" strokeWidth={2} />
                    {getTranslation(item.label)}
                    {item.dropdown && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", hoveredLink === item.label && "rotate-180")} />}
                  </Link>
                  {item.dropdown && (
                    <div className={cn("absolute top-full left-0 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-2 opacity-0 translate-y-2 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto shadow-none", hoveredLink === item.label && "opacity-100 translate-y-0 pointer-events-auto")}>
                      {item.dropdown.map((sub) => (
                        <Link key={sub.label} href={sub.href} className="flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors first:rounded-t-xl last:rounded-b-xl shadow-none group/sub">
                          <sub.icon className="w-4 h-4 opacity-50 group-hover/sub:text-[#2c3b6e] dark:group-hover/sub:text-blue-500" />
                          {getTranslation(sub.label)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        <div className={cn("absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-all duration-500 overflow-hidden z-0 shadow-none", isCatalogOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 pointer-events-none")}>
          <div className="max-w-7xl mx-auto flex h-[500px] shadow-none">
             <div className="w-[300px] border-r border-slate-50 dark:border-slate-800 overflow-y-auto no-scrollbar py-4 bg-slate-50/30 dark:bg-slate-950/30 shadow-none">
                {catalogData.map((cat) => (
                  <button key={cat.id} onMouseEnter={() => setActiveCategory(cat.id)} className={cn("w-full flex items-center justify-between px-6 py-3.5 text-left transition-all group shadow-none", activeCategory === cat.id ? "bg-white dark:bg-slate-900 border-r-2 border-[#2c3b6e] text-[#2c3b6e] dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-white")}>
                    <div className="flex items-center gap-3"><div className={cn("w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-colors", activeCategory === cat.id ? "bg-blue-50 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20")}>{renderCategoryIcon(cat)}</div><span className="text-[11px] font-black uppercase tracking-tight">{cat.title}</span></div>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", activeCategory === cat.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0")} />
                  </button>
                ))}
             </div>
             <div className="flex-grow bg-white dark:bg-slate-900 flex flex-col shadow-none">
                {activeCategory ? (() => {
                   const cat = catalogData.find(c => c.id === activeCategory);
                   const realSubs = cat?.subcategories || [];
                   return (
                     <>
                       <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shadow-none">
                         <div><h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{cat?.title}</h4><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{realSubs.length} {getTranslation("категорий")}</p></div>
                         <Link href={`/catalog?category=${cat?.id}`} className="flex items-center gap-1 text-[10px] font-black text-[#2c3b6e] dark:text-white hover:text-blue-600 uppercase tracking-widest transition-colors shadow-none">{getTranslation("Смотреть всё")} <ChevronRight className="w-3 h-3" /></Link>
                       </div>
                       <div className="flex-1 overflow-y-auto px-10 py-8 no-scrollbar shadow-none">
                         <div className="grid grid-cols-3 gap-x-8 gap-y-6 shadow-none">
                           {realSubs.map((sub: any, sidx: number) => (
                             <Link 
                               key={sidx} 
                               href={sub.hasChildren ? `/catalog?category=${sub.id}` : `/catalog/products?category=${sub.id}`} 
                               onClick={() => setIsCatalogOpen(false)}
                               className="group flex flex-col gap-1 shadow-none"
                             >
                               <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-[#2c3b6e] dark:group-hover:text-blue-500 transition-colors">
                                 {sub.name}
                               </span>
                               <div className="w-4 h-0.5 bg-[#2c3b6e] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                             </Link>
                           ))}
                         </div>
                       </div>
                     </>
                   );
                })() : <div className="flex-grow flex items-center justify-center text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-widest shadow-none">{getTranslation("Выберите категорию")}</div>}
             </div>
          </div>
        </div>
      </header>

      <div className={cn("fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-[9998]", isCatalogOpen || isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsMobileMenuOpen(false)} />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FavoritesDrawer isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />

      <div className={cn("fixed inset-0 z-[10000] lg:hidden transition-all duration-300", isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none shadow-none")}>
         <div className={cn("absolute top-0 left-0 bottom-0 w-full bg-white dark:bg-[#0f172a] transition-transform duration-300 flex flex-col overflow-y-auto shadow-none", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0f172a] z-10 shadow-none">
              <div className="flex items-center notranslate" translate="no"><img src="/maff-brand-logo.png" alt="MAFF" className="w-auto h-9 object-contain shadow-none dark:invert" /></div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-none"><X className="w-5 h-5 shadow-none" strokeWidth={1.5} /></button>
            </div>

            <div className="flex-grow py-2 shadow-none">
              <div className="border-b border-slate-50 dark:border-slate-800 shadow-none">
                 <button onClick={() => setIsMobileCatalogExpanded(!isMobileCatalogExpanded)} className="w-full flex items-center justify-between px-5 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-tight hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-none">
                   <div className="flex items-center gap-3 shadow-none">
                     <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shadow-none text-[#2c3b6e] dark:text-blue-400"><Grid3X3 className="w-4.5 h-4.5" /></div>
                     <span className="text-[14px]">{getTranslation("Каталог товаров")}</span>
                   </div>
                   <ChevronDown className={cn("w-5 h-5 transition-transform duration-300 opacity-40", isMobileCatalogExpanded && "rotate-180")} />
                 </button>
                 <div className={cn("overflow-hidden transition-all duration-300 bg-slate-50/50 dark:bg-slate-950/30 shadow-none", isMobileCatalogExpanded ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0")}>
                   {catalogData.map((cat) => (
                     <Link key={cat.id} href={`/catalog?category=${cat.id}`} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-10 py-3 text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-blue-500 transition-colors group/mobcat">
                       <div className="w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                         {renderCategoryIcon(cat)}
                       </div>
                       {cat.title.toUpperCase()}
                     </Link>
                   ))}
                 </div>
              </div>

              <div className="px-5 space-y-0.5 mt-4 shadow-none">
                <Link href="/compare" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-2 rounded-xl text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/moblink">
                  <div className="flex items-center gap-4">
                    <BarChart2 className="w-4.5 h-4.5 opacity-30 shadow-none group-hover/moblink:text-[#2c3b6e] dark:group-hover/moblink:text-blue-500" />
                    {getTranslation("Сравнение товаров")}
                  </div>
                  {compare.length > 0 && <span className="px-2 py-0.5 bg-[#2c3b6e] text-white text-[10px] rounded-full">{compare.length}</span>}
                </Link>
                {navLinks.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 py-2.5 px-2 rounded-xl text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#2c3b6e] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/moblink">
                    <item.icon className="w-4.5 h-4.5 opacity-30 shadow-none group-hover/moblink:text-[#2c3b6e] dark:group-hover/moblink:text-blue-500" />
                    {getTranslation(item.label)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 mt-auto space-y-4 shadow-none">
              {/* Mobile Language Selector */}
              <div className="flex flex-col gap-2 p-3 bg-slate-100/50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1 notranslate" translate="no">Выбор языка / Language</span>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-bold transition-all border notranslate",
                        currentLang === lang.code 
                          ? "bg-white dark:bg-slate-700 text-[#2c3b6e] dark:text-white border-[#2c3b6e]/20 dark:border-slate-600 shadow-sm"
                          : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                      translate="no"
                    >
                      <span>{lang.flag}</span>
                      <span className="uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <ThemeToggle showLabel={true} />
              
              <div className="flex items-center gap-4 px-1 py-2">
                  <div className="flex items-center gap-4">
                     <a href="/socials" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all group border border-slate-100 dark:border-slate-800 notranslate" translate="no" title="Наши соцсети">
                        <InstagramIcon className="w-5 h-5 text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#2c3b6e] dark:group-hover:text-white">Мы в соцсетях</span>
                     </a>
                  </div>
              </div>

              <div className="space-y-2 shadow-none px-1">
                <Link href="tel:+998712055454" className="flex items-center gap-3 text-lg font-black text-slate-900 dark:text-white shadow-none notranslate" translate="no">
                   <Phone className="w-4 h-4 text-[#2c3b6e]" />+998 71 205 54 54
                </Link>
                <div className="flex items-center justify-between shadow-none">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Ежедневно с 9:00 до 21:00</p>
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
            </div>
         </div>
       </div>
       <div id="google_translate_element" style={{ display: 'none' }} />
    </>
  );
}
