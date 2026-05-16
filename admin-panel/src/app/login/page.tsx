"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await fetch("/api/v1/login/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("admin_token", data.access_token);
        router.push("/products");
      } else {
        const errData = await res.json();
        setError(errData.detail || "Неверный логин или пароль");
      }
    } catch (err) {
      setError("Ошибка соединения с сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center pt-8 md:pt-16 pb-10 p-4 selection:bg-[#2c3b6e] selection:text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#2c3b6e]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#f0a400]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[360px] relative z-10"
      >
        {/* Unified Login Card - Extra Compact */}
        <div className="bg-white rounded-[2rem] shadow-[0_15px_30px_-10px_rgba(26,31,54,0.05)] border border-[#e3e8ee] overflow-hidden">
          
          {/* Top Brand Bar */}
          <div className="bg-[#1a1f36] p-6 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#2c3b6e]/40 to-transparent" />
             <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-3 border border-white/10">
                   <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-black text-white uppercase tracking-tighter">
                  Maff <span className="text-white/60">Admin</span>
                </h1>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] mt-0.5">Control Center Access</p>
             </div>
          </div>

          <div className="p-6 lg:p-7 space-y-4">
            <div className="text-center pb-1">
               <h2 className="text-[14px] font-black text-[#1a1f36] uppercase tracking-tight">Авторизация</h2>
               <p className="text-[10px] text-[#4f566b] font-medium opacity-60 mt-0.5">Введите данные для входа</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-red-600 leading-tight">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-[0.15em] ml-0.5">Логин / Email</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/20 focus:bg-white rounded-xl text-[12px] font-medium outline-none transition-all placeholder:text-[#4f566b]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-[0.15em] ml-0.5">Пароль</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/20 focus:bg-white rounded-xl text-[12px] font-medium outline-none transition-all placeholder:text-[#4f566b]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-0.5">
                 <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input type="checkbox" className="w-3 h-3 rounded border-[#e3e8ee] text-[#2c3b6e] focus:ring-0" />
                    <span className="text-[9px] font-bold text-[#4f566b] group-hover:text-[#1a1f36] transition-colors">Запомнить</span>
                 </label>
                 <button type="button" className="text-[9px] font-bold text-[#4f566b] hover:text-[#2c3b6e] transition-colors">Забыли пароль?</button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#1a1f36] text-white py-3 px-6 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#2c3b6e] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none group shadow-lg shadow-[#1a1f36]/5 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Авторизоваться
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Info - Ultra Compact */}
        <p className="mt-6 text-center text-[9px] text-[#4f566b] font-bold opacity-20 uppercase tracking-[0.3em]">
          MAFF Security
        </p>
      </motion.div>
    </div>
  );
}
