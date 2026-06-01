"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/translation-context";
import { 
  Globe, 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [data, setData] = React.useState({
    description: "Ведущий дистрибьютор напольных покрытий и дверей в Узбекистане. 20 лет опыта, 17 международных брендов и безупречный сервис.",
    phone: "+998 71 205 54 54",
    address: "г. Ташкент, ул. Уста Ширин",
    telegram: "https://t.me/maffuzbekistan",
    instagram: "https://www.instagram.com/maff.uz?igsh=MTJ5b2VwbHl1eTBodQ%3D%3D&utm_source=qr",
    facebook: "https://www.facebook.com/maff.uzb/?locale=ru_RU"
  });

  React.useEffect(() => {
    fetch("/api/v1/pages/footer")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch footer content");
      })
      .then(d => {
        if (d.content) {
          setData(prev => ({
            ...prev,
            ...d.content
          }));
        }
      })
      .catch(err => {
        console.error("Error loading footer content dynamically:", err);
      });
  }, []);

  const phoneUrl = `tel:${data.phone.replace(/[^\d+]/g, "")}`;

  return (
    <footer className="w-full bg-[#2c3b6e] dark:bg-[#0f172a] text-white pt-16 pb-8 rounded-t-[2.5rem] lg:rounded-t-[3.5rem] shadow-none border-t border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-12 pb-12 border-b border-white/10">
          
          {/* Logo & Vision Area */}
          <div className="lg:w-4/12">
            <h2 translate="no" className="notranslate text-2xl font-black tracking-tighter mb-4 text-white">MAFF.</h2>
            <p className="text-xs font-medium text-white/60 leading-relaxed max-w-sm mb-6">
              {data.description}
            </p>
            <div className="flex gap-2">
              <Link 
                href={data.telegram}
                target="_blank"
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#2c3b6e] transition-all duration-300"
              >
                <Send className="w-4 h-4" />
              </Link>
              <Link 
                href={data.instagram}
                target="_blank"
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#2c3b6e] transition-all duration-300"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <Link 
                href={data.facebook}
                target="_blank"
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#2c3b6e] transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Nav Links Grid */}
          <div className="lg:w-7/12 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-5">{t("catalog", "Каталог")}</h4>
              <ul className="space-y-3">
                <li><Link href="/catalog" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("laminate", "Ламинат")}</Link></li>
                <li><Link href="/catalog" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("parquet_board", "Паркетная доска")}</Link></li>
                <li><Link href="/catalog" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("doors", "Двери")}</Link></li>
                <li><Link href="/catalog" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("plinth", "Плинтус")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-5">{t("company", "Компания")}</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("about_us", "О нас")}</Link></li>
                <li><Link href="/showrooms" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("showrooms", "Шоу-румы")}</Link></li>
                <li><Link href="/delivery" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("delivery_payment", "Доставка и оплата")}</Link></li>
                <li><Link href="/warranty" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("warranty_return", "Гарантия и возврат")}</Link></li>
                <li><Link href="/installment" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("installment", "Рассрочка")}</Link></li>
                <li><Link href="/faq" className="text-[12px] font-bold text-white/70 hover:text-white transition-colors">{t("faq_qa", "Вопросы и ответы")}</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-5">{t("contacts", "Контакты")}</h4>
              <div className="space-y-4">
                <Link href={phoneUrl} className="block">
                  <div className="text-[9px] font-bold text-white/30 uppercase mb-0.5">{t("phone", "Телефон")}</div>
                  <div translate="no" className="notranslate text-sm font-black text-white hover:text-white/80 transition-colors">{data.phone}</div>
                </Link>
                <Link href="/contacts" className="block">
                  <div className="text-[9px] font-bold text-white/30 uppercase mb-0.5">{t("our_address", "Адрес")}</div>
                  <div className="text-[11px] font-bold text-white/80 hover:text-white transition-colors">{data.address}</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-bold text-white/30">
            © {currentYear} {t("copyright", "MAFF. Все права защищены.")}
          </div>
          <Link 
            href="#" 
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            <span className="text-[10px] font-bold text-white/30 group-hover:text-white transition-colors">{t("site_development", "Разработка сайта")} by Pixel Studio</span>
            <ArrowUpRight className="w-3 h-3 text-white/40 group-hover:text-white" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
