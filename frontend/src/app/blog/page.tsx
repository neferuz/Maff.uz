"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, ArrowRight, RefreshCw } from "lucide-center";
import { cn } from "@/lib/utils";

// Note: Using standard Lucide icons that are definitely in the project
import { 
  ChevronRight as ChevronIcon, 
  Calendar as CalendarIcon, 
  ArrowRight as ArrowIcon,
  RefreshCw as RefreshIcon
} from "lucide-react";

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/api/v1/pages/`);
        if (res.ok) {
          const allPages = await res.json();
          const blogPosts = allPages
            .filter((p: any) => p.slug.startsWith("post-"))
            .map((p: any) => ({
              ...p.content,
              slug: p.slug
            }));
          setPosts(blogPosts);
        }
      } catch (err) {
        console.error("Failed to fetch blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center transition-colors">
        <div className="w-10 h-10 border-4 border-[#2c3b6e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] pb-8 transition-colors duration-500">
      {/* ── Breadcrumbs ── */}
      <div className="w-full bg-white dark:bg-[#0f172a] border-b border-slate-50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Главная</Link>
            <ChevronIcon className="w-2.5 h-2.5" />
            <span className="text-slate-900 dark:text-white">Блог</span>
          </nav>
        </div>
      </div>

      {/* ── Hero Section ── (Reduced Spacing) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#2c3b6e] dark:text-[#4a5e9e] mb-2 block">Наш блог</span>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 leading-tight">
            Идеи и <span className="text-[#2c3b6e] dark:text-[#4a5e9e]">экспертиза</span>
          </h1>
          <p className="text-slate-400 dark:text-white/40 text-[11px] lg:text-xs font-medium max-w-lg mx-auto opacity-80">
            Советы по выбору напольных покрытий и тренды в интерьере от команды MAFF.
          </p>
        </div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-slate-400 dark:text-white/20 font-bold uppercase tracking-widest text-[10px]">Постов пока нет</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-[#2c3b6e] dark:hover:border-white/20 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={post.image || "https://images.unsplash.com/photo-1581850518616-bcb8186c34bb?q=80&w=2070&auto=format&fit=crop"} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white dark:bg-[#0f172a] border border-black/5 dark:border-white/5 rounded-md text-[7px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      {post.category || "Статья"}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-3">
                    <CalendarIcon className="w-2.5 h-2.5 text-[#2c3b6e]" />
                    {post.date}
                  </div>
                  
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 leading-snug group-hover:text-[#2c3b6e] dark:group-hover:text-[#4a5e9e] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-[10px] text-slate-400 dark:text-white/40 font-medium leading-relaxed opacity-80 mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-[#2c3b6e] transition-colors">Читать</span>
                    <ArrowIcon className="w-3.5 h-3.5 text-slate-200 dark:text-white/10 group-hover:text-[#2c3b6e] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
