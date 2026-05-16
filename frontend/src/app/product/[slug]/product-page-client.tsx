"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, 
  ChevronDown,
  Minus, 
  Plus, 
  X,
  ShoppingBag, 
  CreditCard, 
  Truck, 
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/ui/product-card";

export default function ProductPageClient({ params }: { params: { slug: string } }) {
  // ── State ──
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [area, setArea] = useState(1);
  const [packs, setPacks] = useState(1);
  const [waste, setWaste] = useState(0); // percentage
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // ── Fetch Data ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/products/${params.slug}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        
        // Enrich data with defaults/calculated if missing
        const enrichedProduct = {
          ...data,
          packSize: data.pack_size || 1.0,
          pricePerM2: data.price || 0,
        };
        
        setProduct(enrichedProduct);
        setActiveImage(data.image_url || (data.images && data.images[0]) || null);

        // Fetch similar products in the same category
        if (data.category_id) {
          const simRes = await fetch(`/api/v1/products/?category_id=${data.category_id}&limit=5`);
          const simData = await simRes.json();
          setSimilarProducts(simData.filter((p: any) => p.id !== data.id).slice(0, 4));
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.slug]);

  // ── Calculations ──
  useEffect(() => {
    if (!product) return;
    const packSize = product.packSize || 2.13;
    const areaWithWaste = area * (1 + waste / 100);
    const neededPacks = Math.ceil(areaWithWaste / packSize);
    setPacks(neededPacks);
  }, [area, waste, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#2c3b6e] animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Товар не найден</p>
        <Link href="/outlet" className="text-[#2c3b6e] font-black uppercase text-xs tracking-widest border-b-2 border-[#2c3b6e]">Вернуться в каталог</Link>
      </div>
    );
  }

  const packSize = product.packSize;
  const pricePerM2 = product.pricePerM2;
  const totalArea = packs * packSize;
  const totalPrice = totalArea * pricePerM2;
  const monthlyPayment = totalPrice / installmentMonths;

  const formatPrice = (num: any) => {
    const val = Number(num || 0);
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const installmentPartners = [
    { name: "alif", logo: "https://s3.fortifai.uz/shop/rand/ce/b1/c5/ceb1c58c-7454-4d16-ad6a-c1f11cea9965.jpg" },
    { name: "uzum", logo: "https://api.logobank.uz/media/logos_png/Uzum_Nasiya-01.png" },
    { name: "anor", logo: "https://pultop.uz/wp-content/uploads/2024/07/anor-320.png" },
  ];

  const tabs = [
    { id: "description", label: "Описание" },
    { id: "specs", label: "Характеристики" },
    { id: "delivery", label: "Доставка" },
  ];

  const formatDescription = (text: string) => {
    if (!text) return null;
    
    // Split by sentences (dot followed by space and Capital letter)
    const sentences = text.split(/(?<=[.!?])\s+(?=[А-ЯA-Z])/);
    
    if (sentences.length <= 2) return <p>{text}</p>;

    const paragraphs: React.ReactNode[] = [];
    let currentGroup: string[] = [];
    let pCount = 0;

    sentences.forEach((sentence, idx) => {
      // Logic: group 2-3 sentences into a paragraph, or break if it's a "list-like" sentence
      const isListLike = /класс|мм|м²|упаковк|слой|конструк|бренд/i.test(sentence);
      
      if (isListLike && currentGroup.length > 0) {
        paragraphs.push(<p key={`p-${pCount++}`} className="mb-4">{currentGroup.join(' ')}</p>);
        currentGroup = [];
      }

      currentGroup.push(sentence);

      if (currentGroup.length >= 3 || idx === sentences.length - 1) {
        paragraphs.push(<p key={`p-${pCount++}`} className="mb-4">{currentGroup.join(' ')}</p>);
        currentGroup = [];
      }
    });

    return (
      <div className="space-y-2">
        {paragraphs}
      </div>
    );
  };

  const productName = product.name || "Товар без названия";
  const productBrand = (product.brand || "").toLowerCase();
  const doorBrands = ['portika', 'zadoor', 'profildoors', 'волховец', 'volkhovets', 'filomuro'];
  const doorKeywords = ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'];
  const isDoor = doorKeywords.some(k => productName.toLowerCase().includes(k)) ||
                 doorBrands.some(b => productBrand.includes(b));

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Breadcrumbs ── */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Главная</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <Link href="/outlet" className="hover:text-slate-900 dark:hover:text-white transition-colors">Аутлет</Link>
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-slate-900 dark:text-slate-200 truncate max-w-[200px]">{productName}</span>
      </nav>

      {/* ── Main Section ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-2 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-start">
          
          {/* Visuals */}
          <div className="lg:col-span-6 space-y-3">
             <div className={cn(
                "relative aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-2xl lg:rounded-[2rem] overflow-hidden group border border-slate-100 dark:border-slate-800 flex items-center justify-center",
                isDoor ? "p-6 lg:p-10" : ""
             )}>
               {activeImage ? (
                 <Image 
                   src={activeImage} 
                   alt={productName} 
                   fill 
                   className={cn(
                     "transition-transform duration-1000 group-hover:scale-105",
                     isDoor ? "object-contain p-2" : "object-cover"
                   )}
                 />
               ) : (
                 <div className="flex flex-col items-center gap-4 opacity-20">
                    <ImageIcon className="w-16 h-16 dark:text-white" />
                    <span className="font-black uppercase tracking-widest text-xs dark:text-white">Нет фото</span>
                 </div>
               )}
             </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 lg:gap-3">
                 {product.images.map((img: string, i: number) => (
                   <div 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl lg:rounded-2xl border transition-all cursor-pointer overflow-hidden relative flex items-center justify-center",
                      activeImage === img ? "border-[#2c3b6e] dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30" : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                      isDoor ? "p-2" : ""
                    )}
                   >
                      <Image src={img} alt={`Thumb ${i}`} fill className={cn(isDoor ? "object-contain p-1" : "object-cover", activeImage === img ? "opacity-100" : "opacity-60 hover:opacity-100")} />
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Info Zone */}
          <div className="lg:col-span-6 flex flex-col pt-0 lg:pt-1">
             <div className="mb-4 lg:mb-6">
               <div className="inline-flex items-center gap-2 mb-2 lg:mb-3">
                  <span className="text-[8px] lg:text-[9px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest">{product.brand || "MAFF"}</span>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{product.country || "Европа"}</span>
               </div>
               <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter mb-3 lg:mb-4">
                 {productName}
               </h1>
               
               <div className="relative">
                 <div 
                   className={cn(
                    "text-slate-600 dark:text-slate-400 text-[10px] lg:text-xs font-medium leading-relaxed max-w-xl transition-all duration-700 overflow-hidden relative",
                    isDescriptionExpanded ? "max-h-[2000px] mb-4" : "max-h-[80px] lg:max-h-[100px]"
                   )}
                 >
                   {formatDescription(product.description || "Описание товара временно отсутствует.")}
                 </div>
                 {!isDescriptionExpanded && product.description && product.description.length > 100 && (
                   <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent pointer-events-none" />
                 )}
               </div>
               {product.description && product.description.length > 100 && (
                 <button 
                   onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                   className="mt-3 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-2 group/btn"
                 >
                   <span className="border-b-2 border-current">{isDescriptionExpanded ? "Свернуть описание" : "Развернуть полностью"}</span>
                   <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", isDescriptionExpanded ? "rotate-180" : "rotate-0")} />
                 </button>
               )}
             </div>

            <div className="space-y-3 lg:space-y-4">
               {/* Price Area */}
               <div className="flex items-center gap-4 lg:gap-8 py-3 lg:py-4 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                     <span className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-0.5 lg:mb-1">Цена за м.кв.</span>
                     <span className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                        {formatPrice(product.price)} <span className="text-xs lg:text-sm font-bold text-slate-400 dark:text-slate-600">сум</span>
                     </span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-blue-100 dark:border-blue-900/30">
                     <p className="text-[7px] lg:text-[8px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest leading-none">
                        Рассрочка без переплат
                     </p>
                  </div>
               </div>

               {/* Calculator */}
               <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 lg:p-4 border border-slate-100 dark:border-slate-800">
                     <label className="text-[8px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 lg:mb-3">Площадь, м2</label>
                     <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg lg:rounded-xl p-0.5 lg:p-1 border border-slate-100 dark:border-slate-700">
                        <button onClick={() => setArea(Math.max(1, area - 1))} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Minus className="w-3 h-3" /></button>
                        <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} className="flex-grow bg-transparent text-center font-black text-xs lg:text-sm text-slate-900 dark:text-white outline-none" />
                        <button onClick={() => setArea(area + 1)} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Plus className="w-3 h-3" /></button>
                     </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 lg:p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                     <label className="text-[8px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-1">Итого упаковок</label>
                     <div className="text-sm lg:text-base font-black text-slate-900 dark:text-white tabular-nums">{packs} <span className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 uppercase ml-0.5">уп</span></div>
                  </div>
               </div>

               {/* Buttons */}
               <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-3">
                  <button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 h-11 lg:h-14 rounded-full flex items-center justify-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] dark:hover:bg-blue-50 transition-all active:scale-95">
                     <ShoppingBag className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                     В корзину
                  </button>
                  <button className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white h-11 lg:h-14 rounded-full flex items-center justify-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all active:scale-95">
                     <Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#2c3b6e] dark:text-blue-400" />
                     Купить
                  </button>
               </div>

               {/* Installment */}
               <div className="bg-white dark:bg-slate-800/40 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                     <div className="flex items-center gap-3 lg:gap-5">
                        {installmentPartners.map(p => (
                           <div key={p.name} className="relative w-8 h-4 lg:w-10 lg:h-5">
                              <Image src={p.logo} alt={p.name} fill className="object-contain" />
                           </div>
                        ))}
                     </div>
                     <span className="text-[8px] lg:text-[9px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest">Рассрочка</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 lg:gap-2 mb-4 lg:mb-6 border-b border-slate-50 dark:border-slate-800 pb-4 lg:pb-6 overflow-x-auto no-scrollbar">
                     {[3, 6, 12, 24].map(m => (
                        <button key={m} onClick={() => setInstallmentMonths(m)} className={cn("px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", installmentMonths === m ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}>
                           {m} мес
                        </button>
                     ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                     <div className="flex flex-col">
                        <span className="text-[7px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest mb-0.5 lg:mb-1">Платеж</span>
                        <span className="text-sm lg:text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                           {formatPrice(monthlyPayment)} <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">сум</span>
                        </span>
                     </div>
                     <div className="text-right flex flex-col">
                        <span className="text-[7px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest mb-0.5 lg:mb-1">Итого</span>
                        <span className="text-sm lg:text-xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                           {formatPrice(totalPrice)} <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">сум</span>
                        </span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs Section ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8 border-t border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-6 lg:gap-8 mb-6 lg:mb-8 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800">
            {tabs.map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("text-[8px] lg:text-[10px] font-black uppercase tracking-widest pb-3 lg:pb-4 transition-all relative whitespace-nowrap", activeTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#2c3b6e] dark:bg-blue-500 rounded-full" />}
               </button>
            ))}
         </div>

         <div className="max-w-3xl">
            {activeTab === "description" && (
               <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] lg:text-sm leading-relaxed opacity-80 prose prose-slate dark:prose-invert">
                    {formatDescription(product.description || "Нет дополнительного описания.")}
                  </div>
               </div>
            )}

            {activeTab === "specs" && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 lg:gap-y-4 animate-in fade-in duration-500">
                  {[
                     { l: "Бренд", v: product.brand || "MAFF" },
                     { l: "Страна производства", v: product.country || "Европа" },
                     { l: "Класс износостойкости", v: product.grade || "Premium" },
                     { l: "Толщина", v: product.thickness || "8 мм" },
                     { l: "Артикул / SKU", v: product.sku || "-" },
                     { l: "Ед. измерения", v: product.unit || "м.кв." },
                  ].map(s => (
                     <div key={s.l} className="flex items-center justify-between py-2 lg:py-3 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{s.l}</span>
                        <span className="text-[9px] lg:text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase">{s.v}</span>
                     </div>
                  ))}
               </div>
            )}

            {activeTab === "delivery" && (
               <div className="space-y-4 lg:space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-6">
                     <div className="p-4 lg:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 lg:gap-4">
                        <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-[#2c3b6e] dark:text-blue-500 flex-shrink-0" />
                        <div>
                           <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2 dark:text-white">Доставка</h4>
                           <p className="text-slate-600 dark:text-slate-400 text-[10px] lg:text-xs leading-relaxed opacity-80">Бесплатно при заказе от 5 млн сум по Ташкенту.</p>
                        </div>
                     </div>
                     <div className="p-4 lg:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 lg:gap-4">
                        <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#2c3b6e] dark:text-blue-500 flex-shrink-0" />
                        <div>
                           <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1 lg:mb-2 dark:text-white">Гарантия</h4>
                           <p className="text-slate-600 dark:text-slate-400 text-[10px] lg:text-xs leading-relaxed opacity-80">Официальная гарантия от производителя.</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </section>

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-16 border-t border-slate-50 dark:border-slate-800">
           <div className="flex items-center justify-between mb-8 lg:mb-12">
              <div>
                 <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 lg:mb-2">Похожие товары</h2>
                 <p className="text-slate-400 dark:text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Вам также может понравиться</p>
              </div>
              <Link href="/outlet" className="group flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                 Смотреть все
                 <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
              {similarProducts.map((p) => (
                 <div key={p.id} className="relative group h-full">
                    <ProductCard 
                      id={p.id}
                      title={p.name}
                      price={p.price || 0}
                      image={p.image_url || ""}
                      brand={p.brand || "MAFF"}
                      country={p.country || "Европа"}
                      grade={p.grade || "Premium"}
                      thickness={p.thickness || "8мм"}
                      inStock={p.stock > 0}
                    />
                 </div>
              ))}
           </div>
        </section>
      )}
    </div>
  );
}

