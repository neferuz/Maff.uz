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
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import initialData from "@/data/home-page.json";

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
  const [activeTab, setActiveTab] = useState("hero"); // "hero", "about", "brands", "recommendations"
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prodSearch, setProdSearch] = useState("");
  const [prodResults, setProdResults] = useState<any[]>([]);
  const [isSearchingProds, setIsSearchingProds] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE_URL}/pages/home`);
        if (response.ok) {
          const result = await response.json();
          const content = JSON.parse(JSON.stringify(result.content));
          
          // Merge with initialData to ensure new sections exist if backend data is old
          const mergedData = {
            ...initialData,
            ...content,
            hero: { ...initialData.hero, ...content.hero },
            about: { ...initialData.about, ...content.about },
            brands: content.brands || initialData.brands,
            recommendations: content.recommendations || []
          };

          setData(mergedData);
          setOriginalData(JSON.parse(JSON.stringify(mergedData)));
        }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#2c3b6e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-24 text-left px-4">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                 <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Изменения успешно сохранены!</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 -mt-2">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">Редактор главной страницы</h1>
          <p className="text-[12px] text-[#4f566b]">Управление контентом maff.uz</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-lg transition-all shadow-none",
            isDirty 
              ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
              : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
          )}
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Сохранить изменения
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#f7f8f9] rounded-xl w-fit border border-[#e3e8ee]">
         {[
           { id: "hero", label: "Hero-баннер", icon: Layout },
           { id: "about", label: "О компании", icon: Info },
           { id: "brands", label: "Наши бренды", icon: Tag },
           { id: "recommendations", label: "Рекомендации", icon: Search }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-4 py-2 text-[12px] font-bold rounded-lg transition-all",
               activeTab === tab.id ? "bg-white text-[#2c3b6e] shadow-sm" : "text-[#4f566b] hover:text-[#1a1f36]"
             )}
           >
             <tab.icon className="w-3.5 h-3.5" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* --- HERO TAB --- */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
           <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
           
           <div className="space-y-6">
             <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-5 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Текстовый контент</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Бейдж</label>
                   <input type="text" value={data.hero?.badge || ""} onChange={(e) => setData({...data, hero: {...data.hero, badge: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Акцент</label>
                   <input type="text" value={data.hero?.highlightWord || ""} onChange={(e) => setData({...data, hero: {...data.hero, highlightWord: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                 </div>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                 <textarea rows={2} value={data.hero?.title || ""} onChange={(e) => setData({...data, hero: {...data.hero, title: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none" />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                 <textarea rows={3} value={data.hero?.subtitle || ""} onChange={(e) => setData({...data, hero: {...data.hero, subtitle: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none" />
               </div>
             </div>

             <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Кнопки действия</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-[#f7f8f9] rounded-lg space-y-2">
                    <p className="text-[10px] font-black uppercase text-[#4f566b]">Главная</p>
                    <input type="text" value={data.hero?.primaryButton?.text || ""} onChange={(e) => setData({...data, hero: {...data.hero, primaryButton: {...data.hero.primaryButton, text: e.target.value}}})} className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none" />
                    <input type="text" value={data.hero?.primaryButton?.link || ""} onChange={(e) => setData({...data, hero: {...data.hero, primaryButton: {...data.hero.primaryButton, link: e.target.value}}})} className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none" />
                 </div>
                 <div className="p-3 bg-[#f7f8f9] rounded-lg space-y-2">
                    <p className="text-[10px] font-black uppercase text-[#4f566b]">Вторичная</p>
                    <input type="text" value={data.hero?.secondaryButton?.text || ""} onChange={(e) => setData({...data, hero: {...data.hero, secondaryButton: {...data.hero.secondaryButton, text: e.target.value}}})} className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none" />
                    <input type="text" value={data.hero?.secondaryButton?.link || ""} onChange={(e) => setData({...data, hero: {...data.hero, secondaryButton: {...data.hero.secondaryButton, link: e.target.value}}})} className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none" />
                 </div>
               </div>
             </div>
           </div>

           <div className="space-y-6">
             <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <ImageIcon className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Галерея изображений</h3>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold shadow-none">
                     {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                     Загрузить
                  </button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {data.hero?.images?.map((imgObj: any, idx: number) => {
                    const imgUrl = typeof imgObj === "string" ? imgObj : imgObj.url;
                    const imgLink = typeof imgObj === "string" ? "" : (imgObj.link || "");
                    return (
                      <div key={idx} className="flex flex-col gap-2 relative group p-2 border border-[#e3e8ee] rounded-xl bg-[#f7f8f9]">
                        <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-white border border-[#e3e8ee]">
                           <img src={imgUrl} alt="Hero" className="w-full h-full object-cover" />
                           <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-md text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-all shadow-none">
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <input 
                          type="text" 
                          value={imgLink} 
                          onChange={(e) => updateImageLink(idx, e.target.value)} 
                          placeholder="Ссылка (например, /catalog?category=418)" 
                          className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded text-[11px] outline-none" 
                        />
                      </div>
                    );
                  })}
               </div>
             </div>

             <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-4 shadow-none">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <CheckCircle2 className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Преимущества</h3>
                  </div>
                  <button onClick={addFeature} className="p-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-md transition-all shadow-none">
                     <Plus className="w-3.5 h-3.5" />
                  </button>
               </div>
               <div className="grid grid-cols-1 gap-1.5">
                  {data.hero?.features?.map((feature: any, idx: number) => {
                    const CurrentIcon = availableIcons.find(i => i.name === feature.icon)?.icon || CheckCircle2;
                    return (
                      <div key={idx} className="flex items-center gap-2.5 p-1.5 bg-[#f7f8f9] rounded-lg border border-transparent hover:border-[#e3e8ee] transition-all group">
                         <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-[#e3e8ee] cursor-pointer hover:border-[#2c3b6e] transition-all shadow-sm">
                               <CurrentIcon className="w-4 h-4 text-[#2c3b6e]" />
                            </div>
                            <div className="absolute top-0 left-10 z-50 bg-white border border-[#e3e8ee] p-1.5 rounded-xl grid grid-cols-5 gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all shadow-2xl min-w-[180px]">
                               {availableIcons.map(iconObj => (
                                  <button key={iconObj.name} onClick={() => updateFeatureIcon(idx, iconObj.name)} className={cn("p-1.5 rounded-lg hover:bg-[#f7f8f9] transition-colors", feature.icon === iconObj.name ? "bg-[#2c3b6e] text-white" : "text-[#4f566b]")}>
                                     <iconObj.icon className="w-3.5 h-3.5" />
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div className="flex-1">
                           <input type="text" value={feature.text} onChange={(e) => updateFeatureText(idx, e.target.value)} className="w-full bg-transparent text-[12px] font-bold text-[#1a1f36] outline-none" />
                         </div>
                         <button onClick={() => removeFeature(idx)} className="p-1.5 text-[#cd5c5c] opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-6 shadow-none">
              <div className="flex items-center gap-2 mb-2">
                 <Info className="w-4 h-4 text-[#2c3b6e]" />
                 <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Раздел «О компании»</h3>
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок раздела</label>
                 <input type="text" value={data.about?.title || ""} onChange={(e) => setData({...data, about: {...data.about, title: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                 <textarea rows={4} value={data.about?.description || ""} onChange={(e) => setData({...data, about: {...data.about, description: e.target.value}})} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none leading-relaxed" />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Статистика</label>
                 <div className="grid grid-cols-3 gap-4">
                    {data.about?.stats?.map((stat: any, idx: number) => (
                       <div key={idx} className="p-4 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl space-y-2">
                          <input type="text" value={stat.value} onChange={(e) => updateStatValue(idx, e.target.value)} className="w-full bg-transparent text-xl font-black text-[#2c3b6e] outline-none" placeholder="20+" />
                          <input type="text" value={stat.label} onChange={(e) => updateStatLabel(idx, e.target.value)} className="w-full bg-transparent text-[10px] font-bold text-[#4f566b] uppercase outline-none" placeholder="Лет опыта" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- BRANDS TAB --- */}
      {activeTab === "brands" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-6 shadow-none">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#2c3b6e]" />
                    <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Список брендов</h3>
                 </div>
                 <button onClick={addBrand} className="flex items-center gap-2 px-3 py-1 bg-[#2c3b6e] text-white hover:bg-[#232f58] rounded-lg transition-all text-[11px] font-bold shadow-none">
                    <Plus className="w-3.5 h-3.5" />
                    Добавить
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {data.brands?.map((brand: any, idx: number) => {
                    const name = typeof brand === 'string' ? brand : (brand?.name || "");
                    const link = typeof brand === 'string' ? "" : (brand?.link || "");
                    return (
                      <div key={idx} className="group relative bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-4 transition-all hover:border-[#2c3b6e] space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#2c3b6e] uppercase tracking-wider">Бренд #{idx + 1}</span>
                            <button onClick={() => removeBrand(idx)} className="p-1 text-[#cd5c5c] hover:bg-[#cd5c5c]/10 rounded transition-colors shadow-none">
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                         <div className="space-y-2">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-wider">Название</label>
                               <input 
                                 type="text" 
                                 value={name} 
                                 onChange={(e) => updateBrandField(idx, "name", e.target.value)} 
                                 className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[12px] font-bold text-[#1a1f36] outline-none" 
                                 placeholder="COSWICK"
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-wider">Ссылка</label>
                               <input 
                                 type="text" 
                                 value={link} 
                                 onChange={(e) => updateBrandField(idx, "link", e.target.value)} 
                                 className="w-full px-2.5 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[12px] font-medium text-slate-500 outline-none" 
                                 placeholder="/catalog?brand=COSWICK"
                               />
                            </div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* --- RECOMMENDATIONS TAB --- */}
      {activeTab === "recommendations" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
           <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-6 shadow-none">
              <div className="flex items-center gap-2 mb-2">
                 <Search className="w-4 h-4 text-[#2c3b6e]" />
                 <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Настройка рекомендаций</h3>
              </div>

              {/* Search Bar */}
              <div className="space-y-2 relative">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Добавить товар в рекомендации</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Введите название или артикул для поиска..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[13px] outline-none focus:border-[#2c3b6e]/30"
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    {isSearchingProds && (
                      <RefreshCw className="absolute right-3.5 top-3 w-4 h-4 text-[#2c3b6e] animate-spin" />
                    )}
                 </div>

                 {/* Results dropdown */}
                 {prodResults.length > 0 && (
                   <div className="absolute left-0 right-0 mt-1 bg-white border border-[#e3e8ee] rounded-xl shadow-xl max-h-[300px] overflow-y-auto z-50">
                      {prodResults.map(p => {
                        const isAlreadyAdded = (data.recommendations || []).includes(p.id);
                        return (
                          <div 
                            key={p.id}
                            onClick={() => !isAlreadyAdded && addRecommendation(p.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 transition-colors border-b border-[#f7f8f9] last:border-0",
                              isAlreadyAdded ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-[#f7f8f9] cursor-pointer"
                            )}
                          >
                             {p.image_url ? (
                               <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-50 border" />
                             ) : (
                               <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center text-slate-400 text-[10px]">No pix</div>
                             )}
                             <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold text-[#1a1f36] truncate">{p.name}</p>
                                <p className="text-[10px] text-[#4f566b] font-medium">{p.brand || "Maff"} • {p.price?.toLocaleString()} сум</p>
                             </div>
                             {isAlreadyAdded ? (
                               <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Добавлен</span>
                             ) : (
                               <span className="text-[9px] font-bold text-[#2c3b6e] uppercase bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Выбрать</span>
                             )}
                          </div>
                        );
                      })}
                   </div>
                 )}
              </div>

              {/* Selected List */}
              <div className="space-y-3 pt-4 border-t border-[#f7f8f9]">
                 <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest block mb-1">Выбранные товары для главной страницы ({recommendedProducts.length})</label>
                 
                 {recommendedProducts.length === 0 ? (
                   <div className="py-8 text-center border-2 border-dashed border-[#e3e8ee] rounded-2xl">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Нет выбранных товаров</p>
                      <p className="text-[10px] text-[#4f566b] mt-1">Используйте поиск выше, чтобы добавить товары в рекомендации</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-2.5">
                      {recommendedProducts.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-[#f7f8f9] border border-[#e3e8ee] hover:border-[#2c3b6e] rounded-xl transition-all group">
                           <span className="text-[10px] font-black text-slate-400 w-4">{idx + 1}</span>
                           {p.image_url ? (
                             <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-white border" />
                           ) : (
                             <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-slate-400 text-[10px]">No pix</div>
                           )}
                           <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-[#1a1f36] truncate">{p.name}</p>
                              <p className="text-[10px] text-[#4f566b] font-medium">{p.brand || "Maff"} • {p.price?.toLocaleString()} сум</p>
                           </div>
                           <button onClick={() => removeRecommendation(p.id)} className="p-2 text-[#cd5c5c] hover:bg-[#cd5c5c]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-4 h-4" />
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
