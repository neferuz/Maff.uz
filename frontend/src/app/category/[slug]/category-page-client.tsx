"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  ChevronRight, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ChevronDown,
  X,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/* ── Mock Data for Parquet ── */
const MOCK_PRODUCTS = [
  {
    id: 101,
    title: "Дуб Шампань Селект",
    country: "Беларусь",
    brand: "Coswick",
    grade: "Премиум",
    thickness: "15",
    price: "1 250 000",
    inStock: true,
    image: "/parquet_board_1_1777851685234.png"
  },
  {
    id: 102,
    title: "Орех Американский Натур",
    country: "США",
    brand: "Barlinek",
    grade: "Элит",
    thickness: "14",
    price: "1 890 000",
    inStock: true,
    image: "/parquet_board_2_1777851697616.png"
  },
  {
    id: 103,
    title: "Ясень Арктик Вайт",
    country: "Германия",
    brand: "Haro",
    grade: "Премиум",
    thickness: "13.5",
    price: "1 420 000",
    inStock: true,
    image: "/parquet_board_3_1777851710867.png"
  },
  {
    id: 104,
    title: "Дуб Классик Браш",
    country: "Польша",
    brand: "Barlinek",
    grade: "Стандарт",
    thickness: "14",
    price: "980 000",
    inStock: true,
    image: "/parquet_board_1_1777851685234.png"
  },
  {
    id: 105,
    title: "Дуб Антик Рустик",
    country: "Беларусь",
    brand: "Coswick",
    grade: "Рустик",
    thickness: "15",
    price: "1 150.000",
    inStock: false,
    image: "/parquet_board_2_1777851697616.png"
  },
  {
    id: 106,
    title: "Ясень Кофе Глосс",
    country: "Германия",
    brand: "Tarkett",
    grade: "Премиум",
    thickness: "14",
    price: "1 350 000",
    inStock: true,
    image: "/parquet_board_3_1777851710867.png"
  }
];

const FILTERS = {
  brands: ["Coswick", "Barlinek", "Haro", "Tarkett", "Quick-Step"],
  countries: ["Беларусь", "Германия", "Польша", "США", "Бельгия"],
  grades: ["Премиум", "Элит", "Стандарт", "Рустик"],
  thickness: ["12", "13.5", "14", "15"]
};

