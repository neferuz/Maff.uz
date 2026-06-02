"use client";
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
  Edit3,
  FileText as FileTextIcon,
  Check,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogListAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setErrorMsg("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
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
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2c3b6e] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileTextIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-[#1a1f36] tracking-tight leading-none">Блог</h1>
            <p className="text-[11px] text-[#4f566b] mt-0.5">Статьи и новости</p>
          </div>
        </div>
        <Link 
          href="/blog/new"
          className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-white bg-[#2c3b6e] rounded-lg hover:bg-[#232f58] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Создать
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
          <input 
            type="text"
            placeholder="Поиск по статьям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg pl-9 pr-4 py-2 text-[13px] outline-none focus:bg-white focus:border-[#2c3b6e] transition-all placeholder:text-[#c4cad4]"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all">
              <Filter className="w-3.5 h-3.5" />
              Фильтры
           </button>
           <button onClick={fetchPosts} className="p-2 text-[#4f566b] bg-white border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      {/* Posts Table/Grid */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#4f566b]">Статья</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#4f566b]">Категория</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#4f566b]">Дата</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#4f566b]">Статус</th>
                <th className="px-4 py-3 text-[10px] font-semibold tracking-wider text-[#4f566b] text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {filteredPosts.map((post) => (
                <tr key={post.slug} className="group hover:bg-[#f7f8f9] transition-all">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e3e8ee] bg-[#f7f8f9]">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a1f36] line-clamp-1">{post.title}</p>
                        <p className="text-[11px] text-[#a3acb9] font-medium">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 bg-[#2c3b6e]/10 text-[#2c3b6e] text-[10px] font-semibold tracking-wider rounded-md">
                      {post.category || "Общее"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#4f566b]">
                      <Calendar className="w-3.5 h-3.5 text-[#a3acb9]" />
                      {post.date || "2024-05-11"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                       <span className="text-[12px] font-semibold text-[#1a1f36]">Опубликовано</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="p-1.5 text-[#a3acb9] hover:text-[#2c3b6e] hover:bg-[#2c3b6e]/5 rounded-lg transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <a 
                        href={`http://localhost:3000/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#a3acb9] hover:text-[#2c3b6e] hover:bg-[#2c3b6e]/5 rounded-lg transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-[#e3e8ee]" />
                      <p className="text-[13px] font-semibold text-[#a3acb9]">Статьи не найдены</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {errorMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
           <div className="bg-[#cd5c5c] text-white px-5 py-2.5 rounded-xl flex items-center gap-2.5 border border-white/10">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-[12px] font-semibold">{errorMsg}</span>
           </div>
        </div>
      )}
    </div>
  );
}
