import sys

content = """\"use client\";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  X,
  Filter,
  Search,
  ShoppingCart
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
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const itemsPerPage = 40; // Reduced for performance

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam));
    } else {
      setSelectedCategoryId(null);
    }
    setSelectedThicknesses([]);
  }, [categoryParam]);

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
        const pt = p.thickness || p.name.match(/\d+мм/)?.[0] || "";
        const cleanT = pt.match(/\d+/) ? `${pt.match(/\d+/)[0]} мм` : "";
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
          thickness: p.thickness || name.match(/\d+мм/)?.[0] || "8мм",
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
    <div className="space-y-6">
      <div>
         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
           Filter
           <Filter className="w-5 h-5 text-slate-400" />
         </h3>
         
         {/* Accordion Categories */}
         <div className="space-y-1">
            {loading && categories.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2" />
              ))
            ) : (
              <>
                <Link 
                  href="/catalog" 
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn("block w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors", !selectedCategoryId ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
                >
                  All Products
                </Link>
                {mainCategories.map(cat => {
                  const subs = categories.filter(c => c.parent_id === cat.id);
                  const isExpanded = expandedCategories[cat.id];
                  const isActive = selectedCategoryId === cat.id || subs.some(s => s.id === selectedCategoryId);
                  
                  return (
                    <div key={cat.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <div className="flex items-center justify-between px-2 py-3">
                        <Link 
                          href={`/catalog?category=${cat.id}`}
                          className={cn("text-sm font-semibold transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200 hover:text-blue-600")}
                        >
                          {cat.name}
                        </Link>
                        {subs.length > 0 && (
                          <button onClick={() => toggleCategory(cat.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-500", isExpanded ? "rotate-180" : "")} />
                          </button>
                        )}
                      </div>
                      
                      {/* Subcategories (Accordion expanded state) */}
                      {isExpanded && subs.length > 0 && (
                        <div className="pl-4 pb-2 space-y-1">
                          {subs.map(sub => (
                            <Link
                              key={sub.id}
                              href={`/catalog?category=${sub.id}`}
                              className={cn("block px-3 py-2 text-[13px] rounded-lg transition-colors", selectedCategoryId === sub.id ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50")}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
         </div>
      </div>

      {/* Brand Filters */}
      {availableBrands.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
           <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Brands</h3>
           <div className="space-y-2">
              {availableBrands.slice(0, 15).map(brand => {
                const isSelected = activeFilters.includes(brand);
                return (
                  <button 
                    key={brand} 
                    onClick={() => setActiveFilters(prev => prev.includes(brand) ? prev.filter(f => f !== brand) : [...prev, brand])} 
                    className="flex items-center gap-3 w-full group"
                  >
                    <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 dark:border-slate-600 group-hover:border-blue-500")}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={cn("text-[13px]", isSelected ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")}>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {categories.find(c => c.id === selectedCategoryId)?.name || "Каталог продукции"}
          </h1>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-slate-500">{filteredProducts.length} items</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none text-slate-900 dark:text-white ml-4">
               {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 no-scrollbar">
                {FilterContent}
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0">
            {/* GRID */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="py-20 text-center text-slate-500">Товары не найдены</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                 {currentProducts.map((product) => (
                   <ProductCard key={product.id} {...product} />
                 ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50 text-sm">Назад</button>
                <span className="px-4 py-2 text-sm font-semibold">{currentPage} / {totalPages}</span>
                <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50 text-sm">Вперед</button>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Mobile Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <button onClick={() => setIsFilterOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-[300px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2"><X className="w-5 h-5" /></button>
             </div>
             <div className="overflow-y-auto flex-grow">{FilterContent}</div>
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

print("Created unified catalog page with accordion filters")
