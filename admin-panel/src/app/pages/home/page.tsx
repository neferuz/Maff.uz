"use client";

import { 
  Save, 
  RefreshCw, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Layout, 
  CheckCircle2,
  Link as LinkIcon,
  Clock,
  ShieldCheck,
  Award,
  Star,
  Settings2,
  Upload,
  Truck,
  Zap,
  Gem,
  Heart,
  Smile,
  Wrench,
  Globe,
  MapPin,
  CreditCard,
  Headset,
  Check,
  Info,
  Tag,
  Search,
  Layers,
  ArrowUp,
  ArrowDown,
  Home as HomeIcon,
  DoorOpen,
  LayoutGrid,
  Square,
  Maximize,
  Box,
  Shapes,
  Hammer,
  Wind,
  Sparkles,
  Grid,
  HardHat,
  Brush,
  Paintbrush,
  Ruler,
  Construction,
  Flame,
  Sun,
  Compass,
  Scissors,
  PenTool,
  Pipette,
  Trees,
  Boxes,
  Warehouse,
  Sparkle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import initialData from "@/data/home-page.json";

const lucideMap: Record<string, any> = {
  Home: HomeIcon, DoorOpen, Layers, LayoutGrid, Square, Maximize, Layout, Box, Shapes, Hammer, Wind, Sparkles, Award,
  Wrench, Grid, HardHat, Brush, Paintbrush, Ruler, Construction, Flame, Sun, Compass, Scissors, ShieldCheck,
  PenTool, Pipette, Trees, Boxes, Warehouse, Smile, Heart, Sparkle, Gem
};

const categoryIcons = [Layers, LayoutGrid, Square, DoorOpen, Layout, Box, Shapes, Hammer, Wind, Sparkles];

interface CategoryIconProps {
  imageUrl?: string;
  index: number;
}

const CategoryIcon = ({ imageUrl, index }: CategoryIconProps) => {
  const defaultIcon = categoryIcons[index % categoryIcons.length] || Layers;
  
  if (!imageUrl) {
    const IconComp = defaultIcon;
    return <IconComp className="w-5 h-5 text-slate-400" />;
  }

  if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
    return <img src={imageUrl} alt="" className="w-full h-full object-cover" />;
  }

  const IconComp = lucideMap[imageUrl] || defaultIcon;
  return <IconComp className="w-5 h-5 text-slate-400" />;
};

const API_BASE_URL = "/api/v1";

const availableIcons = [
  { name: "CheckCircle2", icon: CheckCircle2 },
  { name: "Clock", icon: Clock },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Award", icon: Award },
  { name: "Star", icon: Star },
  { name: "Truck", icon: Truck },
  { name: "Zap", icon: Zap },
  { name: "Gem", icon: Gem },
  { name: "Heart", icon: Heart },
  { name: "Smile", icon: Smile },
  { name: "Wrench", icon: Wrench },
  { name: "Globe", icon: Globe },
  { name: "MapPin", icon: MapPin },
  { name: "CreditCard", icon: CreditCard },
  { name: "Headset", icon: Headset },
];

