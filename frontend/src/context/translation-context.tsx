"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TranslationContextType {
  locale: string;
  t: (key: string, defaultVal?: string) => string;
  changeLanguage: (lang: string) => void;
  loading: boolean;
}

const RussianToKeyMap: Record<string, string> = {
  "О компании": "about_company",
  "Блог": "blog",
  "Доставка и оплата": "delivery_payment",
  "Гарантия и возврат": "warranty_return",
  "Рассрочка": "installment",
  "3D Визуализатор": "3d_visualizer",
  "Каталог": "catalog",
  "Шоурумы": "showrooms",
  "Партнерам": "partners",
  "Архитекторам": "architects",
  "Дизайнерам": "designers",
  "Застройщикам": "developers",
  "Оптовикам": "wholesalers",
  "Вопросы и ответы": "faq_qa",
  "Аутлет": "outlet",
  "Сертификаты": "certificates",
  "Поиск товаров...": "search_placeholder",
  "Все категории": "all_categories",
  "Бренды": "brands",
  "Характеристики": "characteristics",
  "Разделы": "sections",
  "Контакты": "contacts",
  "Наш адрес": "our_address",
  "Телефон": "phone",
  "© 2026 Maff.uz. Все права защищены.": "copyright",
  "Разработка сайта": "site_development",
  "Корзина": "cart",
  "Избранное": "favorites",
  "Сравнение": "compare",
  "На главную": "back_to_main",
  "Купить сейчас": "buy_now",
  "В корзину": "add_to_cart",
  "Добавлено": "added_to_cart",
  "Ваша корзина пуста": "empty_cart",
  "Оформить заказ": "checkout",
  "ФИО": "full_name",
  "Номер телефона": "phone_number",
  "Отправить заявку": "send_request",
  "Заявка успешно отправлена!": "request_success",
  "Категории": "categories_capital",
  "Назад в каталог": "back_to_catalog",
  "Главная": "main_page",
  "Смотреть все": "view_all",
  "Смотреть всё": "view_all",
  "Не найдено": "not_found",
  "Бренд": "brand_label",
  "Страна": "country_label",
  "Толщина": "thickness_label",
  "Класс": "grade_label",
  "Артикул": "sku_label",
  "Ед. изм.": "unit_label",
  "Наличие": "stock_label",
  "Похожие товары": "similar_products",
  "Комплектующие": "accessories",
  "В наличии": "in_stock",
  "Нет в наличии": "out_of_stock",
  "Под заказ": "under_order",
  "Заказать": "order_btn",
  "Сравнить": "compare_btn",
  "Нет фото": "no_photo",
  "сум": "currency_sum",
  "Рекомендуем": "recommended_title",
  "Лучший выбор наших экспертов": "expert_choice",
  "Наши бренды": "our_brands",
  "Категории": "categories_title",
  "Смотреть всё": "show_all",
  "Перейти к выбору": "go_to_selection",
  "Смотреть товары": "view_products",
  "В этой категории пока нет товаров": "no_products_yet",
  "мы скоро добавим новые поступления": "new_arrivals_soon",
  "Вернуться назад": "back_btn",
  "По названию": "sort_by_name",
  "Сначала дешевые": "sort_by_price_asc",
  "Сначала дорогие": "sort_by_price_desc",
  "Популярные": "popular",
  "Новинки": "new_items",
  "Европа": "europe",
  "Стандарт": "standard",
  "Фильтры": "filters",
  "Сбросить фильтры": "reset_filters",
  "Показано": "shown",
  "из": "from_total",
  "Сортировка": "sorting",
  "Быстрый просмотр": "quick_view",
  "Описание": "description_label"
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>("ru");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize language from cookie or localStorage
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length >= 2) {
        return parts.pop()?.split(';').shift();
      }
      return null;
    };

    const storedLang = localStorage.getItem("maff_lang");
    const cookieLang = getCookie("maff_lang");
    const initialLang = storedLang || cookieLang || "ru";
    
    if (["ru", "uz", "en"].includes(initialLang)) {
      setLocale(initialLang);
    }
    setLoading(false);
  }, []);

  // Fetch translations when locale changes (if not "ru")
  useEffect(() => {
    if (locale === "ru") {
      setTranslations({});
      return;
    }

    const fetchTranslations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/pages/translations/items?lang=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (err) {
        console.error("Failed to fetch UI translations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [locale]);

  const changeLanguage = (lang: string) => {
    if (!["ru", "uz", "en"].includes(lang)) return;
    
    localStorage.setItem("maff_lang", lang);
    document.cookie = `maff_lang=${lang}; path=/; max-age=31536000;`;
    
    setLocale(lang);
    
    // Reload page to refresh all Server/Client components with new translations
    window.location.reload();
  };

  const t = (key: string, defaultVal?: string) => {
    const val = defaultVal !== undefined ? defaultVal : key;
    if (locale === "ru") {
      return val;
    }
    
    if (translations[key]) {
      return translations[key];
    }
    
    const mappedKey = RussianToKeyMap[key];
    if (mappedKey && translations[mappedKey]) {
      return translations[mappedKey];
    }
    
    if (defaultVal) {
      const mappedValKey = RussianToKeyMap[defaultVal];
      if (mappedValKey && translations[mappedValKey]) {
        return translations[mappedValKey];
      }
    }
    
    return val;
  };

  return (
    <TranslationContext.Provider value={{ locale, t, changeLanguage, loading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
