"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Globe,
  RefreshCw
} from "lucide-react";

/* ── Custom Icons (Robust for any version) ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.4 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

const IconMap: any = {
  Instagram: InstagramIcon,
  Telegram: TelegramIcon,
  TikTok: TikTokIcon,
  Youtube: YoutubeIcon,
  Globe: Globe,
  Link: Globe,
  Share2: Globe,
};

const ColorMap: any = {
  Instagram: "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
  Telegram: "from-[#0088cc] to-[#00aaff]",
  TikTok: "from-[#000000] via-[#ee1d52] to-[#69c9d0]",
  Youtube: "from-[#FF0000] to-[#cc0000]",
  default: "from-[#2c3b6e] to-[#1a274b]"
};

export default function SocialsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${baseUrl}/api/v1/pages/socials`);
        if (response.ok) {
          const result = await response.json();
          setData(result.content);
        }
      } catch (err) {
        console.error("Failed to fetch socials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  // Use defaults if no data is found
  const pageData = data || {
    header: { title: "Мы в социальных сетях", subtitle: "Следите за нами там, где вам удобно" },
    links: []
  };

  return (
    <main className="min-h-0 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white selection:bg-[#2c3b6e]/10 overflow-x-hidden relative transition-colors duration-500">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2c3b6e]/5 dark:bg-[#2c3b6e]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2c3b6e]/5 dark:bg-[#2c3b6e]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 lg:px-6 pt-6 lg:pt-10 pb-8 lg:pb-20">
        {/* Header Section */}
        <div className="text-center mb-6 lg:mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-4 lg:mb-6"
          >
            <Image 
              src="/logo.png" 
              alt="MAFF" 
              width={160} 
              height={60} 
              className="h-8 lg:h-12 w-auto mx-auto dark:invert"
              priority
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tighter mb-1 text-slate-900 dark:text-white leading-none">
              {pageData.header?.title}
            </h1>
            <p className="text-[10px] lg:text-[11px] font-bold text-[#4f566b] dark:text-white/40 uppercase tracking-widest max-w-xs mx-auto">
              {pageData.header?.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="space-y-3 lg:space-y-4">
          {pageData.links?.map((social: any, idx: number) => {
            const Icon = IconMap[social.icon] || Globe;
            const colorClass = ColorMap[social.icon] || ColorMap.default;

            return (
              <motion.a
                key={social.id || idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                className="group block relative overflow-hidden bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[1.5rem] lg:rounded-[2rem] hover:border-[#2c3b6e]/30 dark:hover:bg-white/10 transition-all p-4 lg:p-6 active:scale-[0.98] shadow-none"
              >
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className={cn("w-12 h-12 lg:w-14 lg:h-14 rounded-[1rem] lg:rounded-[1.25rem] bg-gradient-to-br flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110", colorClass)}>
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 lg:mb-1">
                      <h3 className="text-base lg:text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                        {social.name}
                      </h3>
                      <div className="px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-white/10 text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-[#4f566b] dark:text-white/30 truncate">
                        {social.username}
                      </div>
                    </div>
                    <p className="text-[10px] lg:text-[11px] text-slate-500 dark:text-white/40 font-medium leading-tight line-clamp-1 lg:line-clamp-none">
                      {social.desc}
                    </p>
                  </div>

                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-white/20 group-hover:bg-[#2c3b6e] group-hover:text-white transition-all shadow-none flex-shrink-0">
                    <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                </div>

                {/* Hover highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2c3b6e]/5 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
