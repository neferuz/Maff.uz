"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  X,
  Filter,
  SlidersHorizontal,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Box,
  Layers,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn, isRealProduct } from "@/lib/utils";
import { ProductCard } from "@/components/ui/product-card";
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 110, 
      damping: 17 
    } 
  }
} as const;

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 24; // 24 products per page feels more professional than 100

  // Track expanded category IDs in catalog
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);
  const [topOffset, setTopOffset] = useState(126); // Default mobile offset
  const productsCache = useRef<Record<string, { products: any[], brands: string[] }>>({});

  // Prevent background scrolling when mobile filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  // Automatically expand parents of selected category on mount or change
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const getAncestors = (catId: number, cats: any[]): number[] => {
        const ancestors: number[] = [];
        let current = cats.find(c => c && c.id === catId);
        while (current && current.parent_id) {
          ancestors.push(current.parent_id);
          current = cats.find(c => c && c.id === current.parent_id);
        }
        return ancestors;
      };

      const ancestors = getAncestors(selectedCategoryId, categories);
      setExpandedCategoryIds(prev => {
        const next = new Set([...prev, ...ancestors]);
        // Also expand the selected category itself if it has children
        const hasChildren = categories.some(c => c && c.parent_id === selectedCategoryId);
        if (hasChildren) {
          next.add(selectedCategoryId);
        }
        return Array.from(next);
      });
    }
  }, [selectedCategoryId, categories]);

  // Handle query parameter sync
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategoryId(parseInt(categoryParam));
    } else {
      setSelectedCategoryId(null);
    }
    setSelectedThicknesses([]);
    setSelectedSizes([]);
    setCurrentPage(1);
  }, [categoryParam]);

  // Scroll to catalog workspace start when filters change and user is scrolled down
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById("catalog-workspace");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < 0) {
          scrollToCatalogStart('smooth');
        }
      }
    }
  }, [selectedCategoryId, activeFilters, selectedThicknesses, selectedSizes]);

  const scrollToCatalogStart = (behavior: any = 'smooth') => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById("catalog-workspace");
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset + rect.top - 100;
      window.scrollTo({ top: scrollTop, behavior });
    }
  };

  // Dynamically calculate sticky top offset for the sorting bar and sidebar under catalog header
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateOffset = () => {
      const el = document.getElementById("catalog-sticky-header");
      if (el) {
        const height = el.getBoundingClientRect().height;
        const baseOffset = window.innerWidth >= 1024 ? 160 : 64;
        setTopOffset(baseOffset + height - 2); // overlap by 2px to prevent gaps
      }
    };
    
    updateOffset();
    
    const observer = new ResizeObserver(updateOffset);
    const el = document.getElementById("catalog-sticky-header");
    if (el) {
      observer.observe(el);
    }
    
    window.addEventListener('resize', updateOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [selectedCategoryId, categories]);



  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch(`/api/v1/categories/?t=${Date.now()}`, { 
          cache: "no-store", 
          headers: { "Cache-Control": "no-cache" } 
        });
        const catData = await catRes.json();
        const safeCategories = Array.isArray(catData) ? catData : [];

        // Helper to check if a category name contains "комплектующие"
        const isAccessoryCategoryName = (name: string) => {
          if (!name) return false;
          const lower = name.toLowerCase();
          return lower.includes("комплектующие") || lower.includes("нестандарт комплектующие");
        };

        // Recursively check if a category or any of its parent/ancestor categories is an accessory
        const isAccessoryOrChild = (cat: any): boolean => {
          let current = cat;
          while (current) {
            if (isAccessoryCategoryName(current.name)) {
              return true;
            }
            if (current.parent_id) {
              current = safeCategories.find((c: any) => c && c.id === current.parent_id);
            } else {
              break;
            }
          }
          return false;
        };

        // Filter out accessory categories
        const filteredCategories = safeCategories.filter((c: any) => c && !isAccessoryOrChild(c));
        setCategories(filteredCategories);
      } catch (err) {
        console.error("Fetch categories failed", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when selectedCategoryId changes
  useEffect(() => {
    const cacheKey = selectedCategoryId ? String(selectedCategoryId) : "all";
    
    if (productsCache.current[cacheKey]) {
      setProducts(productsCache.current[cacheKey].products);
      setAvailableBrands(productsCache.current[cacheKey].brands);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const url = selectedCategoryId
          ? `/api/v1/products/?category_id=${selectedCategoryId}&group=true&t=${Date.now()}`
          : `/api/v1/products/?limit=300&group=true&t=${Date.now()}`;
        
        const prodRes = await fetch(url, { 
          cache: "no-store", 
          headers: { "Cache-Control": "no-cache" } 
        });
        const prodData = await prodRes.json();
        let safeProducts = Array.isArray(prodData) ? prodData : [];
        // Filter out non-products (accessories, samples, merchandise, 0-price)
        safeProducts = safeProducts.filter((p: any) => isRealProduct(p));
        setProducts(safeProducts);

        // Extract unique brands for this selection
        const uniqueBrands = Array.from(
          new Set(safeProducts.map((p: any) => p.brand).filter(Boolean))
        ) as string[];
        
        const cleanBrands = uniqueBrands
          .map(b => String(b).trim())
          .filter(b => b.length > 0 && b.toUpperCase() !== "MAFF" && !/^[0-9a-f-]{36}$/i.test(b))
          .sort();
        setAvailableBrands(cleanBrands);

        // Save to cache
        productsCache.current[cacheKey] = {
          products: safeProducts,
          brands: cleanBrands
        };
      } catch (err) {
        console.error("Fetch products failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  const getAllChildIds = (catId: number, cats: any[], depth = 0): number[] => {
    if (depth > 10) return [catId];
    const children = cats.filter(c => c && c.parent_id === catId);
    let ids = [catId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id, cats, depth + 1)];
    });
    return ids;
  };

  const allFreePriceCategoryIds = useMemo(() => {
    const mainFreeCats = categories.filter(c => 
      c && c.name && (
        c.id === 8 || c.id === 359 || c.id === 174 || c.id === 13 ||
        c.name.toLowerCase().includes('двер') || 
        c.name.toLowerCase().includes('паркет') || 
        c.name.toLowerCase().includes('подложк') ||
        c.name.toLowerCase().includes('coswick') ||
        c.name.toLowerCase().includes('tarkett') ||
        c.name.toLowerCase().includes('salsa') ||
        c.name.toLowerCase().includes('s.classic') ||
        c.name.toLowerCase().includes('silkwood') ||
        c.name.toLowerCase().includes('stimul') ||
        c.name.toLowerCase().includes('ручк') ||
        c.name.toLowerCase().includes('петл')
      )
    );
    let ids: number[] = [];
    mainFreeCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    return Array.from(new Set(ids));
  }, [categories]);

  const allDoorIds = useMemo(() => {
    const mainDoorCats = categories.filter(c => c && c.name && c.name.toLowerCase().includes('двер'));
    let ids: number[] = [];
    mainDoorCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    return Array.from(new Set(ids));
  }, [categories]);

  // Helper to extract product thickness format (e.g. "9")
  const getProductThickness = (p: any) => {
    const t = p.thickness || p.name.match(/\d+\s*(?:мм|mm)/i)?.[0] || p.name.match(/\d+(?:мм|mm)/i)?.[0] || "";
    if (!t) return "";
    const m = t.match(/\d+/);
    if (m) {
      const val = parseInt(m[0], 10);
      if (val > 150) return ""; // filter out bogus thicknesses like 1000, 2000
      return `${val}`;
    }
    return "";
  };

  // Helper to extract product size format (e.g. "2440x1220")
  const getProductSize = (p: any) => {
    const m = p.name.match(/(?:\b|^)(\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?)/i);
    if (!m) return "";
    return m[1].replace(/\s+/g, "").replace(/[х\*×]/g, "x");
  };

  const availableThicknesses = useMemo(() => {
    const thicknesses = new Set<string>();
    products.forEach((p: any) => {
      const pt = getProductThickness(p);
      if (pt) {
        thicknesses.add(pt);
      }
    });
    return Array.from(thicknesses).sort((a, b) => {
      const na = parseInt(a) || 0;
      const nb = parseInt(b) || 0;
      return na - nb;
    });
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p: any) => {
      const ps = getProductSize(p);
      if (ps) {
        sizes.add(ps);
      }
    });
    return Array.from(sizes).sort((a, b) => {
      const wA = parseInt(a.split('x')[0]) || 0;
      const wB = parseInt(b.split('x')[0]) || 0;
      if (wA !== wB) return wA - wB;
      const hA = parseInt(a.split('x')[1]) || 0;
      const hB = parseInt(b.split('x')[1]) || 0;
      return hA - hB;
    });
  }, [products]);

  // Compute filtered and sorted products on client side
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Ensure we only show products belonging to non-hidden categories
    const activeCategoryIds = new Set(categories.map(c => c.id));
    result = result.filter(p => p.category_id && activeCategoryIds.has(p.category_id));

    // Exclude promotional items with no categories. 
    // We allow doors, parquets and underlayments to have price 0 (calculated on request/samples).
    // For other products, we require price >= 1000 to filter out invalid items.
    result = result.filter(p => {
      if (p.category_id === null || p.category_id === undefined) return false;
      const isFreePriceCategory = allFreePriceCategoryIds.includes(p.category_id);
      return p.price >= 1000 || isFreePriceCategory;
    });
    
    // Category descendant filtering
    if (selectedCategoryId) {
      const allRelatedIds = getAllChildIds(selectedCategoryId, categories);
      result = result.filter(p => p.category_id && allRelatedIds.includes(p.category_id));
    }
    
    // Brand filtering
    if (activeFilters.length > 0) {
      result = result.filter(p => activeFilters.includes(p.brand));
    }
    
    // Thickness filtering
    if (selectedThicknesses.length > 0) {
      result = result.filter(p => {
        const pt = getProductThickness(p);
        return selectedThicknesses.includes(pt);
      });
    }

    // Size/Dimension filtering
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        const ps = getProductSize(p);
        return selectedSizes.includes(ps);
      });
    }
    
    // Sorting logic
    const getPrice = (p: any) => p.price || 0;
    switch (sortBy) {
      case "Сначала дешевле": 
        result.sort((a, b) => getPrice(a) - getPrice(b)); 
        break;
      case "Сначала дороже": 
        result.sort((a, b) => getPrice(b) - getPrice(a)); 
        break;
      case "По названию": 
        result.sort((a, b) => a.name.localeCompare(b.name)); 
        break;
      default: 
        break;
    }
    return result;
  }, [products, selectedCategoryId, categories, activeFilters, selectedThicknesses, selectedSizes, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const parentCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    if (!cat || !cat.parent_id) return null;
    return categories.find(c => c.id === cat.parent_id);
  }, [selectedCategoryId, categories]);

  const categoryPath = useMemo(() => {
    if (!selectedCategoryId || categories.length === 0) return [];
    const path = [];
    let current = categories.find(c => c.id === selectedCategoryId);
    while (current) {
      path.unshift(current);
      if (current.parent_id) {
        current = categories.find(c => c.id === current.parent_id);
      } else {
        break;
      }
    }
    return path;
  }, [selectedCategoryId, categories]);

  const isLaminateCategorySelected = useMemo(() => {
    if (!selectedCategoryId) return false;
    const allLaminateIds = getAllChildIds(1, categories);
    return allLaminateIds.includes(selectedCategoryId);
  }, [selectedCategoryId, categories]);



  // Paginated and resolved products
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage).map(p => {
      const name = p.name || "Безымянный товар";
      const nameParts = name.split(' ');
      
      // Resolve category configurations recursively (order-only, pre-order, links)
      let isOrderOnly = false;
      let isPreorder = false;
      let orderLink = "";
      let currentCat = categories.find(c => c.id === p.category_id);
      const visited = new Set();
      while (currentCat && !visited.has(currentCat.id)) {
        visited.add(currentCat.id);
        if (currentCat.is_order_only) isOrderOnly = true;
        if (currentCat.is_preorder) isPreorder = true;
        if (!orderLink && currentCat.order_link) orderLink = currentCat.order_link;
        
        if (currentCat.parent_id) {
          currentCat = categories.find(c => c.id === currentCat.parent_id);
        } else {
          break;
        }
      }
      
      const rawCountry = p.country || (name.toLowerCase().includes('турц') ? "Турция" : name.toLowerCase().includes('росс') ? "Россия" : "");
      const rawBrand = p.brand || "";
      const parsedGrade = p.grade || (name.includes('33') ? "33 класс" : name.includes('32') ? "32 класс" : "");
      const parsedThickness = getProductThickness(p);

      // 1. Format brand name nicely
      let parsedBrand = rawBrand;
      const lowerRawBrand = rawBrand.toLowerCase().trim();
      if (lowerRawBrand === "volkhovets" || lowerRawBrand === "волховец") {
        parsedBrand = "Волховец";
      } else if (lowerRawBrand === "profildoors") {
        parsedBrand = "ProfilDoors";
      } else if (lowerRawBrand === "zadoor") {
        parsedBrand = "Zadoor";
      } else if (lowerRawBrand === "portika") {
        parsedBrand = "Portika";
      } else if (lowerRawBrand === "filomuro") {
        parsedBrand = "Filomuro";
      } else if (lowerRawBrand === "silkroad" || lowerRawBrand === "silk road") {
        parsedBrand = "Silk Road";
      } else if (parsedBrand) {
        parsedBrand = parsedBrand.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      // 2. Auto-resolve missing countries based on brands
      let parsedCountry = rawCountry;
      if (!parsedCountry && parsedBrand) {
        const brandCountryMap: Record<string, string> = {
          "волховец": "Россия",
          "volkhovets": "Россия",
          "profildoors": "Россия",
          "zadoor": "Россия",
          "portika": "Россия",
          "porta": "Россия",
          "filomuro": "Италия",
          "frida": "Китай",
          "zuber": "Китай",
          "agt": "Турция",
          "barlinek": "Польша",
          "kronopol": "Польша",
          "coswick": "Беларусь",
          "tarwood": "Беларусь",
          "egger": "Германия",
          "quick-step": "Бельгия",
          "quick step": "Бельгия",
          "alsafloor": "Франция",
          "swiss krono": "Россия",
          "kastamonu": "Россия",
          "joss beaumont": "Россия",
        };
        const lowerBrand = parsedBrand.toLowerCase().trim();
        for (const [b, c] of Object.entries(brandCountryMap)) {
          if (lowerBrand.includes(b) || b.includes(lowerBrand)) {
            parsedCountry = c;
            break;
          }
        }
      }

      return {
        id: p.id,
        title: name,
        country: parsedCountry,
        brand: parsedBrand,
        grade: parsedGrade,
        thickness: parsedThickness,
        price: Number(p.price || 0),
        priceOutlet: p.price_outlet ? Number(p.price_outlet) : undefined,
        inStock: p.stock > 0,
        isDoor: allDoorIds.includes(p.category_id),
        isOrderOnly: isOrderOnly,
        isPreorder: isPreorder,
        orderLink: orderLink,
        image: (p.image_url && typeof p.image_url === 'string')
          ? (p.image_url.startsWith('http') 
              ? `${p.image_url}?v=3`
              : `${p.image_url.startsWith('/') ? '' : '/'}${p.image_url}?v=3`)
          : "",
        images: p.images,
        discount: p.price_outlet && p.price > 0
          ? `−${Math.round(((p.price - p.price_outlet) / p.price) * 100)}%` 
          : undefined
      };
    });
  }, [currentPage, filteredProducts, allDoorIds, categories]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToCatalogStart('smooth');
  };

  const toggleBrandFilter = (brand: string) => {
    setActiveFilters(prev => 
      prev.includes(brand) ? prev.filter(f => f !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const getPaginationButtons = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    if (totalPages > 1) range.push(totalPages);

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  const mainCategories = useMemo(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    return cat ? cat.name : null;
  }, [selectedCategoryId, categories]);

  const categoryProductCounts = useMemo(() => {
    const activeCategoryIds = new Set(categories.map(c => c.id));
    const validProducts = products.filter(p => {
      if (!p.category_id || !activeCategoryIds.has(p.category_id)) return false;
      const isFreePriceCategory = allFreePriceCategoryIds.includes(p.category_id);
      return p.price >= 1000 || isFreePriceCategory;
    });

    const counts: Record<number, number> = {};
    categories.forEach(cat => {
      const allRelatedIds = getAllChildIds(cat.id, categories);
      counts[cat.id] = validProducts.filter(p => p.category_id && allRelatedIds.includes(p.category_id)).length;
    });
    return counts;
  }, [products, categories, allFreePriceCategoryIds]);

  const totalValidCount = useMemo(() => {
    const activeCategoryIds = new Set(categories.map(c => c.id));
    return products.filter(p => {
      if (!p.category_id || !activeCategoryIds.has(p.category_id)) return false;
      const isFreePriceCategory = allFreePriceCategoryIds.includes(p.category_id);
      return p.price >= 1000 || isFreePriceCategory;
    }).length;
  }, [products, categories, allFreePriceCategoryIds]);

  const currentCategoryDescription = useMemo(() => {
    if (!selectedCategoryId || categories.length === 0) {
      return "Более 2000 товаров: напольные покрытия, двери и аксессуары.";
    }

    let currentCat = categories.find(c => c.id === selectedCategoryId);
    if (!currentCat) return "Более 2000 товаров: напольные покрытия, двери и аксессуары.";

    let depth = 0;
    while (currentCat.parent_id && depth < 10) {
      const parent = categories.find(c => c.id === currentCat.parent_id);
      if (!parent) break;
      currentCat = parent;
      depth++;
    }

    const mainCatName = currentCat.name.toLowerCase();

    if (mainCatName.includes("напольн") || mainCatName.includes("покрыт")) {
      return "Ламинат, паркетная доска, кварцвинил и аксессуары.";
    }
    if (mainCatName.includes("двер")) {
      return "Входные, межкомнатные и скрытые двери Invisible.";
    }
    if (mainCatName.includes("декор") || mainCatName.includes("панел") || mainCatName.includes("настенн")) {
      return "Стеновые панели, рейки, декор и плинтусы.";
    }
    if (mainCatName.includes("плит") || mainCatName.includes("керамогранит")) {
      return "Керамогранит, плитка и мозаика для стен и пола.";
    }
    if (mainCatName.includes("ручк") || mainCatName.includes("фурнитур")) {
      return "Дверные ручки, замки, петли и фурнитура.";
    }
    if (mainCatName.includes("дополн") || mainCatName.includes("сопут")) {
      return "Подложки, клеи и сопутствующие материалы.";
    }

    return "Более 2000 товаров: напольные покрытия, двери и аксессуары.";
  }, [selectedCategoryId, categories]);

  // Nested Category Tree Generator
  const renderCategoryTree = () => {
    return (
      <div className="space-y-1.5">
        {/* All Products Element */}
        <div className="py-2.5">
          <button
            onClick={() => {
              router.replace("/catalog", { scroll: false });
              setIsFilterOpen(false);
            }}
            className={cn(
              "w-full flex items-center justify-between text-left text-[13px] font-semibold transition-colors duration-200 cursor-pointer",
              !selectedCategoryId
                ? "text-[#2c3b6e] dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>
              Все товары
              <span className="ml-1.5 text-[10.5px] font-normal text-slate-400 dark:text-slate-500">
                ({totalValidCount})
              </span>
            </span>
          </button>
        </div>

        {mainCategories.map(cat => {
          const childCats = categories.filter(c => c.parent_id === cat.id);
          const hasChildren = childCats.length > 0;
          const isActive = selectedCategoryId === cat.id;
          const isChildActive = selectedCategoryId 
            ? getAllChildIds(cat.id, categories).includes(selectedCategoryId) && selectedCategoryId !== cat.id
            : false;
          const isExpanded = expandedCategoryIds.includes(cat.id);

          return (
            <div key={cat.id} className="py-2.5">
              <button
                onClick={() => {
                  router.replace(`/catalog?category=${cat.id}`, { scroll: false });
                  if (!hasChildren) {
                    setIsFilterOpen(false);
                  } else {
                    setExpandedCategoryIds(prev => {
                      if (prev.includes(cat.id)) {
                        return prev.filter(id => id !== cat.id);
                      } else {
                        const siblings = mainCategories.map(c => c.id);
                        const newPrev = prev.filter(id => !siblings.includes(id));
                        return [...newPrev, cat.id];
                      }
                    });
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between text-left text-[13px] font-semibold transition-all duration-200 cursor-pointer",
                  isActive || isChildActive
                    ? "text-[#2c3b6e] dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span className="truncate">
                  {cat.name.replace(/\sMAFF$/i, '')}
                  <span className="ml-1.5 text-[10.5px] font-normal text-slate-400 dark:text-slate-500">
                    ({categoryProductCounts[cat.id] || 0})
                  </span>
                </span>
                {hasChildren && (
                  <ChevronRight 
                    className={cn(
                      "w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ease-in-out", 
                      isExpanded && "rotate-90 text-[#2c3b6e] dark:text-blue-400"
                    )} 
                  />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {hasChildren && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pl-2 space-y-2">
                      {childCats.map(sub => {
                        const isSubActive = selectedCategoryId === sub.id;
                        const grandchildCats = categories.filter(c => c.parent_id === sub.id);
                        const hasGrandchildren = grandchildCats.length > 0;
                        const isGrandchildActive = selectedCategoryId
                          ? getAllChildIds(sub.id, categories).includes(selectedCategoryId) && selectedCategoryId !== sub.id
                          : false;
                        const isSubExpanded = expandedCategoryIds.includes(sub.id);

                        return (
                          <div key={sub.id} className="space-y-1.5">
                            <button
                              onClick={() => {
                                router.replace(`/catalog?category=${sub.id}`, { scroll: false });
                                if (!hasGrandchildren) {
                                  setIsFilterOpen(false);
                                } else {
                                  setExpandedCategoryIds(prev => {
                                    if (prev.includes(sub.id)) {
                                      return prev.filter(id => id !== sub.id);
                                    } else {
                                      const siblings = childCats.map(c => c.id);
                                      const newPrev = prev.filter(id => !siblings.includes(id));
                                      return [...newPrev, sub.id];
                                    }
                                  });
                                }
                              }}
                              className={cn(
                                "w-full flex items-center justify-between text-left text-[12.5px] transition-all duration-200 cursor-pointer",
                                isSubActive || isGrandchildActive
                                  ? "text-[#2c3b6e] dark:text-blue-400 font-medium"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                              )}
                            >
                              <span className="truncate">
                                {sub.name.replace(/\sMAFF$/i, '')}
                                <span className="ml-1.5 text-[10px] font-normal text-slate-400 dark:text-slate-500">
                                  ({categoryProductCounts[sub.id] || 0})
                                </span>
                              </span>
                              {hasGrandchildren && (
                                <ChevronRight 
                                  className={cn(
                                    "w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ease-in-out", 
                                    isSubExpanded && "rotate-90 text-[#2c3b6e] dark:text-blue-400"
                                  )} 
                                />
                              )}
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {hasGrandchildren && isSubExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-3 space-y-1.5 pt-1 pb-1">
                                    {grandchildCats.map(grand => {
                                      const isGrandActive = selectedCategoryId === grand.id;
                                      return (
                                        <button
                                          key={grand.id}
                                          onClick={() => {
                                            router.replace(`/catalog?category=${grand.id}`, { scroll: false });
                                            setIsFilterOpen(false);
                                          }}
                                          className={cn(
                                            "w-full flex items-center gap-2 text-left text-[12px] transition-all duration-200 cursor-pointer",
                                            isGrandActive
                                              ? "text-[#2c3b6e] dark:text-blue-400 font-medium"
                                              : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                                          )}
                                        >
                                          <span className="truncate">
                                            {grand.name.replace(/\sMAFF$/i, '')}
                                            <span className="ml-1.5 text-[9.5px] font-normal text-slate-400/80 dark:text-slate-500/80">
                                              ({categoryProductCounts[grand.id] || 0})
                                            </span>
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  const FilterContent = (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 flex items-center justify-between pb-2.5 pt-2 -mt-2 border-b border-slate-100 dark:border-white/5 mb-3">
         <div className="flex items-center gap-1.5">
           <h2 className="text-[13px] font-semibold tracking-wider text-slate-900 dark:text-white uppercase">Фильтры</h2>
           <Filter className="w-3.5 h-3.5 text-[#2c3b6e] dark:text-blue-400" />
         </div>
      </div>
      <div className="space-y-4.5 mt-3">
        {/* Category Selection Tree */}
        <div>
          {loading && categories.length === 0 ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-full h-8.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            renderCategoryTree()
          )}
        </div>

        {/* Thickness Filter */}
        {availableThicknesses.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/5">
             <h3 className="text-[12.5px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Толщина
             </h3>
             <div className="relative">
               <select 
                 value={selectedThicknesses.length > 0 ? selectedThicknesses[0] : ""}
                 onChange={(e) => {
                   setSelectedThicknesses(e.target.value ? [e.target.value] : []);
                   setCurrentPage(1);
                 }}
                 className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-white/5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#2c3b6e]/30 dark:focus:border-blue-500/30 transition-colors appearance-none cursor-pointer"
               >
                 <option value="" className="dark:bg-slate-900">Все</option>
                 {availableThicknesses.map(t => (
                   <option key={t} value={t} className="dark:bg-slate-900">{t}{String(t).toLowerCase().includes('мм') ? '' : ' мм'}</option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                 <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
               </div>
             </div>
          </div>
        )}

        {/* Size Filter */}
        {availableSizes.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/5">
             <h3 className="text-[12.5px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Размеры
             </h3>
             <div className="relative">
               <select 
                 value={selectedSizes.length > 0 ? selectedSizes[0] : ""}
                 onChange={(e) => {
                   setSelectedSizes(e.target.value ? [e.target.value] : []);
                   setCurrentPage(1);
                 }}
                 className="w-full bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-white/5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#2c3b6e]/30 dark:focus:border-blue-500/30 transition-colors appearance-none cursor-pointer"
               >
                 <option value="" className="dark:bg-slate-900">Все</option>
                 {availableSizes.map(size => (
                   <option key={size} value={size} className="dark:bg-slate-900">{size}{String(size).toLowerCase().includes('мм') ? '' : ' мм'}</option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                 <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
               </div>
             </div>
          </div>
        )}

        {/* Brand Filters */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5">
           <h3 className="text-[12.5px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
              Бренды
              {activeFilters.length > 0 && (
                <span className="bg-[#2c3b6e] dark:bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold">{activeFilters.length}</span>
              )}
           </h3>
           <div className="flex flex-wrap gap-1.5 max-h-[300px] overflow-y-auto overscroll-y-contain pr-1 pb-8 no-scrollbar">
              {loading && products.length === 0 ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="w-14 h-7.5 bg-slate-100 dark:bg-slate-800/40 rounded-full animate-pulse" />
                ))
              ) : availableBrands.length === 0 ? (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest leading-none">Бренды отсутствуют</span>
              ) : (
                availableBrands.map(brand => {
                  const isSelected = activeFilters.includes(brand);
                  const formattedBrand = brand.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

                  return (
                    <button 
                      key={brand} 
                      onClick={() => toggleBrandFilter(brand)} 
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] font-medium uppercase tracking-wider transition-all duration-200 text-center cursor-pointer",
                        isSelected 
                          ? "bg-[#2c3b6e] text-white border-[#2c3b6e] dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200/40 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      {formattedBrand}
                    </button>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 pb-20">
      {/* Custom styled scrollbars for sidebar lists */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(44, 59, 110, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(44, 59, 110, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}} />
      {/* ── Breadcrumbs ── */}
      <div className="w-full bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
          <nav className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors shrink-0">Главная</Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/catalog" className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors shrink-0">Каталог</Link>
            
            {loading && categoryParam ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <span className="inline-block w-20 h-3 bg-slate-200 dark:bg-slate-800/40 rounded animate-pulse shrink-0" />
              </>
            ) : categoryPath.length > 0 ? (
              categoryPath.map((cat, idx) => {
                const isLast = idx === categoryPath.length - 1;
                return (
                  <React.Fragment key={cat.id}>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    {isLast ? (
                      <span className="text-slate-900 dark:text-white shrink-0">{cat.name.replace(/\sMAFF$/i, '')}</span>
                    ) : (
                      <Link href={`/catalog?category=${cat.id}`} className="hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors shrink-0">
                        {cat.name.replace(/\sMAFF$/i, '')}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })
            ) : null}
          </nav>
        </div>
      </div>

      {/* ── Header Area ── */}
      <section id="catalog-sticky-header" className="w-full sticky top-16 lg:top-40 z-30 bg-white dark:bg-slate-900 py-2 sm:py-3 lg:py-5 border-b border-slate-100/80 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
            <div className="max-w-2xl">
              <h1 className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1.5 leading-tight">
                {loading && categoryParam ? (
                  <span className="inline-block w-48 h-5 lg:h-7 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
                ) : (
                  selectedCategoryName || <>Каталог <span className="text-[#2c3b6e] dark:text-blue-500">продукции</span></>
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] lg:text-[12.5px] font-medium leading-relaxed">
                {currentCategoryDescription}
              </p>
            </div>

            {/* Found products stat info and sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 shrink-0 mt-1 lg:mt-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Найдено: <span className="text-[#2c3b6e] dark:text-blue-400 font-bold">{filteredProducts.length}</span>
              </span>

              {!loading && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Сортировка:</span>
                  <div className="relative flex items-center">
                    <select 
                      value={sortBy} 
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }} 
                      className="bg-transparent border-0 p-0 pr-5 text-[11px] font-semibold outline-none text-[#2c3b6e] dark:text-blue-400 appearance-none cursor-pointer uppercase tracking-wider focus:ring-0 leading-none h-4 -mt-[1px]"
                    >
                      {["Популярные", "Сначала дешевле", "Сначала дороже", "По названию"].map(opt => (
                        <option key={opt} value={opt} className="dark:bg-slate-900 uppercase">{opt.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0.5 flex items-center pointer-events-none">
                      <ChevronDown className="w-3 h-3 text-[#2c3b6e] dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Main Catalog Workspace ── */}
      <section id="catalog-workspace" className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* 1. Left Sidebar (Desktop always visible) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div 
              style={{ top: `${topOffset + 12}px`, maxHeight: `calc(100vh - ${topOffset + 32}px)` }}
              className="sticky z-20 overflow-y-auto overscroll-y-contain pr-2 pb-20 no-scrollbar"
            >
              {FilterContent}
            </div>
          </aside>

          {/* 2. Main content area (Desktop right side) */}
          <main className="flex-grow min-w-0">

            {/* Grid list of Products */}
            {!loading && currentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-100 dark:border-white/5 space-y-5">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center">
                  <Box className="w-6 h-6 opacity-80" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Товары не найдены</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-normal uppercase tracking-wide opacity-80">
                    Пожалуйста, сбросьте фильтры или выберите другую подкатегорию в меню.
                  </p>
                </div>
                {(activeFilters.length > 0 || selectedThicknesses.length > 0 || selectedSizes.length > 0) && (
                  <button 
                    onClick={() => {
                      setActiveFilters([]);
                      setSelectedThicknesses([]);
                      setSelectedSizes([]);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2.5 bg-[#2c3b6e] dark:bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-blue-500 transition-colors"
                  >
                    Сбросить все фильтры
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`grid-${categoryParam}-${sortBy}-${activeFilters.join(",")}-${selectedThicknesses.join(",")}-${selectedSizes.join(",")}-${currentPage}`}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3.5 lg:gap-4.5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <motion.div
                        key={`skeleton-${idx}`}
                        variants={itemVariants}
                        className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 flex flex-col h-full animate-pulse"
                      >
                        {/* Image Area Skeleton */}
                        <div className="aspect-square rounded-xl lg:rounded-[2rem] bg-slate-100 dark:bg-slate-800/85 mb-3 lg:mb-4 w-full" />
                        
                        {/* Content Area Skeleton */}
                        <div className="px-1 lg:px-2 pb-1 lg:pb-2 flex flex-col flex-grow space-y-3">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800/85 rounded w-3/4" />
                          <div className="space-y-1.5 pt-2">
                             <div className="flex justify-between">
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/4" />
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/3" />
                             </div>
                             <div className="flex justify-between">
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/4" />
                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800/85 rounded w-1/3" />
                             </div>
                          </div>
                          <div className="mt-auto pt-4 space-y-2">
                             <div className="h-8 bg-slate-100 dark:bg-slate-800/85 rounded-full w-full" />
                             <div className="h-10 bg-slate-100 dark:bg-slate-800/85 rounded-full w-full" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    currentProducts.map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard {...product} />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 flex flex-wrap justify-center gap-2 items-center pb-6">
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border shadow-none",
                    currentPage === 1 
                      ? "opacity-35 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:border-[#2c3b6e] dark:hover:border-blue-500"
                  )}
                >
                  Назад
                </button>

                {getPaginationButtons().map((p, idx) => (
                  p === '...' ? (
                    <button 
                      key={`dots-${idx}`} 
                      onClick={() => {
                        const target = idx === 1 ? Math.max(1, currentPage - 5) : Math.min(totalPages, currentPage + 5);
                        handlePageChange(target);
                      }}
                      className="px-2.5 text-slate-400 dark:text-slate-500 font-extrabold hover:text-[#2c3b6e] dark:hover:text-blue-400 transition-colors leading-none"
                      title="Пропустить 5 страниц"
                    >
                      ...
                    </button>
                  ) : (
                    <button 
                      key={`page-${p}`} 
                      onClick={() => handlePageChange(Number(p))} 
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold text-[10px] transition-all no-shadow", 
                        p === currentPage 
                          ? "bg-slate-900 dark:bg-blue-600 text-white" 
                          : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-400 hover:border-[#2c3b6e] dark:hover:border-blue-500 hover:text-[#2c3b6e] dark:hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  )
                ))}

                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-4 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border shadow-none",
                    currentPage === totalPages 
                      ? "opacity-35 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-400" 
                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-600 dark:text-white hover:border-[#2c3b6e] dark:hover:border-blue-500"
                  )}
                >
                  Вперед
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* ── 3. Mobile adaptive floating bottom button (strictly center) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden w-max max-w-[90vw]">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="bg-[#1a2544] dark:bg-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-wider shadow-2xl flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all duration-300 border border-white/10 whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Каталог и фильтры</span>
          {(activeFilters.length > 0 || selectedThicknesses.length > 0 || selectedSizes.length > 0) && (
            <span className="bg-[#f0a400] text-slate-950 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black ml-0.5 sm:ml-1">
              {(activeFilters.length + selectedThicknesses.length + selectedSizes.length)}
            </span>
          )}
        </button>
      </div>

      {/* ── 4. Mobile slide-out Drawer panel ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-40 flex justify-end pt-[72px] overflow-hidden pointer-events-none">
            {/* Blur backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto" 
              onClick={() => setIsFilterOpen(false)} 
            />
            {/* Sliding Content Container */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-[320px] h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl flex flex-col rounded-l-3xl border-l border-slate-100/50 dark:border-white/5 overflow-hidden pointer-events-auto"
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  <h2 className="font-semibold text-slate-800 dark:text-white tracking-widest text-xs uppercase">Фильтры</h2>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-grow no-scrollbar">
                {FilterContent}
              </div>
              
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20">
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl uppercase tracking-widest text-[10px] transition-colors shadow-lg shadow-slate-900/10 dark:shadow-none"
                >
                  Показать ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-900" />}>
      <CatalogContent />
    </Suspense>
  );
}
