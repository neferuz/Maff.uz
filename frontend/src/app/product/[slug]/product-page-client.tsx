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
  MapPin,
  ArrowRight,
  Zap,
  Award,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/ui/product-card";
import { getProductUnit } from "@/lib/units";

export default function ProductPageClient({ params }: { params: { slug: string } }) {
  // ── State ──
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isAccessories, setIsAccessories] = useState(false);
  const [accessoriesTitle, setAccessoriesTitle] = useState("С этим товаром покупают");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [area, setArea] = useState(1);
  const [packs, setPacks] = useState(1);
  const [waste, setWaste] = useState(0); // percentage
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [installmentData, setInstallmentData] = useState<any>({
    partners: [
      { name: "alif", logo: "https://s3.fortifai.uz/shop/rand/ce/b1/c5/ceb1c58c-7454-4d16-ad6a-c1f11cea9965.jpg" },
      { name: "uzum", logo: "https://api.logobank.uz/media/logos_png/Uzum_Nasiya-01.png" },
      { name: "anor", logo: "https://pultop.uz/wp-content/uploads/2024/07/anor-320.png" },
    ],
    months: [3, 6, 12, 24]
  });

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Door Calculator States
  const [accessories, setAccessories] = useState<{ color: string; boxes: any[]; trims: any[] }>({ color: "", boxes: [], trims: [] });
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedTrim, setSelectedTrim] = useState<any>(null);
  const [includeBox, setIncludeBox] = useState(false);
  const [includeTrim, setIncludeTrim] = useState(false);
  const [doorQuantity, setDoorQuantity] = useState(1);
  const [isBoxSelectOpen, setIsBoxSelectOpen] = useState(false);
  const [isTrimSelectOpen, setIsTrimSelectOpen] = useState(false);

  // ── Fetch Data ──
  useEffect(() => {
    const fetchInstallment = async () => {
      try {
        const res = await fetch("/api/v1/pages/installment?t=" + Date.now() + "");
        if (res.ok) {
          const result = await res.json();
          if (result.content) {
            const c = result.content;
            if (!c.months || !Array.isArray(c.months)) {
              c.months = [3, 6, 12, 24];
            }
            if (!c.partners || !Array.isArray(c.partners)) {
              c.partners = [];
            }
            setInstallmentData(c);
            if (c.months.length > 0) {
              setInstallmentMonths(c.months[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch installment configuration", e);
      }
    };
    fetchInstallment();

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
          pricePerM2: data.price_outlet || data.price || 0,
        };
        
        setProduct(enrichedProduct);
        setActiveImage(data.image_url || (data.images && data.images[0]) || null);

        // Fetch similar products or accessories
        if (data.category_id) {
          try {
            const catRes = await fetch(`/api/v1/categories`);
            if (catRes.ok) {
              const categoriesData = await catRes.json();
              setCategories(categoriesData);
              const cat = categoriesData.find((c: any) => c.id === data.category_id);
              if (cat) {
                // Traverse up parent categories to find the first configured recommended_accessories
                let recs = null;
                let recCat = cat;
                const recVisited = new Set();
                while (recCat && !recVisited.has(recCat.id)) {
                  recVisited.add(recCat.id);
                  const r = recCat.recommended_accessories;
                  const hasR = r && (
                    (r.category_ids && r.category_ids.length > 0) ||
                    (r.product_ids && r.product_ids.length > 0)
                  );
                  if (hasR) {
                    recs = r;
                    break;
                  }
                  if (recCat.parent_id) {
                    recCat = categoriesData.find((c: any) => c.id === recCat.parent_id);
                  } else {
                    break;
                  }
                }

                const hasAccs = recs !== null;
                if (hasAccs && recs) {
                  const catFetchPromises = (recs.category_ids || []).map((cid: number) => 
                    fetch(`/api/v1/products?category_id=${cid}&limit=6`)
                  );
                  const prodFetchPromises = (recs.product_ids || []).map((pid: number) => 
                    fetch(`/api/v1/products/${pid}`)
                  );
                  const [catResponses, prodResponses] = await Promise.all([
                    Promise.all(catFetchPromises),
                    Promise.all(prodFetchPromises)
                  ]);
                  
                  const accList: any[] = [];
                  for (const res of prodResponses) {
                    if (res.ok) {
                      accList.push(await res.json());
                    }
                  }
                  for (const res of catResponses) {
                    if (res.ok) {
                      const prods = await res.json();
                      accList.push(...prods);
                    }
                  }
                  
                  // Filter out duplicates and current product
                  const seen = new Set();
                  const uniqueAccs = accList.filter((p: any) => {
                    if (!p || p.id === data.id || seen.has(p.id)) return false;
                    seen.add(p.id);
                    return true;
                  });
                  
                  if (uniqueAccs.length > 0) {
                    setSimilarProducts(uniqueAccs.slice(0, 4));
                    setIsAccessories(true);
                    setAccessoriesTitle(recs.title || "С этим товаром покупают");
                  } else {
                    // Fallback to similar products
                    const simRes = await fetch(`/api/v1/products?category_id=${data.category_id}&limit=5`);
                    if (simRes.ok) {
                      const simData = await simRes.json();
                      setSimilarProducts(simData.filter((p: any) => p.id !== data.id).slice(0, 4));
                    }
                    setIsAccessories(false);
                  }
                } else {
                  // Fallback: Fetch similar products in same category
                  const simRes = await fetch(`/api/v1/products?category_id=${data.category_id}&limit=5`);
                  if (simRes.ok) {
                    const simData = await simRes.json();
                    setSimilarProducts(simData.filter((p: any) => p.id !== data.id).slice(0, 4));
                  }
                  setIsAccessories(false);
                }

                let currentCat = cat;
                let isOrderOnly = cat.is_order_only || false;
                let isPreorder = cat.is_preorder || false;
                let pricePrefix = cat.price_prefix || "";
                let orderLink = cat.order_link || "";
                
                const visited = new Set();
                while (currentCat && currentCat.parent_id && !visited.has(currentCat.id)) {
                  visited.add(currentCat.id);
                  const parent = categoriesData.find((c: any) => c.id === currentCat.parent_id);
                  if (parent) {
                    if (parent.is_order_only) {
                      isOrderOnly = true;
                    }
                    if (parent.is_preorder) {
                      isPreorder = true;
                    }
                    if (!pricePrefix && parent.price_prefix) {
                      pricePrefix = parent.price_prefix;
                    }
                    if (!orderLink && parent.order_link) {
                      orderLink = parent.order_link;
                    }
                    currentCat = parent;
                  } else {
                    break;
                  }
                }
                
                const enrichedCat = {
                  ...cat,
                  is_order_only: isOrderOnly,
                  is_preorder: isPreorder,
                  price_prefix: pricePrefix,
                  order_link: orderLink
                };
                setProduct((prev: any) => ({ ...prev, category: enrichedCat }));
              }
            }
          } catch (e) {
            console.error("Failed to fetch category/similar", e);
          }
        }

        // If it is a door, fetch matching accessories by color
        const productNameLower = data.name.toLowerCase();
        const productBrandLower = (data.brand || "").toLowerCase();
        const doorBrands = ['portika', 'zadoor', 'profildoors', 'волховец', 'volkhovets', 'filomuro'];
        const doorKeywords = ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'];
        const isProductDoor = doorKeywords.some(k => productNameLower.includes(k)) ||
                              doorBrands.some(b => productBrandLower.includes(b));
                              
        if (isProductDoor) {
          try {
            const accRes = await fetch(`/api/v1/products/${data.id}/accessories`);
            if (accRes.ok) {
              const accData = await accRes.json();
              setAccessories(accData);
              if (accData.boxes && accData.boxes.length > 0) {
                setSelectedBox(accData.boxes[0]);
              }
              if (accData.trims && accData.trims.length > 0) {
                setSelectedTrim(accData.trims[0]);
              }
            }
          } catch (err) {
            console.error("Failed to fetch door accessories", err);
          }
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.slug]);

  const productName = product?.name || "Товар без названия";
  const productBrand = (product?.brand || "").toLowerCase();
  const doorBrands = ['portika', 'zadoor', 'profildoors', 'волховец', 'volkhovets', 'filomuro'];
  const doorKeywords = ['двер', 'door', 'классико', 'порта', 'centro', 'неоклассико'];
  const isDoor = product ? (
    doorKeywords.some(k => productName.toLowerCase().includes(k)) ||
    doorBrands.some(b => productBrand.includes(b))
  ) : false;
  // Kit calculator (box + trim) only for these brands
  const hasKitCalculator = isDoor && !['волховец', 'volkhovets'].some(b => productBrand.includes(b));
  const unit = product ? (isDoor ? "шт" : getProductUnit(productName, product.category?.name || "")) : "м²";

  // ── Calculations ──
  useEffect(() => {
    if (!product) return;
    if (unit === "шт") {
      setPacks(area);
    } else {
      const packSize = product.packSize || 2.13;
      const areaWithWaste = area * (1 + waste / 100);
      const neededPacks = Math.ceil(areaWithWaste / packSize);
      setPacks(neededPacks);
    }
  }, [area, waste, product, unit]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
             <div className="lg:col-span-6 w-full aspect-square bg-slate-100 dark:bg-slate-900 animate-pulse rounded-[2rem]" />
             <div className="lg:col-span-6 space-y-6 animate-pulse">
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
             </div>
          </div>
        </div>
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

  const doorLeafPrice = product.price_outlet || product.price || 0;
  const boxPrice = (includeBox && selectedBox) ? (selectedBox.price || 0) : (accessories.boxes && accessories.boxes.length > 0 ? accessories.boxes[0].price : 0);
  const trimPrice = (includeTrim && selectedTrim) ? (selectedTrim.price || 0) : (accessories.trims && accessories.trims.length > 0 ? accessories.trims[0].price : 0);

  const packSize = product.packSize;
  const pricePerM2 = product.pricePerM2;
  const totalArea = packs * packSize;
  const totalPrice = isDoor 
    ? (doorLeafPrice + (includeBox ? boxPrice * 3 : 0) + (includeTrim ? trimPrice * 3 : 0)) * doorQuantity
    : (unit === "шт" ? area * pricePerM2 : totalArea * pricePerM2);
  const monthlyPayment = totalPrice / installmentMonths;

  

  const formatPrice = (num: any) => {
    const val = Number(num || 0);
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Extract color from product name
  const extractColor = (name: string): string | null => {
    if (!name) return null;
    const lower = name.toLowerCase();
    const colorMap: Record<string, string[]> = {
      "Белый": ["белый", "белая эмаль", "white"],
      "Серый": ["серый", "серая", "grey", "gray"],
      "Кремовый": ["кремовый", "крем", "cream"],
      "Графит": ["графит", "graphite"],
      "Орех": ["орех", "ореховый", "walnut"],
      "Дуб": ["дуб", "дубовый", "oak"],
      "Бетон": ["бетон", "concrete"],
      "Нордик": ["нордик", "nordic"],
      "Сканди": ["сканди", "scandi"],
      "Бренди": ["бренди", "brandy"],
      "Чёрный": ["чёрный", "черный", "black"],
      "Бежевый": ["бежевый", "beige"],
      "Молочный": ["молочный", "milky"],
      "Антрацит": ["антрацит", "anthracite"],
      "Деним": ["деним", "denim"],
      "Айвори": ["айвори", "ivory"],
      "Мелон": ["мелон", "melon"],
      "Опал": ["опал", "opal"],
      "Сатинато": ["сатинато", "satinato"],
      "Перламутровый": ["перламутровый", "pearlescent", "жемчужно-перламутровый"],
      "Аляска": ["аляска", "alaska"],
      "Праймер": ["праймер", "primer"],
      "Natural Oak": ["natural oak"],
      "Alpik Oak": ["alpik oak"],
    };
    for (const [colorName, keywords] of Object.entries(colorMap)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) return colorName;
      }
    }
    return null;
  };

  const productColor = extractColor(productName);

  // installmentPartners loaded dynamically from installmentData.partners

  const tabs = [
    { id: "description", label: "Описание" },
    { id: "specs", label: "Характеристики" },
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

  const isOrderOnly = product.category?.is_order_only || false;
  const isPreorder = product.category?.is_preorder || false;
  const pricePrefix = product.category?.price_prefix || "";
  const orderLink = product.category?.order_link || "https://t.me/maff_uz";

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* ── Main Section ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-start">
          
          {/* Visuals */}
          <div className="lg:col-span-6 space-y-3 lg:sticky lg:top-[180px]">
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
             {/* ── Breadcrumbs ── */}
             <nav className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400 mb-4 flex-wrap">
               <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Главная</Link>
               <ChevronRight className="w-2.5 h-2.5 opacity-40" />
               <Link href="/catalog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Каталог</Link>
               {product.category && (
                 <>
                   <ChevronRight className="w-2.5 h-2.5 opacity-40" />
                   <Link href={`/catalog?category=${product.category.id}`} className="hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-[150px]">{product.category.name}</Link>
                 </>
               )}
               <ChevronRight className="w-2.5 h-2.5 opacity-40" />
               <span className="text-slate-900 dark:text-slate-200 truncate max-w-[200px]">{productName}</span>
             </nav>

             <div className="mb-4 lg:mb-6">
               <div className="inline-flex items-center gap-2 mb-2 lg:mb-3 flex-wrap">
                  <span className="text-[8px] lg:text-[9px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest">{product.brand || "MAFF"}</span>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <span className="text-[8px] lg:text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{product.country || "Европа"}</span>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  
                  {/* Dynamic 1C Stock Status */}
                  {(product.stock && product.stock > 0) ? (
                    <span className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      В наличии
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                      Нет в наличии
                    </span>
                  )}

                  {/* Mode indicators (Preorder/OrderOnly) */}
                  {isPreorder && (
                    <>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                        Под заказ
                      </span>
                    </>
                  )}
                  {isOrderOnly && (
                    <>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                        Заказать
                      </span>
                    </>
                  )}
                  {productColor && (
                    <>
                      <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <span className="inline-flex items-center gap-1.5 text-[8px] lg:text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                        <span className="w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-600"
                          style={{
                            backgroundColor:
                              productColor === "Белый" ? "#ffffff" :
                              productColor === "Серый" ? "#6b7280" :
                              productColor === "Кремовый" ? "#f5f5dc" :
                              productColor === "Графит" ? "#374151" :
                              productColor === "Орех" ? "#8b5a2b" :
                              productColor === "Дуб" ? "#a0522d" :
                              productColor === "Бетон" ? "#9ca3af" :
                              productColor === "Нордик" ? "#d1d5db" :
                              productColor === "Сканди" ? "#e5e7eb" :
                              productColor === "Бренди" ? "#b45309" :
                              productColor === "Чёрный" ? "#000000" :
                              productColor === "Бежевый" ? "#d2b48c" :
                              productColor === "Молочный" ? "#fffdd0" :
                              productColor === "Антрацит" ? "#1f2937" :
                              productColor === "Деним" ? "#1560bd" :
                              productColor === "Айвори" ? "#fffff0" :
                              productColor === "Мелон" ? "#fdbcb4" :
                              productColor === "Опал" ? "#f0f8ff" :
                              productColor === "Сатинато" ? "#e2e8f0" :
                              productColor === "Перламутровый" ? "#f0f0f0" :
                              productColor === "Аляска" ? "#f8fafc" :
                              productColor === "Праймер" ? "#e2e2e2" :
                              productColor === "Natural Oak" ? "#c4a35a" :
                              productColor === "Alpik Oak" ? "#b8956a" :
                              "#cbd5e1"
                          }}
                        />
                        {productColor}
                      </span>
                    </>
                  )}
               </div>
               <h1 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter mb-2 lg:mb-3">
                 {productName}
               </h1>

               {/* Color swatch */}
               {productColor && (
                 <div className="flex items-center gap-2 mb-3 lg:mb-4">
                   <span className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Цвет:</span>
                   <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1">
                     <span 
                       className="w-4 h-4 rounded-sm border border-slate-300 dark:border-slate-600 inline-block"
                       style={{
                         backgroundColor:
                           productColor === "Белый" ? "#ffffff" :
                           productColor === "Серый" ? "#6b7280" :
                           productColor === "Кремовый" ? "#f5f5dc" :
                           productColor === "Графит" ? "#374151" :
                           productColor === "Орех" ? "#8b5a2b" :
                           productColor === "Дуб" ? "#a0522d" :
                           productColor === "Бетон" ? "#9ca3af" :
                           productColor === "Нордик" ? "#d1d5db" :
                           productColor === "Сканди" ? "#e5e7eb" :
                           productColor === "Бренди" ? "#b45309" :
                           productColor === "Чёрный" ? "#000000" :
                           productColor === "Бежевый" ? "#d2b48c" :
                           productColor === "Молочный" ? "#fffdd0" :
                           productColor === "Антрацит" ? "#1f2937" :
                           productColor === "Деним" ? "#1560bd" :
                           productColor === "Айвори" ? "#fffff0" :
                           productColor === "Мелон" ? "#fdbcb4" :
                           productColor === "Опал" ? "#f0f8ff" :
                           productColor === "Сатинато" ? "#e2e8f0" :
                           productColor === "Перламутровый" ? "#f0f0f0" :
                           productColor === "Аляска" ? "#f8fafc" :
                           productColor === "Праймер" ? "#e2e2e2" :
                           productColor === "Natural Oak" ? "#c4a35a" :
                           productColor === "Alpik Oak" ? "#b8956a" :
                           "#cbd5e1"
                       }}
                     />
                     <span className="text-[10px] lg:text-xs font-black text-slate-900 dark:text-white">{productColor}</span>
                   </div>
                 </div>
               )}
               
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
                     <span className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-0.5 lg:mb-1">Цена</span>
                     <span className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                        {isOrderOnly && pricePrefix && <span className="text-sm lg:text-base mr-1 opacity-80">{pricePrefix}</span>}
                        {product.price_outlet ? (
                          <span className="inline-flex items-center gap-2 flex-wrap">
                            <span className="text-[#e11d48] dark:text-rose-400">
                              {formatPrice(product.price_outlet)}
                            </span>
                            <span className="text-xs lg:text-sm font-bold text-slate-400 line-through">{formatPrice(product.price)}</span>
                            <span className="bg-rose-500 text-white text-[7px] lg:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-sm">
                              -{Math.round(((product.price - product.price_outlet) / product.price) * 100)}%
                            </span>
                          </span>
                        ) : (
                          <>{formatPrice(product.price)}</>
                        )}{" "}
                        <span className="text-xs lg:text-sm font-bold text-slate-400 dark:text-slate-600">сум</span>
                     </span>
                  </div>
                  {(isOrderOnly || isPreorder) && (
                    <div className="bg-[#2c3b6e]/10 dark:bg-blue-900/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-[#2c3b6e]/20 dark:border-blue-800/40">
                       <p className="text-[7px] lg:text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest leading-none">
                          {isPreorder ? "Под заказ" : "Заказать"}
                       </p>
                    </div>
                  )}
               </div>

               {/* Calculator */}
               {hasKitCalculator ? (
                 <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 lg:p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                       <span className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Калькулятор комплекта</span>
                       <span className="text-[8px] font-black text-[#2c3b6e] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Двери</span>
                    </div>

                    {/* Door Quantity Selector */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                       <div className="flex flex-col">
                          <span className="text-[8px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest leading-none">Количество дверей</span>
                          <span className="text-[8px] font-bold text-slate-400 mt-1">Полотно: {doorQuantity} шт.</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-100 dark:border-slate-700">
                          <button onClick={() => setDoorQuantity(Math.max(1, doorQuantity - 1))} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Minus className="w-3 h-3" /></button>
                          <input type="number" value={doorQuantity} onChange={(e) => setDoorQuantity(Math.max(1, Number(e.target.value)))} className="w-8 bg-transparent text-center font-black text-xs text-slate-900 dark:text-white outline-none" />
                          <button onClick={() => setDoorQuantity(doorQuantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Plus className="w-3 h-3" /></button>
                       </div>
                    </div>

                    {/* Accessories Checkboxes & Selectors */}
                    <div className="space-y-2.5">
                       {/* 1. Box / Коробка */}
                       <div className={cn(
                          "p-3 rounded-xl border transition-all flex flex-col gap-2 bg-white dark:bg-slate-900",
                          includeBox ? "border-slate-300 dark:border-slate-700" : "border-slate-100 dark:border-slate-800 opacity-80"
                       )}>
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                             <input 
                               type="checkbox" 
                               checked={includeBox} 
                               onChange={(e) => setIncludeBox(e.target.checked)}
                               className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-3.5 h-3.5"
                             />
                             <div className="flex-grow flex justify-between items-center">
                                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Дверной короб (3 шт.)</span>
                                <span className="text-[9px] font-bold text-slate-500 tabular-nums">
                                   +{formatPrice(boxPrice * 3)} сум
                                </span>
                             </div>
                          </label>
                          
                          {includeBox && accessories.boxes && accessories.boxes.length > 0 && (
                             <div className="relative mt-1">
                                <button 
                                   type="button"
                                   onClick={() => setIsBoxSelectOpen(!isBoxSelectOpen)}
                                   className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-300"
                                >
                                   <div className="flex flex-col gap-1 pr-4">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-850 dark:text-slate-200 leading-tight">
                                         {selectedBox?.name || "Выберите короб"}
                                      </span>
                                      {selectedBox?.sku && (
                                         <span className="text-[7px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
                                            Артикул: {selectedBox.sku}
                                         </span>
                                      )}
                                   </div>
                                   <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">
                                         {formatPrice(selectedBox?.price || 0)} сум/шт
                                      </span>
                                      <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", isBoxSelectOpen ? "rotate-180" : "")} />
                                   </div>
                                </button>
                                
                                {isBoxSelectOpen && (
                                   <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl z-[100] max-h-60 overflow-y-auto no-scrollbar py-2">
                                      {accessories.boxes.map((b: any) => (
                                         <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => {
                                               setSelectedBox(b);
                                               setIsBoxSelectOpen(false);
                                            }}
                                            className={cn(
                                               "w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-200 border-b border-slate-50 dark:border-slate-900/40 last:border-0",
                                               selectedBox?.id === b.id 
                                                  ? "bg-slate-50 dark:bg-slate-900/60 text-[#2c3b6e] dark:text-blue-400 font-bold" 
                                                  : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300"
                                            )}
                                         >
                                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                                               <span className="text-[9px] font-black uppercase tracking-wider leading-tight">
                                                  {b.name}
                                               </span>
                                               {b.sku && (
                                                  <span className="text-[6.5px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                                     Артикул: {b.sku}
                                                  </span>
                                               )}
                                            </div>
                                            <span className="text-[9px] font-black tabular-nums">
                                               {formatPrice(b.price)} сум
                                            </span>
                                         </button>
                                      ))}
                                   </div>
                                )}
                             </div>
                          )}
                          
                          {includeBox && (!accessories.boxes || accessories.boxes.length === 0) && (
                             <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 italic">
                                Стандартный короб для {accessories.color || "этого цвета"} (234 000 сум/шт)
                             </div>
                          )}
                       </div>

                       {/* 2. Trim / Наличники */}
                       <div className={cn(
                          "p-3 rounded-xl border transition-all flex flex-col gap-2 bg-white dark:bg-slate-900",
                          includeTrim ? "border-slate-300 dark:border-slate-700" : "border-slate-100 dark:border-slate-800 opacity-80"
                       )}>
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                             <input 
                               type="checkbox" 
                               checked={includeTrim} 
                               onChange={(e) => setIncludeTrim(e.target.checked)}
                               className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-3.5 h-3.5"
                             />
                             <div className="flex-grow flex justify-between items-center">
                                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Наличники (3 шт.)</span>
                                <span className="text-[9px] font-bold text-slate-500 tabular-nums">
                                   +{formatPrice(trimPrice * 3)} сум
                                </span>
                             </div>
                          </label>
                          
                          {includeTrim && accessories.trims && accessories.trims.length > 0 && (
                             <div className="relative mt-1">
                                <button 
                                   type="button"
                                   onClick={() => setIsTrimSelectOpen(!isTrimSelectOpen)}
                                   className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-300"
                                >
                                   <div className="flex flex-col gap-1 pr-4">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-855 dark:text-slate-200 leading-tight">
                                         {selectedTrim?.name || "Выберите наличник"}
                                      </span>
                                      {selectedTrim?.sku && (
                                         <span className="text-[7px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">
                                            Артикул: {selectedTrim.sku}
                                         </span>
                                      )}
                                   </div>
                                   <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">
                                         {formatPrice(selectedTrim?.price || 0)} сум/шт
                                      </span>
                                      <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", isTrimSelectOpen ? "rotate-180" : "")} />
                                   </div>
                                </button>
                                
                                {isTrimSelectOpen && (
                                   <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl z-[100] max-h-60 overflow-y-auto no-scrollbar py-2">
                                      {accessories.trims.map((t: any) => (
                                         <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => {
                                               setSelectedTrim(t);
                                               setIsTrimSelectOpen(false);
                                            }}
                                            className={cn(
                                               "w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-200 border-b border-slate-50 dark:border-slate-900/40 last:border-0",
                                               selectedTrim?.id === t.id 
                                                  ? "bg-slate-50 dark:bg-slate-900/60 text-[#2c3b6e] dark:text-blue-400 font-bold" 
                                                  : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300"
                                            )}
                                         >
                                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                                               <span className="text-[9px] font-black uppercase tracking-wider leading-tight">
                                                  {t.name}
                                               </span>
                                               {t.sku && (
                                                  <span className="text-[6.5px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                                     Артикул: {t.sku}
                                                  </span>
                                               )}
                                            </div>
                                            <span className="text-[9px] font-black tabular-nums">
                                               {formatPrice(t.price)} сум
                                            </span>
                                         </button>
                                      ))}
                                   </div>
                                )}
                             </div>
                          )}
                          
                          {includeTrim && (!accessories.trims || accessories.trims.length === 0) && (
                             <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 italic">
                                Стандартный наличник для {accessories.color || "этого цвета"} (143 000 сум/шт)
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
               ) : (
                  <div className={cn("grid gap-2 lg:gap-3", unit === "шт" ? "grid-cols-1" : "grid-cols-2")}>
                     <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 lg:p-4 border border-slate-100 dark:border-slate-800">
                        <label className="text-[8px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-2 lg:mb-3">
                           {unit === "шт" ? "Количество" : "Площадь"}
                        </label>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg lg:rounded-xl p-0.5 lg:p-1 border border-slate-100 dark:border-slate-700">
                           <button onClick={() => setArea(Math.max(1, area - 1))} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Minus className="w-3 h-3" /></button>
                           <input type="number" value={area} onChange={(e) => setArea(Number(e.target.value))} className="flex-grow bg-transparent text-center font-black text-xs lg:text-sm text-slate-900 dark:text-white outline-none" />
                           <button onClick={() => setArea(area + 1)} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"><Plus className="w-3 h-3" /></button>
                        </div>
                     </div>
                     {unit !== "шт" && (
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 lg:p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                           <label className="text-[8px] lg:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest block mb-1">Итого упаковок</label>
                           <div className="text-sm lg:text-base font-black text-slate-900 dark:text-white tabular-nums">{packs} <span className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 uppercase ml-0.5">уп</span></div>
                        </div>
                     )}
                  </div>
               )}

               {/* Buttons */}
               {(isOrderOnly || isPreorder) ? (
                 <a href={orderLink} target="_blank" rel="noreferrer" className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 h-11 lg:h-14 rounded-full flex items-center justify-center gap-2 text-[10px] lg:text-[11px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] dark:hover:bg-blue-50 transition-all active:scale-95">
                    {isPreorder && !isOrderOnly ? "Под заказ" : "Заказать"}
                    <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                 </a>
               ) : (
                 <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-3">
                    <button 
                      disabled={!(product.stock && product.stock > 0)}
                      className={cn(
                        "h-11 lg:h-14 rounded-full flex items-center justify-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all",
                        (product.stock && product.stock > 0)
                          ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-slate-900 hover:bg-[#2c3b6e] dark:hover:bg-blue-50 active:scale-95 cursor-pointer"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      )}
                    >
                       <ShoppingBag className={cn("w-3 h-3 lg:w-3.5 lg:h-3.5", (product.stock && product.stock > 0) ? "" : "text-slate-400 dark:text-slate-500")} />
                       {(product.stock && product.stock > 0) ? "В корзину" : "Нет на складе"}
                    </button>
                    <button 
                      disabled={!(product.stock && product.stock > 0)}
                      className={cn(
                        "h-11 lg:h-14 rounded-full flex items-center justify-center gap-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all",
                        (product.stock && product.stock > 0)
                          ? "bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 active:scale-95 cursor-pointer"
                          : "bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                      )}
                    >
                       <Zap className={cn("w-3 h-3 lg:w-3.5 lg:h-3.5", (product.stock && product.stock > 0) ? "text-[#2c3b6e] dark:text-blue-400" : "text-slate-300 dark:text-slate-600")} />
                       Купить
                    </button>
                 </div>
               )}

               {/* Installment */}
               {true && (
                 <div className="bg-white dark:bg-slate-800/40 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                     <div className="flex items-center gap-3 lg:gap-5">
                        {installmentData.partners.map((p: any) => (
                           <div key={p.name} className="relative w-8 h-4 lg:w-10 lg:h-5">
                              <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
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
               )}
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
                  {(() => {
                    const specs: { l: string; v: string }[] = [];
                    if (product.specifications && typeof product.specifications === 'object') {
                      Object.entries(product.specifications).forEach(([key, value]) => {
                        specs.push({ l: key, v: String(value || "-") });
                      });
                    }
                    if (!specs.find(s => s.l === "Бренд") && product.brand) {
                      specs.unshift({ l: "Бренд", v: product.brand });
                    }
                    if (!specs.find(s => s.l === "Страна производства") && product.country) {
                      specs.unshift({ l: "Страна производства", v: product.country });
                    }
                    if (!specs.find(s => s.l === "Артикул / SKU") && product.sku) {
                      specs.push({ l: "Артикул / SKU", v: product.sku });
                    }
                    if (specs.length === 0) {
                      specs.push(
                        { l: "Бренд", v: product.brand || "MAFF" },
                        { l: "Страна производства", v: product.country || "Европа" },
                        { l: "Класс износостойкости", v: product.grade || "Premium" },
                        { l: "Толщина", v: product.thickness || "8 мм" },
                        { l: "Артикул / SKU", v: product.sku || "-" }
                      );
                    }
                    return specs.map(s => (
                      <div key={s.l} className="flex items-center justify-between py-2 lg:py-3 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-[8px] lg:text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">{s.l}</span>
                        <span className="text-[9px] lg:text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase">{s.v}</span>
                      </div>
                    ));
                  })()}
               </div>
            )}


         </div>
      </section>

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-16 border-t border-slate-50 dark:border-slate-800">
           <div className="flex items-center justify-between mb-8 lg:mb-12">
              <div>
                 <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 lg:mb-2">
                    {isAccessories ? accessoriesTitle : "Похожие товары"}
                 </h2>
                 <p className="text-slate-400 dark:text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
                    {isAccessories ? "Рекомендуемые сопутствующие товары" : "Вам также может понравиться"}
                 </p>
              </div>
              <Link href="/outlet" className="group flex items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
                 Смотреть все
                 <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
              {similarProducts.map((p) => {
                 let simOrderOnly = false;
                 let simPreorder = false;
                 let simOrderLink = "";
                 let currentCat = categories.find((c: any) => c.id === p.category_id);
                 const visited = new Set();
                 while (currentCat && !visited.has(currentCat.id)) {
                   visited.add(currentCat.id);
                   if (currentCat.is_order_only) {
                     simOrderOnly = true;
                   }
                   if (currentCat.is_preorder) {
                     simPreorder = true;
                   }
                   if (!simOrderLink && currentCat.order_link) {
                     simOrderLink = currentCat.order_link;
                   }
                   if (currentCat.parent_id) {
                     currentCat = categories.find((c: any) => c.id === currentCat.parent_id);
                   } else {
                     break;
                   }
                 }
                 return (
                    <div key={p.id} className="relative group h-full">
                       <ProductCard 
                         id={p.id}
                         title={p.name}
                         price={p.price || 0}
                         priceOutlet={p.price_outlet ? Number(p.price_outlet) : undefined}
                         image={p.image_url || ""}
                         brand={p.brand || "MAFF"}
                         country={p.country || "Европа"}
                         grade={p.grade || "Premium"}
                         thickness={p.thickness || "8мм"}
                         inStock={p.stock > 0}
                         isOrderOnly={simOrderOnly}
                         isPreorder={simPreorder}
                         orderLink={simOrderLink}
                       />
                    </div>
                 );
              })}
           </div>
        </section>
      )}
    </div>
  );
}

