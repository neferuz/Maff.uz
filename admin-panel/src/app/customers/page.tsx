"use client";
import { toast } from "react-hot-toast";
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  XCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

// Customers data will be fetched from the backend

const statusConfig = {
  Active: { label: "Активен", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  VIP: { label: "VIP Клиент", color: "text-[#2c3b6e]", bg: "bg-[#2c3b6e]/10" },
  New: { label: "Новый", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  Inactive: { label: "Неактивен", color: "text-[#4f566b]", bg: "bg-[#4f566b]/10" },
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/v1/users/");
        const data = await response.json();
        if (response.ok) {
          // Map users to customer format
          const mapped = data.map((user: any) => ({
            id: `USR-${user.id}`,
            name: user.full_name || "Без имени",
            email: user.email || "—",
            spent: "—",
            orders: 0,
            lastVisit: "—",
            status: user.is_active ? "Active" : "Inactive",
            phone: user.phone || "—",
            location: user.is_superuser ? "Админ" : "Пользователь сайта"
          }));
          setCustomers(mapped);
        }
      } catch (err) {
      toast.error("Произошла ошибка: " + (err instanceof Error ? err.message : "Неизвестная ошибка"));
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Клиенты</h1>
          <p className="text-[14px] text-[#4f566b]">Управление клиентской базой и анализ активности покупателей.</p>
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
            placeholder="Поиск по имени или email..." 
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

      {/* Customers Table */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden no-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Клиент</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Потрачено</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Заказы</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Последний визит</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-8 h-8 border-3 border-slate-100 border-t-[#2c3b6e] rounded-full animate-spin mb-4" />
                       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Загрузка данных...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                          <ShoppingBag className="w-8 h-8" />
                       </div>
                       <h3 className="text-[16px] font-bold text-slate-900 mb-1">Список клиентов пуст</h3>
                       <p className="text-[12px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">Пока что никто не оставлял заявки на вашем сайте.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => {
                  const status = statusConfig[customer.status as keyof typeof statusConfig] || statusConfig.New;
                  return (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-tr from-[#2c3b6e] to-[#4a5e9e] rounded-full flex items-center justify-center text-white font-bold text-[12px]">
                            {customer.name ? customer.name.split(' ').map((n: string) => n[0]).join('') : "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{customer.name}</span>
                            <span className="text-[11px] text-[#4f566b] font-medium">{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          status.bg, status.color
                        )}>
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[13px] font-bold text-[#1a1f36]">
                          {customer.spent}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[13px] font-semibold text-[#4f566b]">
                          {customer.orders}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[12px] font-medium text-[#4f566b]">
                          {customer.lastVisit}
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
