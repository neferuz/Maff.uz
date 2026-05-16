"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/shop-context";
import { User, Lock, Mail, ChevronRight, ArrowRight, Check, Loader2, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// import { auth } from "@/lib/firebase";
// import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
  const { login: performLogin, register: performRegister, user, notify } = useShop();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth States
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  /* 
  // Phone Auth States (Disabled for now due to billing)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<any>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const recaptchaVerifier = useRef<any>(null);
  */

  const isLoginValid = loginEmail.length >= 3;
  const isPasswordValid = password.length >= 6;
  const isRegisterValid = activeTab === "register" 
    ? (isLoginValid && isPasswordValid && fullName.length >= 2)
    : (isLoginValid && isPasswordValid);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === "login") {
        const success = await performLogin(loginEmail, password);
        if (success) router.push("/profile");
      } else if (activeTab === "register") {
        const success = await performRegister(loginEmail, password, fullName);
        if (success) setActiveTab("login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isLoggedIn) {
      router.push("/profile");
    }
  }, [user, router]);

  if (user?.isLoggedIn) return null;

  return (
    <div className="min-h-[80vh] bg-white dark:bg-[#0f172a] flex items-start justify-center pt-10 lg:pt-16 pb-12 lg:pb-20 transition-colors duration-500 relative overflow-hidden selection:bg-[#2c3b6e]/10 text-left">
      
      {/* Invisible Recaptcha Container */}
      <div id="recaptcha-container"></div>

      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[#2c3b6e]/5 dark:bg-[#2c3b6e]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#2c3b6e]/5 dark:bg-[#2c3b6e]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[360px] px-6 relative z-10"
      >
        
        {/* Title Section */}
        <div className="mb-6 text-center lg:text-left">
           <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
              {activeTab === "login" ? "Вход в аккаунт" : "Регистрация"}
           </h3>
           <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest leading-relaxed">
              Авторизуйтесь для доступа к профилю
           </p>
        </div>

        {/* Tab Switcher - Back to 2 tabs */}
        <div className="flex p-1 bg-slate-50 dark:bg-white/5 rounded-full mb-8 border border-slate-100 dark:border-white/5">
           <button 
             onClick={() => setActiveTab("login")}
             className={cn(
               "flex-grow py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
               activeTab === "login" 
                ? "bg-white dark:bg-[#2c3b6e] text-slate-900 dark:text-white" 
                : "text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white/40"
             )}
           >
             Вход
           </button>
           <button 
             onClick={() => setActiveTab("register")}
             className={cn(
               "flex-grow py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
               activeTab === "register" 
                ? "bg-white dark:bg-[#2c3b6e] text-slate-900 dark:text-white" 
                : "text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white/40"
             )}
           >
             Регистрация
           </button>
        </div>

        {/* --- Standard Email/Register UI --- */}
        <form onSubmit={handleAuth} className="space-y-5">
          <AnimatePresence mode="wait">
            {activeTab === "register" && (
              <motion.div 
                key="name-input-field"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest ml-4">Полное имя *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full h-11 bg-slate-50 dark:bg-white/5 border-b-2 border-transparent dark:border-white/5 rounded-t-2xl px-6 text-xs font-bold text-slate-900 dark:text-white outline-none focus:bg-slate-100 dark:focus:bg-white/10 focus:border-[#2c3b6e] dark:focus:border-white/40 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest ml-4">Логин / Email *</label>
            <div className="relative">
              <input 
                type="text" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full h-11 bg-slate-50 dark:bg-white/5 border-b-2 border-transparent dark:border-white/5 rounded-t-2xl px-6 text-xs font-bold text-slate-900 dark:text-white outline-none focus:bg-slate-100 dark:focus:bg-white/10 focus:border-[#2c3b6e] dark:focus:border-white/40 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest ml-4">Пароль *</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-slate-50 dark:bg-white/5 border-b-2 border-transparent dark:border-white/5 rounded-t-2xl px-6 text-xs font-bold text-slate-900 dark:text-white outline-none focus:bg-slate-100 dark:focus:bg-white/10 focus:border-[#2c3b6e] dark:focus:border-white/40 transition-all"
              />
            </div>
          </div>

          {activeTab === "login" && (
            <div className="flex items-center justify-between py-1 px-2">
              <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2.5 group cursor-pointer">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center",
                  rememberMe ? "bg-[#2c3b6e] border-[#2c3b6e]" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                )}>
                  {rememberMe && <Check className="w-2 h-2 text-white" strokeWidth={5} />}
                </div>
                <span className="text-[9px] font-black text-slate-500 dark:text-white/30 uppercase tracking-tight">Запомнить</span>
              </button>
              <Link href="/forgot" className="text-[9px] font-black text-[#2c3b6e] dark:text-white/40 hover:dark:text-white uppercase tracking-tight transition-colors">
                Забыли?
              </Link>
            </div>
          )}

          <button 
            type="submit"
            disabled={!isRegisterValid || isLoading}
            className={cn(
              "w-full h-12 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all mt-6",
              !isRegisterValid || isLoading
                ? "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/10 cursor-not-allowed"
                : "bg-slate-900 dark:bg-white text-white dark:text-[#0f172a] hover:bg-[#2c3b6e] dark:hover:bg-slate-200 active:scale-95"
            )}
          >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (activeTab === "login" ? "Авторизоваться" : "Создать аккаунт")}
             <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-12 text-center text-[9px] font-black text-slate-300 dark:text-white/10 uppercase tracking-[0.3em]">
           MAFF Authentication Hub
        </p>
      </motion.div>
    </div>
  );
}