export default function HomePageEditor() {
  const [data, setData] = useState<any>(initialData);
  const [originalData, setOriginalData] = useState<any>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState("hero"); // "hero", "about", "brands", "recommendations", "categories"
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prodSearch, setProdSearch] = useState("");
  const [prodResults, setProdResults] = useState<any[]>([]);
  const [isSearchingProds, setIsSearchingProds] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    async function fetchData() {
      try {
        const [response, catResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/pages/home`),
          fetch(`${API_BASE_URL}/categories`)
        ]);

        let homeContent = {};
        if (response.ok) {
          const result = await response.json();
          homeContent = JSON.parse(JSON.stringify(result.content));
        }

        if (catResponse.ok) {
          const cats = await catResponse.json();
          setAllCategories(cats);
        }
        
        // Merge with initialData to ensure new sections exist if backend data is old
        const mergedData = {
          ...initialData,
          ...homeContent,
          hero: { ...initialData.hero, ...(homeContent as any).hero },
          about: { ...initialData.about, ...(homeContent as any).about },
          brands: (homeContent as any).brands || initialData.brands,
          recommendations: (homeContent as any).recommendations || [],
          categories: (homeContent as any).categories || initialData.categories || []
        };

        setData(mergedData);
        setOriginalData(JSON.parse(JSON.stringify(mergedData)));
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function loadRecommendedProducts() {
      const ids = data.recommendations || [];
      if (ids.length === 0) {
        setRecommendedProducts([]);
        return;
      }
      try {
        const responses = await Promise.all(
          ids.map((id: number) => fetch(`${API_BASE_URL}/products/${id}`))
        );
        const prods = [];
        for (const res of responses) {
          if (res.ok) {
            prods.push(await res.json());
          }
        }
        setRecommendedProducts(prods);
      } catch (err) {
        console.error("Failed to load recommended products details", err);
      }
    }
    loadRecommendedProducts();
  }, [data.recommendations]);

  useEffect(() => {
    if (!prodSearch.trim()) {
      setProdResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingProds(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products?q=${encodeURIComponent(prodSearch)}&limit=10`);
        if (response.ok) {
          const results = await response.json();
          setProdResults(results);
        }
      } catch (err) {
        console.error("Error searching products:", err);
      } finally {
        setIsSearchingProds(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [prodSearch]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "home", content: data })
      });
      if (response.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${API_BASE_URL}/uploads/`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        setData({
          ...data,
          hero: { ...data.hero, images: [...(data.hero.images || []), { url: result.url, link: "" }] }
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = data.hero.images.filter((_: any, i: number) => i !== index);
    setData({ ...data, hero: { ...data.hero, images: newImages } });
  };
  const updateImageLink = (index: number, link: string) => {
    const newImages = data.hero.images.map((img: any, i: number) => {
      if (i === index) {
        return typeof img === "string" ? { url: img, link } : { ...img, link };
      }
      return img;
    });
    setData({ ...data, hero: { ...data.hero, images: newImages } });
  };
  const addFeature = () => {
    const newFeature = { text: "Новое преимущество", icon: "CheckCircle2" };
    setData({ ...data, hero: { ...data.hero, features: [...data.hero.features, newFeature] } });
  };
  const removeFeature = (index: number) => {
    const newFeatures = data.hero.features.filter((_: any, i: number) => i !== index);
    setData({ ...data, hero: { ...data.hero, features: newFeatures } });
  };
  const updateFeatureIcon = (index: number, iconName: string) => {
    const newFeatures = data.hero.features.map((f: any, i: number) => i === index ? { ...f, icon: iconName } : f);
    setData({ ...data, hero: { ...data.hero, features: newFeatures } });
  };
  const updateFeatureText = (index: number, text: string) => {
    const newFeatures = data.hero.features.map((f: any, i: number) => i === index ? { ...f, text: text } : f);
    setData({ ...data, hero: { ...data.hero, features: newFeatures } });
  };

  // --- About Handlers ---
  const updateStatValue = (index: number, value: string) => {
    const newStats = data.about.stats.map((s: any, i: number) => i === index ? { ...s, value } : s);
    setData({ ...data, about: { ...data.about, stats: newStats } });
  };
  const updateStatLabel = (index: number, label: string) => {
    const newStats = data.about.stats.map((s: any, i: number) => i === index ? { ...s, label } : s);
    setData({ ...data, about: { ...data.about, stats: newStats } });
  };

  // --- Brands Handlers ---
  const updateBrandField = (index: number, field: "name" | "link", value: string) => {
    const newBrands = [...data.brands];
    const currentBrand = newBrands[index];
    if (typeof currentBrand === "string") {
      newBrands[index] = {
        name: field === "name" ? value : currentBrand,
        link: field === "link" ? value : ""
      };
    } else {
      newBrands[index] = {
        ...currentBrand,
        [field]: value
      };
    }
    setData({ ...data, brands: newBrands });
  };
  const addBrand = () => {
    setData({ ...data, brands: [...data.brands, { name: "НОВЫЙ БРЕНД", link: "" }] });
  };
  const removeBrand = (index: number) => {
    const newBrands = data.brands.filter((_: any, i: number) => i !== index);
    setData({ ...data, brands: newBrands });
  };

  // --- Recommendation Handlers ---
  const addRecommendation = (productId: number) => {
    const currentRecs = data.recommendations || [];
    if (currentRecs.includes(productId)) return;
    setData({
      ...data,
      recommendations: [...currentRecs, productId]
    });
    setProdSearch("");
    setProdResults([]);
  };

  const removeRecommendation = (productId: number) => {
    const currentRecs = data.recommendations || [];
    setData({
      ...data,
      recommendations: currentRecs.filter((id: number) => id !== productId)
    });
  };

  // --- Category Handlers ---
  const addHomeCategory = (categoryId: number) => {
    const currentCats = data.categories || [];
    if (currentCats.includes(categoryId)) return;
    setData({
      ...data,
      categories: [...currentCats, categoryId]
    });
  };

  const removeHomeCategory = (categoryId: number) => {
    const currentCats = data.categories || [];
    setData({
      ...data,
      categories: currentCats.filter((id: number) => id !== categoryId)
    });
  };

  const moveHomeCategory = (index: number, direction: "up" | "down") => {
    const currentCats = [...(data.categories || [])];
    if (direction === "up" && index > 0) {
      const temp = currentCats[index];
      currentCats[index] = currentCats[index - 1];
      currentCats[index - 1] = temp;
    } else if (direction === "down" && index < currentCats.length - 1) {
      const temp = currentCats[index];
      currentCats[index] = currentCats[index + 1];
      currentCats[index + 1] = temp;
    }
    setData({
      ...data,
      categories: currentCats
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#2c3b6e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative space-y-5 animate-in fade-in duration-500 pb-24 text-left">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 border border-white/10">
              <div className="w-4 h-4 bg-[#10b981] rounded-full flex items-center justify-center flex-shrink-0">
                 <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] font-semibold">Изменения сохранены</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <HomeIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Редактор главной страницы</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">maff.uz / home</p>
          </div>
          {isDirty && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md tracking-wider">Несохранено</span>
          )}
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#e3e8ee]">
         {[
           { id: "hero", label: "Hero-баннер", icon: Layout },
           { id: "about", label: "О компании", icon: Info },
           { id: "brands", label: "Бренды", icon: Tag },
           { id: "recommendations", label: "Рекомендации", icon: Search },
           { id: "categories", label: "Категории", icon: Layers }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-all border-b-2 -mb-px",
               activeTab === tab.id
                 ? "border-[#2c3b6e] text-[#2c3b6e]"
                 : "border-transparent text-[#4f566b] hover:text-[#1a1f36] hover:border-[#e3e8ee]"
             )}
           >
             <tab.icon className="w-3.5 h-3.5" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* --- HERO TAB --- */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start animate-in fade-in duration-300">
           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
           
           <div className="space-y-4">
             <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                  <div>
                    <h3 className="text-[11px] font-bold text-[#1a1f36]">Текстовый контент</h3>
                    <p className="text-[10px] text-[#a3acb9] mt-0.5">Заголовки и текст главного баннера</p>
                  </div>
               </div>
               <div className="p-4 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Бейдж</label>
                   <input type="text" value={data.hero?.badge || ""} placeholder="Напр: Более 500 брендов" onChange={(e) => setData({...data, hero: {...data.hero, badge: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                   <p className="text-[10px] text-[#a3acb9]">Маленький тег над заголовком</p>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Акцент-слово</label>
                   <input type="text" value={data.hero?.highlightWord || ""} placeholder="Напр: качество" onChange={(e) => setData({...data, hero: {...data.hero, highlightWord: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                   <p className="text-[10px] text-[#a3acb9]">Слово в заголовке выделяется цветом</p>
                 </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Заголовок</label>
                 <textarea rows={2} value={data.hero?.title || ""} placeholder="Напр: Лучшие напольные покрытия в Ташкенте" onChange={(e) => setData({...data, hero: {...data.hero, title: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none placeholder:text-[#c4cad4]" />
                 <p className="text-[10px] text-[#a3acb9]">Главный крупный текст баннера</p>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                 <textarea rows={3} value={data.hero?.subtitle || ""} placeholder="Краткое описание компании или акции..." onChange={(e) => setData({...data, hero: {...data.hero, subtitle: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none placeholder:text-[#c4cad4]" />
                 <p className="text-[10px] text-[#a3acb9]">Подзаголовок под основным текстом</p>
               </div>
               </div>
             </div>

             <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                  <div>
                    <h3 className="text-[11px] font-bold text-[#1a1f36]">Кнопки действия</h3>
                    <p className="text-[10px] text-[#a3acb9] mt-0.5">Кнопки на главном баннере</p>
                  </div>
               </div>
               <div className="p-4">
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[#2c3b6e]">Основная кнопка</p>
                    <input type="text" placeholder="Напр: Смотреть каталог" value={data.hero?.primaryButton?.text || ""} onChange={(e) => setData({...data, hero: {...data.hero, primaryButton: {...data.hero.primaryButton, text: e.target.value}}})} className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                    <input type="text" placeholder="/catalog" value={data.hero?.primaryButton?.link || ""} onChange={(e) => setData({...data, hero: {...data.hero, primaryButton: {...data.hero.primaryButton, link: e.target.value}}})} className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[11px] text-[#4f566b] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                 </div>
                 <div className="p-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[#4f566b]">Вторичная кнопка</p>
                    <input type="text" placeholder="Напр: Связаться с нами" value={data.hero?.secondaryButton?.text || ""} onChange={(e) => setData({...data, hero: {...data.hero, secondaryButton: {...data.hero.secondaryButton, text: e.target.value}}})} className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[12px] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                    <input type="text" placeholder="/contacts" value={data.hero?.secondaryButton?.link || ""} onChange={(e) => setData({...data, hero: {...data.hero, secondaryButton: {...data.hero.secondaryButton, link: e.target.value}}})} className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[11px] text-[#4f566b] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
                 </div>
               </div>
               </div>
             </div>
           </div>

           <div className="space-y-4">
             <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                     <div>
                       <h3 className="text-[11px] font-bold text-[#1a1f36]">Галерея изображений</h3>
                       <p className="text-[10px] text-[#a3acb9] mt-0.5">Слайды баннера на главной странице</p>
                     </div>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold">
                     {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                     Загрузить
                  </button>
               </div>
               <div className="p-4 grid grid-cols-2 gap-3">
                  {data.hero?.images?.map((imgObj: any, idx: number) => {
                    const imgUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
                    const imgLink = typeof imgObj === "string" ? "" : (imgObj.link || "");
                    return (
                      <div key={idx} className="flex flex-col gap-2 relative group border border-[#e3e8ee] rounded-lg overflow-hidden bg-[#f7f8f9]">
                        <div className="relative aspect-[16/10] overflow-hidden bg-white">
                           <img src={imgUrl} alt="Hero" className="w-full h-full object-cover" />
                           <button onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 p-1.5 bg-white rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all border border-[#e3e8ee]">
                              <Trash2 className="w-3 h-3" />
                           </button>
                        </div>
                        <div className="mx-2 mb-2 space-y-0.5">
                          <p className="text-[9px] font-semibold text-[#a3acb9]">Ссылка при клике</p>
                          <input 
                            type="text" 
                            value={imgLink} 
                            onChange={(e) => updateImageLink(idx, e.target.value)} 
                            placeholder="/catalog или оставьте пустым" 
                            className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[11px] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" 
                          />
                        </div>
                      </div>
                    );
                  })}
               </div>
             </div>

             <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
               <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                     <div>
                       <h3 className="text-[11px] font-bold text-[#1a1f36]">Преимущества</h3>
                       <p className="text-[10px] text-[#a3acb9] mt-0.5">Иконка + текст — видны под баннером</p>
                     </div>
                  </div>
                  <button onClick={addFeature} className="p-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all">
                     <Plus className="w-3.5 h-3.5" />
                  </button>
               </div>
               <div className="p-3 space-y-1">
                  {data.hero?.features?.map((feature: any, idx: number) => {
                    const CurrentIcon = availableIcons.find(i => i.name === feature.icon)?.icon || CheckCircle2;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-[#f7f8f9] rounded-lg border border-transparent hover:border-[#e3e8ee] transition-all group">
                         <div className="relative flex-shrink-0">
                            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e] transition-all">
                               <CurrentIcon className="w-3.5 h-3.5 text-[#2c3b6e]" />
                            </div>
                            <div className="absolute top-0 left-9 z-50 bg-white border border-[#e3e8ee] p-2 rounded-xl grid grid-cols-5 gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all min-w-[180px]">
                               {availableIcons.map(iconObj => (
                                  <button key={iconObj.name} onClick={() => updateFeatureIcon(idx, iconObj.name)} className={cn("p-1.5 rounded-lg hover:bg-[#f7f8f9] transition-colors", feature.icon === iconObj.name ? "bg-[#2c3b6e] text-white" : "text-[#4f566b]")}>
                                     <iconObj.icon className="w-3 h-3" />
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div className="flex-1">
                           <input type="text" value={feature.text} onChange={(e) => updateFeatureText(idx, e.target.value)} className="w-full bg-transparent text-[12px] font-semibold text-[#1a1f36] outline-none" />
                         </div>
                         <button onClick={() => removeFeature(idx)} className="p-1 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity rounded">
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    );
                  })}
               </div>
             </div>
           </div>
        </div>
      )}

      {/* --- ABOUT TAB --- */}
      {activeTab === "about" && (
        <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                 <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                 <div>
                   <h3 className="text-[11px] font-bold text-[#1a1f36]">Раздел «О компании»</h3>
                   <p className="text-[10px] text-[#a3acb9] mt-0.5">Текст и цифры в блоке «О нас» на главной</p>
                 </div>
              </div>
              <div className="p-5 space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Заголовок раздела</label>
                 <input type="text" value={data.about?.title || ""} placeholder="Напр: О компании Maff" onChange={(e) => setData({...data, about: {...data.about, title: e.target.value}})} className="w-full px-3 py-2.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Описание</label>
                 <textarea rows={4} value={data.about?.description || ""} placeholder="Напишите несколько предложений о компании..." onChange={(e) => setData({...data, about: {...data.about, description: e.target.value}})} className="w-full px-3 py-2.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all resize-none leading-relaxed placeholder:text-[#c4cad4]" />
              </div>

              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Цифры и статистика</label>
                   <span className="text-[10px] text-[#a3acb9]">Кликните на поле и изменяйте</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {data.about?.stats?.map((stat: any, idx: number) => (
                       <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl space-y-1.5 hover:border-[#2c3b6e] transition-colors group">
                          <input type="text" value={stat.value} onChange={(e) => updateStatValue(idx, e.target.value)} className="w-full bg-transparent text-2xl font-black text-[#2c3b6e] outline-none" placeholder="20+" />
                          <input type="text" value={stat.label} onChange={(e) => updateStatLabel(idx, e.target.value)} className="w-full bg-transparent text-[10px] font-semibold text-[#4f566b] outline-none" placeholder="Лет опыта" />
                          <p className="text-[9px] text-[#c4cad4] hidden group-hover:block">Значение и подпись</p>
                       </div>
                    ))}
                 </div>
              </div>
              </div>
           </div>
        </div>
      )}

      {/* --- BRANDS TAB --- */}
      {activeTab === "brands" && (
        <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                    <div>
                      <h3 className="text-[11px] font-bold text-[#1a1f36]">Список брендов</h3>
                      <p className="text-[10px] text-[#a3acb9] mt-0.5">Бренды в бегущей строке на главной</p>
                    </div>
                 </div>
                 <button onClick={addBrand} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold">
                    <Plus className="w-3.5 h-3.5" />
                    Добавить
                 </button>
              </div>

              <div className="p-4 grid grid-cols-2 gap-3">
                 {data.brands?.map((brand: any, idx: number) => {
                    const name = typeof brand === 'string' ? brand : (brand?.name || "");
                    const link = typeof brand === 'string' ? "" : (brand?.link || "");
                    return (
                      <div key={idx} className="group relative bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg p-3 transition-all hover:border-[#2c3b6e] space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-[#2c3b6e] tracking-wider">#{idx + 1}</span>
                            <button onClick={() => removeBrand(idx)} className="p-1 text-[#cd5c5c] hover:bg-[#cd5c5c]/10 rounded-md transition-colors">
                               <Trash2 className="w-3 h-3" />
                            </button>
                         </div>
                         <input 
                           type="text" 
                           value={name} 
                           onChange={(e) => updateBrandField(idx, "name", e.target.value)} 
                           className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[12px] font-bold text-[#1a1f36] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" 
                           placeholder="COSWICK"
                         />
                         <input 
                           type="text" 
                           value={link} 
                           onChange={(e) => updateBrandField(idx, "link", e.target.value)} 
                           className="w-full px-2.5 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[11px] text-[#4f566b] outline-none focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]" 
                           placeholder="/catalog?brand=... (необязательно)"
                         />
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* --- RECOMMENDATIONS TAB --- */}
      {activeTab === "recommendations" && (
        <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                 <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                 <div>
                   <h3 className="text-[11px] font-bold text-[#1a1f36]">Рекомендуемые товары</h3>
                   <p className="text-[10px] text-[#a3acb9] mt-0.5">Товары в блоке «Рекомендуем» на главной странице</p>
                 </div>
              </div>
              <div className="p-4 space-y-4">

              {/* Search Bar */}
              <div className="space-y-1.5 relative">
                 <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Найти и добавить товар</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Введите название товара для поиска..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#a3acb9]" />
                    {isSearchingProds && (
                      <RefreshCw className="absolute right-3 top-2.5 w-4 h-4 text-[#2c3b6e] animate-spin" />
                    )}
                 </div>

                 {/* Results dropdown */}
                 {prodResults.length > 0 && (
                   <div className="absolute left-0 right-0 mt-1 bg-white border border-[#e3e8ee] rounded-xl max-h-[280px] overflow-y-auto z-50">
                      {prodResults.map(p => {
                        const isAlreadyAdded = (data.recommendations || []).includes(p.id);
                        return (
                          <div 
                            key={p.id}
                            onClick={() => !isAlreadyAdded && addRecommendation(p.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 transition-colors border-b border-[#f7f8f9] last:border-0",
                              isAlreadyAdded ? "opacity-40 cursor-not-allowed" : "hover:bg-[#f7f8f9] cursor-pointer"
                            )}
                          >
                             {p.image_url ? (
                               <img src={p.image_url} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-[#f7f8f9] border border-[#e3e8ee] flex-shrink-0" />
                             ) : (
                               <div className="w-9 h-9 rounded-lg bg-[#f7f8f9] border border-[#e3e8ee] flex items-center justify-center text-slate-300 flex-shrink-0"><ImageIcon className="w-4 h-4" /></div>
                             )}
                             <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-[#1a1f36] truncate">{p.name}</p>
                                <p className="text-[10px] text-[#4f566b]">{p.brand || "Maff"} · {p.price?.toLocaleString()} сум</p>
                             </div>
                             {isAlreadyAdded ? (
                               <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex-shrink-0">Добавлен</span>
                             ) : (
                               <span className="text-[9px] font-bold text-[#2c3b6e] bg-[#f0f3ff] px-2 py-0.5 rounded-md border border-[#d0d8f0] flex-shrink-0">+ Добавить</span>
                             )}
                          </div>
                        );
                      })}
                   </div>
                 )}
              </div>

              {/* Selected List */}
              <div className="space-y-2 pt-2 border-t border-[#e3e8ee]">
                 <div className="flex items-center justify-between mb-1">
                   <label className="text-[10px] font-semibold text-[#4f566b] tracking-wider">Выбранные товары</label>
                   <span className="text-[10px] font-bold text-[#2c3b6e] bg-[#f0f3ff] px-2 py-0.5 rounded-md">{recommendedProducts.length}</span>
                 </div>
                 
                 {recommendedProducts.length === 0 ? (
                   <div className="py-8 text-center border-2 border-dashed border-[#e3e8ee] rounded-xl">
                      <p className="text-[11px] font-semibold text-slate-400">Нет выбранных товаров</p>
                      <p className="text-[10px] text-[#a3acb9] mt-1">Используйте поиск выше</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-1.5">
                      {recommendedProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 bg-[#f7f8f9] border border-[#e3e8ee] hover:border-[#2c3b6e] rounded-lg transition-all group">
                           <span className="text-[10px] font-bold text-[#a3acb9] w-4 flex-shrink-0">{idx + 1}</span>
                           {p.image_url ? (
                             <img src={p.image_url} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-white border border-[#e3e8ee] flex-shrink-0" />
                           ) : (
                             <div className="w-9 h-9 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center text-slate-300 flex-shrink-0"><ImageIcon className="w-4 h-4" /></div>
                           )}
                           <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-[#1a1f36] truncate">{p.name}</p>
                              <p className="text-[10px] text-[#4f566b]">{p.brand || "Maff"} · {p.price?.toLocaleString()} сум</p>
                           </div>
                           <button onClick={() => removeRecommendation(p.id)} className="p-1.5 text-[#cd5c5c] hover:bg-[#cd5c5c]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
              </div>
           </div>
        </div>
      )}

      {/* --- CATEGORIES TAB --- */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start animate-in fade-in duration-300 max-w-6xl">
           {/* Left column: Selected Categories in order */}
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                 <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                 <h3 className="text-[11px] font-bold text-[#1a1f36]">Порядок категорий</h3>
              </div>

              <div className="p-3 space-y-1.5">
              {(data.categories || []).length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-[#e3e8ee] rounded-xl">
                   <p className="text-[11px] font-semibold text-slate-400">Нет выбранных категорий</p>
                   <p className="text-[10px] text-[#a3acb9] mt-1">Добавьте из списка справа</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                   {(data.categories || []).map((catId: number, idx: number) => {
                     const cat = allCategories.find(c => c.id === catId);
                     if (!cat) return null;
                     return (
                       <div key={cat.id} className="flex items-center gap-2.5 p-2.5 bg-[#f7f8f9] border border-[#e3e8ee] hover:border-[#2c3b6e] rounded-lg transition-all group">
                          <span className="text-[10px] font-bold text-[#a3acb9] w-4 flex-shrink-0">{idx + 1}</span>
                          
                          <div className="w-9 h-9 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center overflow-hidden flex-shrink-0">
                             <CategoryIcon imageUrl={cat.image_url} index={idx} />
                          </div>

                          <div className="flex-1 min-w-0">
                             <p className="text-[12px] font-semibold text-[#1a1f36] truncate">{cat.name}</p>
                          </div>

                          <div className="flex items-center gap-1">
                             <button 
                               onClick={() => moveHomeCategory(idx, "up")} 
                               disabled={idx === 0}
                               className={cn(
                                 "p-1 rounded-md border border-[#e3e8ee] transition-all bg-white",
                                 idx === 0 ? "opacity-30 cursor-not-allowed text-slate-300" : "text-[#2c3b6e] hover:bg-[#f7f8f9]"
                               )}
                             >
                                <ArrowUp className="w-3 h-3" />
                             </button>
                             <button 
                               onClick={() => moveHomeCategory(idx, "down")} 
                               disabled={idx === (data.categories || []).length - 1}
                               className={cn(
                                 "p-1 rounded-md border border-[#e3e8ee] transition-all bg-white",
                                 idx === (data.categories || []).length - 1 ? "opacity-30 cursor-not-allowed text-slate-300" : "text-[#2c3b6e] hover:bg-[#f7f8f9]"
                               )}
                             >
                                <ArrowDown className="w-3 h-3" />
                             </button>
                             <button 
                               onClick={() => removeHomeCategory(cat.id)} 
                               className="p-1 text-[#cd5c5c] hover:bg-[#cd5c5c]/10 rounded-md transition-all"
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </div>
                     );
                   })}
                </div>
              )}
              </div>
           </div>

           {/* Right column: Available main categories to add */}
           <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e3e8ee] bg-[#f7f8f9]">
                 <div className="w-1.5 h-4 bg-[#2c3b6e] rounded-full"></div>
                 <h3 className="text-[11px] font-bold text-[#1a1f36]">Доступные категории</h3>
              </div>

              <div className="p-3 space-y-1.5">
              {allCategories.filter(c => !c.parent_id && !(data.categories || []).includes(c.id)).length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-[#e3e8ee] rounded-xl">
                   <p className="text-[11px] font-semibold text-slate-400">Все категории добавлены</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 max-h-[500px] overflow-y-auto">
                   {allCategories
                     .filter(c => !c.parent_id && !(data.categories || []).includes(c.id))
                     .map((cat) => (
                       <div key={cat.id} className="flex items-center gap-2.5 p-2.5 bg-[#f7f8f9] border border-[#e3e8ee] hover:border-[#2c3b6e] rounded-lg transition-all group">
                          <div className="w-9 h-9 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center overflow-hidden flex-shrink-0">
                             <CategoryIcon imageUrl={cat.image_url} index={allCategories.indexOf(cat)} />
                          </div>

                          <div className="flex-1 min-w-0">
                             <p className="text-[12px] font-semibold text-[#1a1f36] truncate">{cat.name}</p>
                          </div>

                          <button 
                            onClick={() => addHomeCategory(cat.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-semibold flex-shrink-0"
                          >
                             <Plus className="w-3 h-3" />
                             Добавить
                          </button>
                       </div>
                     ))}
                </div>
              )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
