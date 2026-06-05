"use client";
import { toast } from "react-hot-toast";
import { 
  Download,
  Search,
  Filter,
  ChevronRight,
  Bot,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function BotUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/v1/bot-users/");
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        }
      } catch (err) {
        toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
        console.error("Failed to fetch bot users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const term = searchQuery.toLowerCase();
    return (
      (user.first_name?.toLowerCase() || "").includes(term) ||
      (user.last_name?.toLowerCase() || "").includes(term) ||
      (user.username?.toLowerCase() || "").includes(term) ||
      String(user.telegram_id).includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1 flex items-center gap-2">
            Бот пользователи
          </h1>
          <p className="text-[14px] text-[#4f566b]">Управление клиентами из Telegram WebApp.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all no-shadow">
            <Download className="w-3.5 h-3.5" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
          <input 
            type="text" 
            placeholder="Поиск по имени, ID или @username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all no-shadow"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all no-shadow">
          <Filter className="w-3.5 h-3.5" />
          Фильтры
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden no-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Telegram ID</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Username</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Регистрация</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-8 h-8 border-3 border-slate-100 border-t-[#2c3b6e] rounded-full animate-spin mb-4" />
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Загрузка данных...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                          <Bot className="w-8 h-8" />
                       </div>
                       <h3 className="text-[16px] font-bold text-slate-900 mb-1">Список пуст</h3>
                       <p className="text-[12px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">Пока что никто не запускал Telegram-бота.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
                  const displayName = fullName || "Без имени";
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-tr from-[#2c3b6e] to-[#4a5e9e] rounded-full flex items-center justify-center text-white font-bold text-[12px]">
                            {initial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{displayName}</span>
                            <span className="text-[11px] text-[#4f566b] font-medium">{user.phone || "Нет телефона"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f7f8f9] text-[#4f566b]">
                          {user.telegram_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.username ? (
                          <a 
                            href={`https://t.me/${user.username}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[13px] font-semibold text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{user.username}
                          </a>
                        ) : (
                          <span className="text-[13px] font-semibold text-[#4f566b]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[12px] font-medium text-[#4f566b]">
                          {new Date(user.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto" />
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
