"use client";
import { toast } from "react-hot-toast";
import { 
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Database,
  Layers,
  Webhook,
  ExternalLink,
  RefreshCw,
  MoreVertical,
  XCircle,
  Puzzle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const integrations = [
  { 
    id: "int-0", 
    name: "1C:Предприятие", 
    description: "Автоматическая синхронизация товаров, цен и складских остатков напрямую из 1С.", 
    status: "Active", 
    icon: Zap, 
    lastSync: "Сегодня, 12:00",
    category: "ERP",
    canSync: true
  },
  { 
    id: "int-1", 
    name: "Bitrix24", 
    description: "Синхронизация сделок, контактов и товаров с вашей CRM системой.", 
    status: "Connected", 
    icon: Database, 
    lastSync: "Сегодня, 15:42",
    category: "CRM"
  }
];

export default function IntegrationsPage() {
  const [selectedInt, setSelectedInt] = useState<typeof integrations[0] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{success: boolean, message: string} | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch("/api/v1/products/sync", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setSyncResult({ success: true, message: "Синхронизация успешно завершена" });
      } else {
        setSyncResult({ success: false, message: data.detail || "Ошибка при синхронизации" });
      }
    } catch (error) {
      toast.error("Произошла ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
      setSyncResult({ success: false, message: "Не удалось связаться с сервером" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Интеграции</h1>
            <p className="text-[14px] text-[#4f566b]">Подключайте сторонние сервисы для автоматизации бизнеса.</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all no-shadow">
            <Plus className="w-3.5 h-3.5" />
            Добавить сервис
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4">
           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#2c3b6e] border border-slate-100 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
           </div>
           <div>
              <h3 className="text-[13px] font-bold text-[#1a1f36]">Безопасность API</h3>
              <p className="text-[11px] text-[#4f566b]">Все ключи шифруются по стандарту AES-256 и хранятся в защищенном хранилище.</p>
           </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((int, idx) => (
            <motion.div 
              key={int.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedInt(int)}
              className="group bg-white border border-[#e3e8ee] p-5 rounded-xl hover:border-[#2c3b6e]/30 transition-all cursor-pointer no-shadow relative overflow-hidden"
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#f7f8f9] group-hover:bg-[#2c3b6e] transition-colors rounded-xl flex items-center justify-center text-[#2c3b6e] group-hover:text-white">
                     <int.icon className="w-6 h-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    int.status === "Connected" || int.status === "Active" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#4f566b]/10 text-[#4f566b]"
                  )}>
                    {int.status === "Connected" || int.status === "Active" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {int.status === "Connected" ? "Подключено" : int.status === "Active" ? "Активно" : "Отключено"}
                  </div>
               </div>
               <h3 className="text-[16px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors mb-1">{int.name}</h3>
               <p className="text-[12px] text-[#4f566b] leading-relaxed mb-4">{int.description}</p>
               <div className="pt-4 border-t border-[#f7f8f9] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">{int.category}</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#4f566b]">
                     <RefreshCw className="w-3 h-3" />
                     {int.lastSync}
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Integration Settings Drawer */}
      <AnimatePresence>
        {selectedInt && (
          <>
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInt(null)}
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
            />
            <motion.div 
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e3e8ee] z-[10000] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">Настройки {selectedInt.name}</h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">{selectedInt.id}</p>
                </div>
                <button onClick={() => setSelectedInt(null)} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors">
                  <XCircle className="w-5 h-5 text-[#4f566b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {selectedInt.id === "int-0" && (
                   <div className="p-6 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee] space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[#f0a400]/10 rounded-xl flex items-center justify-center text-[#f0a400]">
                            <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                         </div>
                         <div>
                            <p className="text-[14px] font-bold text-[#1a1f36]">Синхронизация 1С</p>
                            <p className="text-[11px] text-[#4f566b]">Обновление каталога и цен</p>
                         </div>
                      </div>
                      
                      <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={cn(
                          "w-full py-4 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2",
                          isSyncing ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#f0a400] text-white hover:bg-[#e09800]"
                        )}
                      >
                         {isSyncing ? (
                           <>
                             <RefreshCw className="w-4 h-4 animate-spin" />
                             Синхронизируем...
                           </>
                         ) : (
                           <>
                             <Zap className="w-4 h-4" />
                             Запустить синхронизацию
                           </>
                         )}
                      </button>

                      {syncResult && (
                        <div className={cn(
                          "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                          syncResult.success ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
                        )}>
                           {syncResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           <p className="text-[11px] font-bold">{syncResult.message}</p>
                        </div>
                      )}
                   </div>
                 )}

                 <div className="space-y-4">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">API Ключ</label>
                    <div className="relative">
                       <input 
                         type="password" 
                         value="••••••••••••••••••••••••"
                         readOnly
                         className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] font-bold text-[#1a1f36] outline-none"
                       />
                       <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#2c3b6e] hover:underline">Копировать</button>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Webhook URL</label>
                    <input 
                      type="text" 
                      value={`https://api.maff.uz/webhooks/${selectedInt.name.toLowerCase()}`}
                      readOnly
                      className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[12px] font-mono text-[#4f566b] outline-none"
                    />
                 </div>
              </div>

              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0 grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center gap-2 px-4 py-3 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#cd5c5c] hover:bg-white transition-all no-shadow">
                    Отключить
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all">
                    Сохранить
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
