import sys

content = """\"use client\";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  X,
  SlidersHorizontal,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";

function CatalogProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryParam ? parseInt(categoryParam) : null
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Популярные");
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedThicknesses, setSelectedThicknesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expand category by default if it's in the URL
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const itemsPerPage = 40;

  useEffect(() => {
    if (categoryParam) {
      const id = parseInt(categoryParam);
      setSelectedCategoryId(id);
      
      // Auto-expand parent if subcategory is selected
      if (categories.length > 0) {
        const cat = categories.find(c => c.id === id);
        if (cat && cat.parent_id) {
          setExpandedCategories(prev => ({ ...prev, [cat.parent_id]: true }));
        } else if (cat && !cat.parent_id) {
          setExpandedCategories(prev => ({ ...prev, [id]: true }));
        }
      }
    } else {
      setSelectedCategoryId(null);
    }
    setSelectedThicknesses([]);
  }, [categoryParam, categories]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch(`/api/v1/categories/?t=${Date.now()}`);
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (err) {
        console.error("Fetch categories failed", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = selectedCategoryId
          ? `/api/v1/products/?category_id=${selectedCategoryId}&t=${Date.now()}`
          : `/api/v1/products/?t=${Date.now()}`;
        const prodRes = await fetch(url);
        const prodData = await prodRes.json();
        const safeProducts = Array.isArray(prodData) ? prodData : [];
        setProducts(safeProducts);

        const uniqueBrands = Array.from(new Set(safeProducts.map((p: any) => p.brand).filter(Boolean))) as string[];
        const cleanBrands = uniqueBrands.filter(b => typeof b === 'string' && !/^[0-9a-f-]{36}$/.test(b)).sort();
        setAvailableBrands(cleanBrands);
      } catch (err) {
        console.error("Fetch products failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getAllChildIds = (catId: number, cats: any[], depth = 0): number[] => {
    if (depth > 10) return [catId];
    const children = cats.filter(c => c && c.parent_id === catId);
    let ids = [catId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id, cats, depth + 1)];
    });
    return ids;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    result = result.filter(p => p.category_id !== null && p.category_id !== undefined);
    
    if (selectedCategoryId) {
      const allRelatedIds = getAllChildIds(selectedCategoryId, categories);
      result = result.filter(p => p.category_id && allRelatedIds.includes(p.category_id));
    }
    if (activeFilters.length > 0) {
      result = result.filter(p => activeFilters.includes(p.brand));
    }
    if (selectedThicknesses.length > 0) {
      result = result.filter(p => {
        const pt = p.thickness || (p.name.match(/\\d+мм/) ? p.name.match(/\\d+мм/)[0] : "");
        const cleanT = pt.match(/\\d+/) ? `${pt.match(/\\d+/)[0]} мм` : "";
        return selectedThicknesses.includes(cleanT);
      });
    }
    
    const getPrice = (p: any) => p.price || 0;
    switch (sortBy) {
      case "Сначала дешевле": result.sort((a, b) => getPrice(a) - getPrice(b)); break;
      case "Сначала дороже": result.sort((a, b) => getPrice(b) - getPrice(a)); break;
      case "По названию": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [products, selectedCategoryId, categories, activeFilters, selectedThicknesses, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage).map(p => {
        const name = p.name || "Безымянный товар";
        const nameParts = name.split(' ');
        
        return {
          id: p.id,
          title: name,
          country: p.country || "Европа",
          brand: p.brand || nameParts[0] || "MAFF",
          grade: p.grade || "Premium",
          thickness: p.thickness || (name.match(/\\d+мм/) ? name.match(/\\d+мм/)[0] : "8мм"),
          price: Number(p.price || 0),
          priceOutlet: p.price_outlet ? Number(p.price_outlet) : undefined,
          inStock: p.stock > 0,
          isDoor: false,
          image: p.image_url ? (p.image_url.startsWith('http') ? p.image_url : `/${p.image_url}`) : "",
          discount: p.price_outlet ? `−${Math.round(((p.price - p.price_outlet) / p.price) * 100)}%` : "SALE"
        };
      })
  }, [currentPage, filteredProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainCategories = categories.filter(c => !c.parent_id);

  const FilterContent = (
    <div className="w-full font-sans text-[#111827]">
      {/* Filter Header matching the photo */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <h3 className="text-xl font-medium tracking-tight">Filter ↘</h3>
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
      </div>
         
      {/* Accordion Categories */}
      <div className="mt-2">
        {loading && categories.length === 0 ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="w-full h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2" />
          ))
        ) : (
          <div className="flex flex-col">
            <Link 
              href="/catalog" 
              onClick={() => setSelectedCategoryId(null)}
              className={cn("py-4 text-[15px] transition-colors border-b border-gray-100 dark:border-slate-800/50", !selectedCategoryId ? "font-semibold" : "text-gray-800 dark:text-gray-300 hover:text-black")}
            >
              All Products
            </Link>
            
            {mainCategories.map(cat => {
              const subs = categories.filter(c => c.parent_id === cat.id);
              const isExpanded = expandedCategories[cat.id];
              const isActive = selectedCategoryId === cat.id || subs.some(s => s.id === selectedCategoryId);
              
              return (
                <div key={cat.id} className="border-b border-gray-100 dark:border-slate-800/50 last:border-0">
                  <div className="flex items-center justify-between py-4 cursor-pointer" onClick={() => subs.length > 0 ? toggleCategory(cat.id) : null}>
                    <Link 
                      href={`/catalog?category=${cat.id}`}
                      className={cn("text-[15px] transition-colors", isActive ? "font-semibold text-black dark:text-white" : "text-gray-800 dark:text-gray-300 hover:text-black")}
                      onClick={(e) => {
                         if(subs.length > 0 && !isExpanded) {
                           e.preventDefault();
                           toggleCategory(cat.id);
                         }
                      }}
                    >
                      {cat.name}
                    </Link>
                    {subs.length > 0 && (
                      <span className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                  
                  {/* Subcategories (Accordion expanded state) */}
                  {isExpanded && subs.length > 0 && (
                    <div className="pl-4 pb-4 space-y-3 flex flex-col">
                      {subs.map(sub => (
                        <Link
                          key={sub.id}
                          href={`/catalog?category=${sub.id}`}
                          className={cn("text-[14px] transition-colors", selectedCategoryId === sub.id ? "font-medium text-black dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white")}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brand Filters */}
      {availableBrands.length > 0 && (
        <div className="pt-6 mt-4">
           <div className="flex items-center justify-between pb-4">
             <h3 className="text-[15px] font-medium text-[#111827] dark:text-white">Brands</h3>
           </div>
           <div className="space-y-3 pl-4">
              {availableBrands.slice(0, 15).map(brand => {
                const isSelected = activeFilters.includes(brand);
                return (
                  <button 
                    key={brand} 
                    onClick={() => setActiveFilters(prev => prev.includes(brand) ? prev.filter(f => f !== brand) : [...prev, brand])} 
                    className="flex items-center gap-3 w-full group"
                  >
                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "border-gray-300 dark:border-gray-600 group-hover:border-black dark:group-hover:border-white")}>
                      {isSelected && <svg className="w-3 h-3 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={cn("text-[14px] transition-colors", isSelected ? "font-medium text-black dark:text-white" : "text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white")}>
                      {brand.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                    </span>
                  </button>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-slate-800">
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">
            {categories.find(c => c.id === selectedCategoryId)?.name || "Каталог"}
          </h1>
          <div className="hidden md:flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border border-gray-200 dark:border-slate-800 rounded px-3 py-1.5 text-sm outline-none text-slate-900 dark:text-white cursor-pointer hover:border-gray-300 transition-colors">
               {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
             <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 no-scrollbar">
                {FilterContent}
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            {/* Mobile sorting/count */}
            <div className="flex lg:hidden items-center justify-between mb-6">
              <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
              <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 text-sm font-medium border border-gray-200 rounded px-3 py-1.5">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            {/* GRID */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="py-20 text-center text-slate-500">Товары не найдены</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                 {currentProducts.map((product) => (
                   <ProductCard key={product.id} {...product} />
                 ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium disabled:opacity-30 transition-opacity">Previous</button>
                <div className="flex gap-1">
                  {Array.from({length: Math.min(5, totalPages)}).map((_, i) => {
                     const p = i + 1; // Simplified pagination for aesthetics
                     return (
                       <button key={p} onClick={() => handlePageChange(p)} className={cn("w-8 h-8 rounded flex items-center justify-center text-sm transition-colors", currentPage === p ? "bg-black text-white dark:bg-white dark:text-black font-medium" : "hover:bg-gray-100 dark:hover:bg-slate-800")}>
                         {p}
                       </button>
                     )
                  })}
                  {totalPages > 5 && <span className="w-8 h-8 flex items-center justify-center">...</span>}
                </div>
                <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium disabled:opacity-30 transition-opacity">Next</button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-[320px] max-w-[85vw] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <h2 className="font-medium text-lg">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-black"><X className="w-5 h-5" /></button>
             </div>
             <div className="overflow-y-auto flex-grow p-5">{FilterContent}</div>
             <div className="p-5 border-t border-gray-100 dark:border-slate-800">
                <button onClick={() => setIsFilterOpen(false)} className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 rounded font-medium text-sm">
                  Show {filteredProducts.length} Results
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}>
      <CatalogProductsContent />
    </Suspense>
  );
}
"""

with open("frontend/src/app/catalog/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Created aesthetically matched catalog page")