export default function CategoryPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Decode slug and format title
  const categoryTitle = decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Популярные");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch categories once on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const catRes = await fetch(`/api/v1/categories/?t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const currentCategory = useMemo(() => {
    if (!categories.length) return null;
    const cleanSlug = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ");
    return categories.find(c => c && c.name.toLowerCase().replace(/-/g, " ") === cleanSlug) || null;
  }, [categories, slug]);

  // Fetch products reactively when currentCategory changes
  useEffect(() => {
    if (!currentCategory) return;
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        const prodRes = await fetch(`/api/v1/products/?category_id=${currentCategory.id}&t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(Array.isArray(prodData) ? prodData : []);
        }
      } catch (err) {
        console.error("Failed to fetch products for category", err);
      } finally {
        setProductsLoading(false);
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategory]);

  // If categories are loaded but currentCategory couldn't be resolved, stop loading
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      setLoading(false);
      setProductsLoading(false);
    }
  }, [categories, currentCategory]);

  const getAllChildIds = (catId: number, cats: any[], depth = 0): number[] => {
    if (depth > 10) return [catId];
    const children = cats.filter(c => c && c.parent_id === catId);
    let ids = [catId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id, cats, depth + 1)];
    });
    return ids;
  };

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];
    const allRelatedIds = getAllChildIds(currentCategory.id, categories);
    return products.filter(p => p.category_id && allRelatedIds.includes(p.category_id));
  }, [currentCategory, categories, products]);

  const filteredProducts = useMemo(() => {
    let result = categoryProducts;
    if (activeFilters.length > 0) {
      result = result.filter(p => {
        const selectedBrands = activeFilters.filter(f => FILTERS.brands.includes(f));
        const selectedGrades = activeFilters.filter(f => FILTERS.grades.includes(f));
        const selectedThickness = activeFilters.filter(f => FILTERS.thickness.includes(f));
        
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (selectedGrades.length > 0 && !selectedGrades.includes(p.grade)) return false;
        if (selectedThickness.length > 0 && !selectedThickness.includes(p.thickness)) return false;
        
        return true;
      });
    }
    return result;
  }, [categoryProducts, activeFilters]);

  const mappedProducts = useMemo(() => {
    return filteredProducts.map(p => {
      const name = p.name || "Безымянный товар";
      const nameParts = name.split(' ');
      
      // Resolve category order-only/preorder recursively
      let isOrderOnly = false;
      let isPreorder = false;
      let orderLink = "";
      let currentCat = categories.find(c => c.id === p.category_id);
      const visited = new Set();
      while (currentCat && !visited.has(currentCat.id)) {
        visited.add(currentCat.id);
        if (currentCat.is_order_only) {
          isOrderOnly = true;
        }
        if (currentCat.is_preorder) {
          isPreorder = true;
        }
        if (!orderLink && currentCat.order_link) {
          orderLink = currentCat.order_link;
        }
        if (currentCat.parent_id) {
          currentCat = categories.find(c => c.id === currentCat.parent_id);
        } else {
          break;
        }
      }

      return {
        id: p.id,
        title: name,
        country: p.country || (name.toLowerCase().includes('турц') ? "Турция" : name.toLowerCase().includes('росс') ? "Россия" : "Европа"),
        brand: p.brand || nameParts[0] || "MAFF",
        grade: p.grade || (name.includes('33') ? "33 класс" : name.includes('32') ? "32 класс" : "Premium"),
        thickness: p.thickness || name.match(/\d+мм/)?.[0] || "8мм",
        price: Number(p.price || 0),
        priceOutlet: p.price_outlet ? Number(p.price_outlet) : undefined,
        inStock: p.stock > 0,
        isOrderOnly: isOrderOnly,
        isPreorder: isPreorder,
        orderLink: orderLink,
        image: (p.image_url && typeof p.image_url === 'string')
          ? (p.image_url.startsWith('http') 
              ? p.image_url 
              : `${p.image_url.startsWith('/') ? '' : '/'}${p.image_url}`)
          : ""
      };
    });
  }, [filteredProducts, categories]);

  const sortedProducts = useMemo(() => {
    let productsList = [...mappedProducts];
    
    switch (sortBy) {
      case "Сначала дешевле":
        productsList.sort((a, b) => a.price - b.price);
        break;
      case "Сначала дороже":
        productsList.sort((a, b) => b.price - a.price);
        break;
      case "По названию":
        productsList.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    return productsList;
  }, [mappedProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [currentPage, sortedProducts]);

  const handlePageChange = (page: number | string) => {
    if (typeof page === "number") {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] min-h-screen pb-16">
        <div className="border-b border-slate-50 dark:border-white/5 py-3">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
               <span className="w-8 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
               <span>/</span>
               <span className="w-16 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            </nav>
          </div>
        </div>
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10 text-center space-y-3 flex flex-col items-center">
           <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
           <div className="w-56 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
           <div className="w-80 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        </section>
        <section className="max-w-7xl mx-auto px-4 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
           {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 flex flex-col h-full animate-pulse space-y-3">
                 <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
                 <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                 <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                 <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
           ))}
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Breadcrumbs ── */}
      <div className="w-full bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-[#2c3b6e] transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/catalog" className="hover:text-[#2c3b6e] transition-colors">Каталог</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">{categoryTitle}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
             <span className="w-8 h-[1.5px] bg-[#2c3b6e] rounded-full" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2c3b6e]">Категория</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
            {categoryTitle}
          </h1>
          <p className="max-w-xl text-slate-400 text-[11px] font-semibold leading-relaxed">
            Откройте для себя совершенство натурального дерева. Наша коллекция {categoryTitle.toLowerCase()} сочетает в себе 
            традиционное мастерство и современные технологии обработки для создания неповторимого уюта в вашем доме.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* ── Sidebar Filters (Desktop) ── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-32 space-y-10 p-1">
                <div>
                   <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">
                         Фильтры
                      </h3>
                      <Filter className="w-3.5 h-3.5 text-[#2c3b6e]" />
                   </div>
                   
                   {/* Brand Filter */}
                   <div className="mb-10">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Бренд</h4>
                      <div className="space-y-1">
                         {FILTERS.brands.map(brand => (
                           <button 
                             key={brand}
                             onClick={() => toggleFilter(brand)}
                             className={cn(
                               "flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all group",
                               activeFilters.includes(brand) ? "bg-blue-50 text-[#2c3b6e]" : "text-slate-600 hover:bg-slate-50"
                             )}
                           >
                             <div className="flex items-center gap-2.5">
                                <div className={cn("w-4 h-4 rounded-lg border transition-all flex items-center justify-center", activeFilters.includes(brand) ? "bg-[#2c3b6e] border-[#2c3b6e]" : "border-slate-200 bg-white group-hover:border-[#2c3b6e]")}>
                                   {activeFilters.includes(brand) && <X className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                                {brand}
                             </div>
                             <span className="text-[9px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">12</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Grade Filter */}
                   <div className="mb-10">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Класс / Сорт</h4>
                      <div className="flex flex-wrap gap-2">
                         {FILTERS.grades.map(grade => (
                           <button 
                             key={grade}
                             onClick={() => toggleFilter(grade)}
                             className={cn(
                               "px-4 py-2 rounded-full text-[10px] font-bold border transition-all",
                               activeFilters.includes(grade) ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-slate-600 border-slate-200 hover:border-[#2c3b6e]"
                             )}
                           >
                             {grade}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Thickness Filter */}
                   <div className="mb-10">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Толщина (мм)</h4>
                      <div className="grid grid-cols-2 gap-2">
                         {FILTERS.thickness.map(t => (
                           <button 
                             key={t}
                             onClick={() => toggleFilter(t)}
                             className={cn(
                               "px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all",
                               activeFilters.includes(t) ? "bg-blue-50 text-[#2c3b6e] border-blue-200" : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                             )}
                           >
                             {t} мм
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </aside>

          {/* ── Main Content Area ── */}
          <main className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white border border-slate-100 p-2 rounded-2xl">
               <div className="flex items-center gap-2 pl-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Найдено:</span>
                  <span className="text-[11px] font-black text-slate-900">{filteredProducts.length} {filteredProducts.length % 10 === 1 && filteredProducts.length % 100 !== 11 ? "товар" : [2, 3, 4].includes(filteredProducts.length % 10) && ![12, 13, 14].includes(filteredProducts.length % 100) ? "товара" : "товаров"}</span>
               </div>
               
               <div className="flex items-center gap-3">
                  {/* Sorting */}
                  <div className="relative group">
                     <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                        {sortBy}
                        <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                     </button>
                     
                     {/* Dropdown Menu */}
                     <div className="absolute top-full right-0 mt-1 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-2">
                           {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map((option) => (
                             <button
                               key={option}
                               onClick={() => setSortBy(option)}
                               className={cn(
                                 "w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all",
                                 sortBy === option ? "bg-blue-50 text-[#2c3b6e]" : "text-slate-600 hover:bg-slate-50"
                               )}
                             >
                               {option}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Active Tags */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                 {activeFilters.map(tag => (
                   <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-700">
                      {tag}
                      <button onClick={() => toggleFilter(tag)} className="hover:text-red-500 transition-colors">
                         <X className="w-3 h-3" strokeWidth={3} />
                      </button>
                   </div>
                 ))}
                 <button 
                   onClick={() => setActiveFilters([])}
                   className="text-[10px] font-black text-[#2c3b6e] uppercase tracking-widest ml-2 hover:underline"
                 >
                    Сбросить всё
                 </button>
              </div>
            )}

            {/* Product Grid - 2 columns on mobile */}
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                 {currentProducts.map((product) => (
                   <ProductCard key={product.id} {...product} />
                 ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300 mb-3 animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Товары в данной категории не найдены
                </p>
              </div>
            )}

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center pb-20 lg:pb-0">
                 <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button 
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "w-10 h-10 rounded-xl font-bold text-[11px] transition-all",
                          p === currentPage ? "bg-[#1a1a1a] text-white shadow-lg shadow-black/10" : "bg-white border border-slate-100 text-slate-400 hover:border-[#2c3b6e] hover:text-[#2c3b6e]"
                        )}
                      >
                         {p}
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Floating Filter Button ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] lg:hidden">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-slate-900 text-white px-7 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#2c3b6e]" />
          Фильтры
          {activeFilters.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2c3b6e] text-slate-900 text-[9px] font-black">
               {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <div className={cn("fixed inset-0 z-[160] lg:hidden transition-all duration-500", isFilterOpen ? "pointer-events-auto" : "pointer-events-none")}>
         {/* Backdrop */}
         <div 
           className={cn("absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500", isFilterOpen ? "opacity-100" : "opacity-0")}
           onClick={() => setIsFilterOpen(false)}
         />
         
         {/* Drawer Content */}
         <div className={cn("absolute bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 flex flex-col", isFilterOpen ? "translate-y-0" : "translate-y-full")}>
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Фильтры</h3>
               <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 pb-20 space-y-10">
                {/* Brand Filter */}
                <div>
                   <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Бренд</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {FILTERS.brands.map(brand => (
                        <button 
                          key={brand}
                          onClick={() => toggleFilter(brand)}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all text-[11px] font-bold",
                            activeFilters.includes(brand) ? "bg-blue-50 border-[#2c3b6e] text-[#2c3b6e]" : "bg-white border-slate-100 text-slate-600"
                          )}
                        >
                          <div className={cn("w-3.5 h-3.5 rounded-md border flex items-center justify-center", activeFilters.includes(brand) ? "bg-[#2c3b6e] border-[#2c3b6e]" : "border-slate-200")}>
                             {activeFilters.includes(brand) && <X className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                          </div>
                          {brand}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Grade Filter */}
                <div>
                   <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Класс / Сорт</h4>
                   <div className="flex flex-wrap gap-2">
                      {FILTERS.grades.map(grade => (
                        <button 
                          key={grade}
                          onClick={() => toggleFilter(grade)}
                          className={cn(
                            "px-4 py-2.5 rounded-full text-[10px] font-bold border transition-all",
                            activeFilters.includes(grade) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                          )}
                        >
                          {grade}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Thickness Filter */}
                <div>
                   <h4 className="text-[9px] font-black uppercase text-slate-400 mb-5 tracking-widest">Толщина (мм)</h4>
                   <div className="grid grid-cols-2 gap-2">
                      {FILTERS.thickness.map(t => (
                        <button 
                          key={t}
                          onClick={() => toggleFilter(t)}
                          className={cn(
                            "px-3 py-3 rounded-xl text-[11px] font-bold border transition-all",
                            activeFilters.includes(t) ? "bg-blue-50 border-[#2c3b6e] text-[#2c3b6e]" : "bg-white border-slate-100 text-slate-600"
                          )}
                        >
                          {t} мм
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button 
                 onClick={() => setIsFilterOpen(false)}
                 className="w-full h-12 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center"
               >
                  Показать результаты
               </button>
            </div>
         </div>
          </div>
    </div>
  );
}
