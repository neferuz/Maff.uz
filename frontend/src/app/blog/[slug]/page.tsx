"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, User, Share2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setIsExiting(false);
    // Auto close after 3 seconds with animation
    setTimeout(() => handleClose(), 3000);
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCopied(false);
      setIsExiting(false);
    }, 700); // match duration-700
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current post
        const res = await fetch(`/api/v1/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.content);
        }

        // Fetch all posts for "Related"
        const allRes = await fetch("/api/v1/pages/");
        if (allRes.ok) {
          const allPages = await allRes.json();
          const otherPosts = allPages
            .filter((p: any) => p.slug.startsWith("post-") && p.slug !== slug)
            .slice(0, 3)
            .map((p: any) => ({ ...p.content, slug: p.slug }));
          setRelatedPosts(otherPosts);
        }
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Статья не найдена</h1>
          <Link href="/blog" className="text-[#2c3b6e] font-black text-[10px] uppercase tracking-widest hover:underline">Вернуться в блог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ── Top Navigation ── */}
      <div className="w-full bg-white border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-slate-900 hover:text-[#2c3b6e] transition-all group">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Назад в блог</span>
          </Link>
          <div className="flex items-center gap-4">
             {showCopied && (
               <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                 {/* Backdrop */}
                 <div 
                   className={cn(
                     "absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity duration-700 ease-in-out",
                     isExiting ? "opacity-0" : "opacity-100"
                   )} 
                   onClick={handleClose} 
                 />
                 
                 {/* Modal Card */}
                 <div className={cn(
                   "relative bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-50 flex flex-col items-center text-center max-w-[280px] w-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform",
                   isExiting ? "scale-90 opacity-0 translate-y-8" : "scale-100 opacity-100 translate-y-0"
                 )}>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                       <div className="w-6 h-6 bg-[#2c3b6e] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#2c3b6e]/20">
                          <Share2 className="w-3 h-3" />
                       </div>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Готово</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] leading-relaxed">
                       Ссылка скопирована
                    </p>
                    <button 
                      onClick={handleClose}
                      className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2c3b6e] transition-all duration-300"
                    >
                       Закрыть
                    </button>
                 </div>
               </div>
             )}
             <button 
               onClick={handleShare}
               className="p-2 text-slate-400 hover:text-[#2c3b6e] transition-colors"
             >
               <Share2 className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-6 mt-10 lg:mt-16">
        {/* Main Content Column - Centered and More Compact */}
        <div className="space-y-8 lg:space-y-12">
          
          {/* Header Info */}
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-[#2c3b6e] text-[8px] font-black uppercase tracking-[0.2em] rounded-md">
                {post.category || "Экспертиза"}
              </span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{post.date || "2024-05-12"}</span>
            </div>
            
            <h1 className="text-2xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="MAFF" className="w-5 h-auto object-contain" />
               </div>
               <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Команда MAFF</span>
            </div>
          </header>

          {/* Main Image - More Contained */}
          <section className="aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 max-w-3xl mx-auto">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </section>

          {/* Article Sections */}
          <article className="space-y-6 lg:space-y-10 max-w-2xl mx-auto">
            {(post.sections || []).map((section: any, idx: number) => {
              if (section.type === "text") {
                return (
                  <div key={idx} className="prose prose-slate max-w-none">
                     <p className="text-slate-600 text-sm lg:text-[15px] font-medium leading-[1.7] opacity-90">
                       <span 
                         className="[&>b]:font-black [&>b]:text-slate-900 [&>i]:italic [&>i]:text-[#2c3b6e]"
                         dangerouslySetInnerHTML={{ __html: section.content }} 
                       />
                     </p>
                  </div>
                );
              }
              if (section.type === "image") {
                return (
                  <div key={idx} className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-100">
                      <img src={section.url} alt={section.caption} className="w-full h-auto" />
                    </div>
                    {section.caption && (
                      <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-[0.2em]">{section.caption}</p>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </article>
        </div>
      </div>

      {/* ── Related Section ── */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 mt-20 lg:mt-32 pt-16 border-t border-slate-100">
           <div className="mb-10 text-center">
              <span className="text-[10px] font-black text-[#2c3b6e] uppercase tracking-[0.3em] mb-4 block">Вам может быть интересно</span>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Читайте также</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((rp) => (
                 <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group cursor-pointer">
                    <div className="aspect-video rounded-2xl bg-slate-50 mb-4 overflow-hidden border border-slate-100">
                       <img src={rp.image} alt={rp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[8px] font-black text-[#2c3b6e] uppercase tracking-widest">{rp.category || "Статья"}</span>
                       <div className="w-1 h-1 rounded-full bg-slate-300" />
                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{rp.date}</span>
                    </div>
                    <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-[#2c3b6e] transition-colors line-clamp-2 leading-tight">{rp.title}</h4>
                 </Link>
              ))}
           </div>
        </section>
      )}
    </div>
  );
}
