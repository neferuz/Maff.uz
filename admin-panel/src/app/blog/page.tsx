"use client";
import { toast } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Calendar, 
  ExternalLink,
  RefreshCw,
  Trash2,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogListAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/v1/pages/");
      if (res.ok) {
        const allPages = await res.json();
        const blogPosts = allPages
          .filter((p: any) => p.slug.startsWith("post-"))
          .map((p: any) => ({
            id: p.id,
            slug: p.slug,
            ...p.content
          }));
        setPosts(blogPosts);
      }
    } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
      console.error("Failed to fetch blog posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Блог</h1>
          <p className="text-[14px] text-[#4f566b]">Управление статьями, новостями и полезными советами.</p>
        </div>
        <Link 
          href="/blog/new"
          className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all shadow-none"
        >
          <Plus className="w-4 h-4" />
          Создать статью
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#f8f9fa] p-4 rounded-[2rem] border border-[#e3e8ee]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b]" />
          <input 
            type="text"
            placeholder="Поиск по статьям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#e3e8ee] rounded-xl pl-11 pr-4 py-2.5 text-[13px] outline-none focus:border-[#2c3b6e]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-xl hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
              Фильтры
           </button>
           <button onClick={fetchPosts} className="p-2.5 text-[#4f566b] bg-white border border-[#e3e8ee] rounded-xl hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Posts Table/Grid */}
      <div className="bg-white border border-[#e3e8ee] rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#e3e8ee]">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-tight text-[#1a1f36]">Статья</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-tight text-[#1a1f36]">Категория</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-tight text-[#1a1f36]">Дата</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-tight text-[#1a1f36]">Статус</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-tight text-[#1a1f36] text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {filteredPosts.map((post) => (
                <tr key={post.slug} className="group hover:bg-[#f8f9fa] transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#e3e8ee] bg-slate-50">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#1a1f36] line-clamp-1">{post.title}</p>
                        <p className="text-[12px] text-[#4f566b] font-medium tracking-tight">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-[#2c3b6e]/5 text-[#2c3b6e] text-[10px] font-black uppercase tracking-widest rounded-full">
                      {post.category || "Общее"}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[13px] text-[#4f566b]">
                      <Calendar className="w-3.5 h-3.5 opacity-40" />
                      {post.date || "2024-05-11"}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       <span className="text-[12px] font-bold text-[#1a1f36]">Опубликовано</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="p-2 text-[#4f566b] hover:text-[#2c3b6e] hover:bg-white rounded-lg border border-transparent hover:border-[#e3e8ee] transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <a 
                        href={`http://localhost:3000/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-[#4f566b] hover:text-[#2c3b6e] hover:bg-white rounded-lg border border-transparent hover:border-[#e3e8ee] transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-slate-200" />
                      <p className="text-[14px] font-bold text-slate-400">Статьи не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
