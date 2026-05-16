"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  RefreshCw,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Type,
  ArrowLeft,
  ChevronRight,
  Eye,
  FileText,
  Sparkles,
  Check,
  X,
  Tag,
  AlignLeft,
  Clock,
  User,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function BlogEditor() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const isNew = slug === "new";

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [data, setData] = useState<any>({
    title: "",
    excerpt: "",
    date: new Date().toISOString().split('T')[0],
    image: "",
    category: "Тренды",
    sections: [
      { type: "text", content: "" }
    ]
  });

  const [originalData, setOriginalData] = useState<any>(null);
  const [currentSlug, setCurrentSlug] = useState(isNew ? "" : (slug as string));

  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    } else {
      setOriginalData(JSON.parse(JSON.stringify(data)));
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/v1/pages/${slug}`);
      if (res.ok) {
        const result = await res.json();
        const content = result.content || {
          title: "",
          excerpt: "",
          date: new Date().toISOString().split('T')[0],
          image: "",
          category: "Тренды",
          sections: [{ type: "text", content: "" }]
        };
        setData(content);
        setOriginalData(JSON.parse(JSON.stringify(content)));
        setCurrentSlug(result.slug);
      }
    } catch (err) {
      console.error("Failed to fetch blog post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalSlug = isNew ? `post-${currentSlug.replace(/^post-/, '')}` : currentSlug;
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/pages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          slug: finalSlug,
          content: data
        }),
      });

      if (res.ok) {
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        if (isNew) {
          router.push(`/blog/${finalSlug}`);
        }
      } else {
        setErrorMsg("Не удалось сохранить статью");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = (type: "text" | "image") => {
    const newSection = type === "text" ? { type: "text", content: "" } : { type: "image", url: "", caption: "" };
    setData({ ...data, sections: [...data.sections, newSection] });
  };

  const removeSection = (idx: number) => {
    setData({ ...data, sections: data.sections.filter((_: any, i: number) => i !== idx) });
  };

  const updateSection = (idx: number, field: string, value: any) => {
    const newSections = [...data.sections];
    newSections[idx] = { ...newSections[idx], [field]: value };
    setData({ ...data, sections: newSections });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string, idx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/uploads/", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        if (target === "main") {
          setData({ ...data, image: result.url });
        } else if (target === "section" && idx !== undefined) {
          updateSection(idx, "url", result.url);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const applyFormat = (idx: number, tag: string) => {
    const textarea = document.getElementById(`section-${idx}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = data.sections[idx].content;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}<${tag}>${selected}</${tag}>${after}`;
    updateSection(idx, "content", newText);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
    </div>
  );

  return (
    <div className="relative space-y-6 animate-in fade-in duration-700 pb-24 text-left px-4">
      
      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#1a1f36] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl border border-white/10">
              <div className="w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center">
                 <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
              </div>
              <span className="text-[13px] font-bold tracking-tight">Статья успешно сохранена!</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 -mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">
            <Link href="/blog" className="hover:text-[#2c3b6e] transition-colors">Блог</Link>
            <ChevronRight className="w-2.5 h-2.5 opacity-30" />
            <span className="text-[#1a1f36]">Редактор статьи</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight">
            {isNew ? "Создание новой статьи" : data.title || "Редактирование"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <a 
              href={`http://localhost:3000/blog/${currentSlug}`} 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all"
            >
              <Eye className="w-3.5 h-3.5 opacity-40" />
              Предпросмотр
            </a>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-[13px] font-bold rounded-lg transition-all shadow-none",
              isDirty 
                ? "bg-[#2c3b6e] text-white hover:bg-[#232f58] cursor-pointer" 
                : "bg-[#f7f8f9] text-[#a3acb9] cursor-not-allowed border border-[#e3e8ee]"
            )}
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Сохранить статью
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
         
         {/* Left Side: Editor Content */}
         <div className="lg:col-span-8 space-y-6">
            
            {/* Title & Excerpt */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-5 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Основная информация</h3>
               </div>
               
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Заголовок статьи</label>
                  <textarea 
                    value={data.title} 
                    onChange={(e) => setData({...data, title: e.target.value})} 
                    rows={2}
                    placeholder="Заголовок, который зацепит читателя..."
                    className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[15px] font-bold text-[#1a1f36] outline-none focus:bg-white focus:border-[#2c3b6e]/20 transition-all resize-none" 
                  />
               </div>

               {isNew && (
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Адрес (Slug)</label>
                     <div className="flex items-center bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl px-4 py-2.5">
                        <span className="text-slate-400 text-[13px] font-medium mr-1">post-</span>
                        <input 
                          value={currentSlug} 
                          onChange={(e) => setCurrentSlug(e.target.value)}
                          className="flex-1 bg-transparent border-none p-0 text-[13px] font-bold text-[#1a1f36] outline-none"
                          placeholder="nazvanie-stati"
                        />
                     </div>
                  </div>
               )}

               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Краткий анонс</label>
                  <textarea 
                    value={data.excerpt} 
                    onChange={(e) => setData({...data, excerpt: e.target.value})} 
                    rows={3}
                    placeholder="Пара предложений для превью в списке статей..."
                    className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[13px] font-medium text-[#4f566b] outline-none focus:bg-white transition-all resize-none leading-relaxed" 
                  />
               </div>
            </div>

            {/* Dynamic Sections */}
            <div className="space-y-5">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                     <AlignLeft className="w-4 h-4 text-[#2c3b6e]" />
                     <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Контент статьи</h3>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => addSection("text")} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e3e8ee] text-[#2c3b6e] hover:bg-slate-50 rounded-lg transition-all text-[11px] font-bold uppercase tracking-widest">
                        <Plus className="w-3 h-3" /> Текст
                     </button>
                     <button onClick={() => addSection("image")} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e3e8ee] text-[#2c3b6e] hover:bg-slate-50 rounded-lg transition-all text-[11px] font-bold uppercase tracking-widest">
                        <ImageIcon className="w-3 h-3" /> Фото
                     </button>
                  </div>
               </div>

               <div className="space-y-5">
                  {data.sections.map((section: any, idx: number) => (
                    <div key={idx} className="bg-white border border-[#e3e8ee] rounded-xl p-5 relative group transition-all hover:border-[#2c3b6e]/20">
                       <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f7f8f9]">
                          <div className="flex items-center gap-2 text-[#4f566b]">
                             {section.type === "text" ? <Type className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                             <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Блок {idx + 1} — {section.type === "text" ? "Текстовый" : "Изображение"}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {section.type === "text" && (
                                <div className="flex gap-1 mr-2 border-r border-[#e3e8ee] pr-2">
                                   <button onClick={() => applyFormat(idx, "b")} className="w-7 h-7 flex items-center justify-center bg-white border border-[#e3e8ee] rounded-md text-[11px] font-black hover:bg-[#2c3b6e] hover:text-white transition-all">B</button>
                                   <button onClick={() => applyFormat(idx, "i")} className="w-7 h-7 flex items-center justify-center bg-white border border-[#e3e8ee] rounded-md text-[11px] font-black italic hover:bg-[#2c3b6e] hover:text-white transition-all">I</button>
                                </div>
                             )}
                             <button onClick={() => removeSection(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </div>

                       {section.type === "text" ? (
                          <textarea 
                            id={`section-${idx}`}
                            value={section.content} 
                            onChange={(e) => updateSection(idx, "content", e.target.value)}
                            rows={6}
                            placeholder="Начните писать здесь..."
                            className="w-full bg-transparent border-none p-0 text-[15px] text-[#4f566b] font-medium leading-[1.8] outline-none resize-none"
                          />
                       ) : (
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 items-start">
                             <div className="space-y-4">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Ссылка на изображение</label>
                                   <input value={section.url} onChange={(e) => updateSection(idx, "url", e.target.value)} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[12px] outline-none" placeholder="https://..." />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Подпись к фото</label>
                                   <input value={section.caption} onChange={(e) => updateSection(idx, "caption", e.target.value)} className="w-full bg-transparent border-none p-0 text-[12px] font-bold text-[#1a1f36] italic opacity-60 outline-none" placeholder="Добавьте описание..." />
                                </div>
                             </div>
                             <div className="aspect-square bg-[#f7f8f9] rounded-xl border border-dashed border-[#e3e8ee] flex flex-col items-center justify-center relative overflow-hidden group/upload">
                                {section.url ? (
                                   <img src={section.url} className="w-full h-full object-cover" />
                                ) : (
                                   <ImageIcon className="w-6 h-6 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                   <p className="text-[8px] font-bold text-white uppercase tracking-widest">Загрузить</p>
                                </div>
                                <input type="file" onChange={(e) => handleFileUpload(e, "section", idx)} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                          </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Side: Meta & Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            
            {/* Publication Settings */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 space-y-5 shadow-none">
               <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Параметры</h3>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Обложка статьи</label>
                  <div className="aspect-[16/10] bg-[#f7f8f9] rounded-xl border border-[#e3e8ee] flex flex-col items-center justify-center relative overflow-hidden group/cover">
                     {data.image ? (
                        <img src={data.image} className="w-full h-full object-cover" />
                     ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                     )}
                     <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Изменить обложку</p>
                     </div>
                     <input type="file" onChange={(e) => handleFileUpload(e, "main")} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <input value={data.image} onChange={(e) => setData({...data, image: e.target.value})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[11px] outline-none" placeholder="Или URL..." />
               </div>

               <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Категория</label>
                     <div className="relative">
                        <select value={data.category} onChange={(e) => setData({...data, category: e.target.value})} className="w-full appearance-none bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none cursor-pointer">
                           <option>Тренды</option>
                           <option>Советы</option>
                           <option>Новости</option>
                           <option>Интерьеры</option>
                        </select>
                        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] pointer-events-none" />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest ml-0.5">Дата публикации</label>
                     <div className="relative">
                        <input type="date" value={data.date} onChange={(e) => setData({...data, date: e.target.value})} className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg px-3 py-2 text-[13px] font-bold text-[#1a1f36] outline-none" />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] pointer-events-none" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-6 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Рекомендации</h3>
               </div>
               <div className="space-y-3">
                  {[
                    "Добавляйте качественные фото интерьеров",
                    "Разбивайте длинный текст на блоки",
                    "Выделяйте важные мысли жирным шрифтом",
                    "Проверяйте адаптивность заголовка"
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2 text-[11px] font-medium text-[#4f566b] leading-tight">
                       <Check className="w-3 h-3 text-green-500 mt-0.5" />
                       {tip}
                    </div>
                  ))}
               </div>
            </div>

            {/* Support */}
            <div className="bg-white border border-[#e3e8ee] rounded-xl p-5">
               <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#2c3b6e]" />
                  <h3 className="text-[12px] font-bold text-[#1a1f36] uppercase tracking-wider">Авторство</h3>
               </div>
               <p className="text-[11px] text-[#4f566b] leading-relaxed mb-4">
                  Статья будет опубликована от имени официального аккаунта MAFF Editorial.
               </p>
               <div className="pt-3 border-t border-[#f7f8f9]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Version 2.4.0</span>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
