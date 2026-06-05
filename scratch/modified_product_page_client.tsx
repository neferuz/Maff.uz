"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  X,
  ShoppingBag,
  CreditCard,
  MapPin,
  ArrowRight,
  Zap,
  Award,
  Loader2,
  Image as ImageIcon,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProductCard } from "@/components/ui/product-card";
import { getProductUnit } from "@/lib/units";

const parseProductName = (name: string) => {
  if (!name)
    return {
      cleanTitle: "",
      parsedColor: "",
      parsedSize: "",
      parsedDimensions: "",
      parsedGlass: "",
      parsedEdge: "Без кромки",
      parsedOpening: "Стандарт",
      parsedClassicType: "",
    };

  let cleaned = name;

  // 1. Extract dimensions (e.g. 35х600х2000, 40х600х2000, 38мм 1,8, etc.)
  let parsedDimensions = "";
  const dimMatch = cleaned.match(/\b\d+\s*[xх\*×]\s*\d+\s*[xх\*×]\s*\d+\b/i);
  if (dimMatch) {
    parsedDimensions = dimMatch[0];
  } else {
    const dimMatch2 = cleaned.match(
      /\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\b/i
    );
    if (dimMatch2) {
      parsedDimensions = dimMatch2[0];
    }
  }

  // 2. Extract size width (typically 400, 600, 700, 800, 900)
  let parsedSize = "";
  const sizeMatch = name.match(/\b(400|600|700|800|900)\b/);
  if (sizeMatch) {
    parsedSize = sizeMatch[1];
  }

  // 3. Extract Edge style before cleaning the name
  let parsedEdge = "Без кромки";
  if (/ALU\s+Black|ALU\s+black|Black\s+ALU|black\s+alu/i.test(cleaned)) {
    parsedEdge = "ALU Black";
  } else if (/ALU|alu/i.test(cleaned)) {
    parsedEdge = "ALU";
  }

  // 4. Extract Opening type before cleaning the name
  let parsedOpening = "Стандарт";
  if (/Revers|revers|Реверс|реверс/i.test(cleaned)) {
    parsedOpening = "Revers";
  } else if (/с четвертью|с четв\.|четвертью/i.test(cleaned)) {
    parsedOpening = "С четвертью";
  }

  // 5. Extract Classic type (glazing layout) before cleaning the name
  let parsedClassicType = "";
  if (/Английская классика 2|АК2|АК 2/i.test(cleaned)) {
    parsedClassicType = "АК 2";
  } else if (/Английская классика|АК|АК 1|АК-1/i.test(cleaned)) {
    parsedClassicType = "АК";
  }

  // 6. Extract glass/parentheses content
  let parenContent = "";
  const parenMatch = cleaned.match(/\(([^)]+)\)/);
  if (parenMatch) {
    parenContent = parenMatch[1].trim();
  }

  const knownColors = [
    "Белый матовый",
    "Серый матовый",
    "Матовый графит",
    "Матовый кремовый",
    "Нордик",
    "Орех карамель",
    "Жемчужно-перламутровый",
    "Беленый дуб",
    "Дуб темный",
    "Дуб темный продольный",
    "Дуб натуральный",
    "Дуб натуральный продольный",
    "Alaska",
    "Grey Oak",
    "Natural Oak",
    "White Oak",
    "Молочный матовый",
    "Графит премьер мат",
    "Тёмный лён",
    "Бетон светлый",
    "Светлый лён",
    "Сканди",
    "Бетон тёмный",
    "Бренди",
    "Светло-серый",
    "Оливковый",
    "Белая эмаль",
    "Бежевый",
    "Мелон",
    "Милано",
    "Венге",
    "Итальянский орех",
    "Жасмин белый",
    "Белый шелку",
    "Белый шелк",
    "Тёмно-серый",
    "Кофе",
    "Антрацит",
    "Хром",
    "Черный",
    "Черный лакобель",
    "Ламинатин Белый",
    "Keramik Beige",
    "Keramik Brown",
    "Ice",
    "Милквуд",
    "Опал",
    "Айвори",
    "Стоун",
    "Дэним",
    "Шэдоу",
    "Белый",
    "Серый",
    "Кремовый",
    "Меланж",
    "Светлый кунжут",
    "Темный кунжут",
    "Песочный матовый",
    "Дарквуд",
    "Дарк Вуд",
    "Грунт",
    "Без врезки",
  ];

  const sortedColors = [...knownColors].sort((a, b) => b.length - a.length);
  // Normalize ё->е so colors like "Бетон тёмный" match "Бетон темный"
  const normYo = (s: string) => s.replace(/ё/g, "е").replace(/Ё/g, "Е");

  let parsedColorsList: string[] = [];
  let parsedGlass = "";

  if (parenContent) {
    if (parenContent.toLowerCase().includes("сатинато")) {
      parsedGlass = "Сатинато";
      parenContent = parenContent.replace(/сатинато/gi, "");
    }
    if (parenContent.toLowerCase().includes("прозрачное стекло")) {
      parsedGlass = "Прозрачное стекло";
      parenContent = parenContent.replace(/прозрачное стекло/gi, "");
    }

    for (const c of sortedColors) {
      const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const reg = new RegExp(
        "(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])",
        "i"
      );
      if (reg.test(normYo(parenContent))) {
        parsedColorsList.push(c);
        parenContent = normYo(parenContent).replace(reg, " ");
      }
    }

    parenContent = parenContent.replace(/^[,;\-\s]+|[,;\-\s]+$/g, "").trim();
    if (parenContent && parsedColorsList.length === 0) {
      parsedColorsList.push(parenContent);
    }
  }

  for (const c of sortedColors) {
    const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp(
      "(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])",
      "i"
    );
    if (reg.test(normYo(cleaned))) {
      if (!parsedColorsList.includes(c)) {
        parsedColorsList.push(c);
      }
    }
  }

  if (cleaned.toLowerCase().includes("сатинато")) {
    parsedGlass = "Сатинато";
  }
  if (cleaned.toLowerCase().includes("прозрачное стекло")) {
    parsedGlass = "Прозрачное стекло";
  }

  // Now construct cleanTitle using the exact same Prefix Truncation algorithm as in catalog/page.tsx
  let prefixClean = cleaned;

  // 1. Normalize brand names and helper tags first so they don't get in the way
  prefixClean = prefixClean.replace(/Zadoor-S Classic/gi, "");
  prefixClean = prefixClean.replace(/S\s+Classic/gi, "");
  prefixClean = prefixClean.replace(/Zadoor/gi, "");
  prefixClean = prefixClean.replace(/Portika/gi, "");
  prefixClean = prefixClean.replace(/Volkhovets/gi, "");
  prefixClean = prefixClean.replace(/Волховец/gi, "");
  prefixClean = prefixClean.replace(/Filomuro/gi, "");
  prefixClean = prefixClean.replace(/Art-Lite/gi, "");
  prefixClean = prefixClean.replace(/ArtКлассик/gi, "");
  prefixClean = prefixClean.replace(/АртКлассик/gi, "");

  // Clean showroom / stand / sample tags
  prefixClean = prefixClean.replace(/\(Образец\)/gi, "");
  prefixClean = prefixClean.replace(/Образец/gi, "");
  prefixClean = prefixClean.replace(/СТЕНД/gi, "");
  prefixClean = prefixClean.replace(/Стенд/gi, "");
  prefixClean = prefixClean.replace(/ДРУЖБА/gi, "");
  prefixClean = prefixClean.replace(/ПАРКЕНТ\s+ДВЕРИ/gi, "");
  prefixClean = prefixClean.replace(/ПАРКЕНТ/gi, "");
  prefixClean = prefixClean.replace(/Стенд\s+слева|Стенд\s+справа/gi, "");
  prefixClean = prefixClean.replace(/слева|справа/gi, "");
  prefixClean = prefixClean.replace(/Дверное\s+полотно/gi, "");
  prefixClean = prefixClean.replace(/Стоевая/gi, "");
  prefixClean = prefixClean.replace(/\(для\s+полотна\)/gi, "");

  // Normalize duplicate ПГ ПГ or ПО ПО
  prefixClean = prefixClean.replace(
    /(?:^|[^а-яа-ёa-z0-9])ПГ\s+ПГ(?:$|[^а-яа-ёa-z0-9])/gi,
    " ПГ "
  );
  prefixClean = prefixClean.replace(
    /(?:^|[^а-яа-ёa-z0-9])ПО\s+ПО(?:$|[^а-яа-ёa-z0-9])/gi,
    " ПО "
  );

  // 2. Truncate at variant/color/size/technical details
  const triggers = [
    /\b\d+\s*[xх\*×]\s*\d+\s*[xх\*×]\s*\d+\b/i, // dimensions
    /\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\b/i,
    /\b(400|600|700|800|900)\b/,
    /\(/,
    /\bALU\b/i,
    /Revers|Реверс/i,
    /с четвертью|с четв\.|четвертью/i,
    /под покраску|под покр/i,
    /\bПП\b/i,
    /\bГрунт\b/i,
    /\bЗеркало\b/i,
    /левая|правая|\bлев\b|\bправ\b/i,
    /с врезкой|\bс\s+вр\b|без врезки/i,
    /сатинато|прозрач/i,
    /RAL\s+\d+/i,
  ];

  let earliestIdx = prefixClean.length;

  // Check regex triggers
  for (const trig of triggers) {
    const match = prefixClean.match(trig);
    if (match && match.index !== undefined && match.index < earliestIdx) {
      earliestIdx = match.index;
    }
  }

  // Check known color triggers (ё->е normalized; 1:1 char swap keeps indices aligned)
  const prefixCleanNorm = normYo(prefixClean);
  for (const c of sortedColors) {
    const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp(
      "(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])",
      "i"
    );
    const match = prefixCleanNorm.match(reg);
    if (match && match.index !== undefined && match.index < earliestIdx) {
      earliestIdx = match.index;
    }
  }

  prefixClean = prefixClean.substring(0, earliestIdx);

  // Normalize AK2 / АК2 in the remaining prefix
  prefixClean = prefixClean.replace(
    /Английская классика 2|АК2|АК 2|АК-2/gi,
    "Английская классика"
  );
  prefixClean = prefixClean.replace(/\bАК\b/gi, "Английская классика");
  prefixClean = prefixClean.replace(/\bА\s+К\b/gi, "Английская классика");

  // Clean up whitespace and symbols
  prefixClean = prefixClean.replace(/\s+/g, " ");
  prefixClean = prefixClean
    .trim()
    .replace(/^[,;\-\s#\(\)]+|[,;\-\s#\(\)]+$/g, "");

  return {
    cleanTitle: prefixClean,
    parsedColor: parsedColorsList.join(" / ") || "Не указан",
    parsedSize,
    parsedDimensions,
    parsedGlass,
    parsedEdge,
    parsedOpening,
    parsedClassicType,
  };
};

const extractColor = (name: string): string => {
  if (!name) return "Не указан";
  const lower = name.toLowerCase();
  const colorMap: Record<string, string[]> = {
    Белый: ["белый", "белая эмаль", "white"],
    Серый: ["серый", "серая", "grey", "gray"],
    Кремовый: ["кремовый", "крем", "cream"],
    Графит: ["графит", "graphite"],
    Орех: ["орех", "ореховый", "walnut"],
    Дуб: ["дуб", "дубовый", "oak"],
    Бетон: ["бетон", "concrete"],
    Нордик: ["нордик", "nordic"],
    Сканди: ["сканди", "scandi"],
    Бренди: ["бренди", "brandy"],
    Чёрный: ["чёрный", "черный", "black"],
    Бежевый: ["бежевый", "beige"],
    Молочный: ["молочный", "milky", "милквуд", "милк вуд"],
    Антрацит: ["антрацит", "anthracite"],
    Деним: ["деним", "denim"],
    Айвори: ["айвори", "ivory"],
    Мелон: ["мелон", "melon"],
    Опал: ["опал", "opal"],
    Сатинато: ["сатинато", "satinato"],
    Перламутровый: ["перламутровый", "pearlescent", "жемчужно-перламутровый"],
    Аляска: ["аляска", "alaska"],
    Праймер: ["праймер", "primer"],
    "Natural Oak": ["natural oak"],
    "Alpik Oak": ["alpik oak"],
  };
  for (const [colorName, keywords] of Object.entries(colorMap)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return colorName;
    }
  }
  return "Не указан";
};

const parseVariant = (name: string) => {
  const parsed = parseProductName(name);
  return {
    baseModel: parsed.cleanTitle,
    color: parsed.parsedColor,
    size: parsed.parsedSize,
    edge: parsed.parsedEdge,
    opening: parsed.parsedOpening,
    classicType: parsed.parsedClassicType,
  };
};

const getColorHex = (colorName: string) => {
  if (!colorName) return "#e2e8f0";
  const name = colorName.toLowerCase();

  if (
    name.includes("белы") ||
    name.includes("alaska") ||
    name.includes("white")
  )
    return "#ffffff";
  if (
    name.includes("черн") ||
    name.includes("black") ||
    name.includes("графит") ||
    name.includes("антрацит") ||
    name.includes("шэдоу") ||
    name.includes("лакобель")
  )
    return "#1e293b";
  if (
    name.includes("серо") ||
    name.includes("серы") ||
    name.includes("grey") ||
    name.includes("бетон тёмны")
  )
    return "#64748b";
  if (
    name.includes("светло-серы") ||
    name.includes("норд") ||
    name.includes("сканди") ||
    name.includes("ice") ||
    name.includes("бетон светлы") ||
    name.includes("эксимер")
  )
    return "#cbd5e1";
  if (
    name.includes("кремов") ||
    name.includes("бежев") ||
    name.includes("айвори") ||
    name.includes("milkwood") ||
    name.includes("милквуд") ||
    name.includes("молочн") ||
    name.includes("beige") ||
    name.includes("песочн")
  )
    return "#f5f5dc";
  if (
    name.includes("орех") ||
    name.includes("бренди") ||
    name.includes("кофе") ||
    name.includes("brown")
  )
    return "#78350f";
  if (name.includes("дуб темн")) return "#451a03";
  if (name.includes("дуб натур") || name.includes("natural oak"))
    return "#d97706";
  if (name.includes("лен") || name.includes("лён")) {
    if (name.includes("темн")) return "#475569";
    return "#e2e8f0";
  }
  if (name.includes("оливк")) return "#65a30d";
  if (name.includes("мелон")) return "#fde047";
  if (name.includes("дэним")) return "#3b82f6";
  if (name.includes("опал")) return "#bae6fd";
  if (name.includes("перламутр")) return "#f1f5f9";

  return "#e2e8f0";
};

const cleanUrl = (url: any) => {
  if (!url || url === "None" || url === "null" || url === "") return null;
  return url;
};

export default function ProductPageClient({
  params,
}: {
  params: { slug: string };
}) {
  // ── State ──
  const [activeSlug, setActiveSlug] = useState<string>(params.slug);
  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isAccessories, setIsAccessories] = useState(false);
  const [accessoriesTitle, setAccessoriesTitle] = useState(
    "С этим товаром покупают"
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [area, setArea] = useState(1);
  const [packs, setPacks] = useState(1);
  const [waste, setWaste] = useState(0); // percentage
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [variants, setVariants] = useState<{
    colors: string[];
    sizes: string[];
    edges: string[];
    openings: string[];
    classicTypes: string[];
  }>({
    colors: [],
    sizes: [],
    edges: [],
    openings: [],
    classicTypes: [],
  });
  const [currentVariantInfo, setCurrentVariantInfo] = useState<{
    color: string;
    size: string;
    baseModel: string;
    edge: string;
    opening: string;
    classicType: string;
  }>({
    color: "",
    size: "",
    baseModel: "",
    edge: "",
    opening: "",
    classicType: "",
  });
  const [installmentData, setInstallmentData] = useState<any>({
    partners: [
      {
        name: "alif",
        logo: "https://s3.fortifai.uz/shop/rand/ce/b1/c5/ceb1c58c-7454-4d16-ad6a-c1f11cea9965.jpg",
      },
      {
        name: "uzum",
        logo: "https://api.logobank.uz/media/logos_png/Uzum_Nasiya-01.png",
      },
      {
        name: "anor",
        logo: "https://pultop.uz/wp-content/uploads/2024/07/anor-320.png",
      },
    ],
    months: [3, 6, 12, 24],
  });

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Door Calculator States
  const [accessories, setAccessories] = useState<{
    color: string;
    boxes: any[];
    trims: any[];
  }>({ color: "", boxes: [], trims: [] });
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedTrim, setSelectedTrim] = useState<any>(null);
  const [includeBox, setIncludeBox] = useState(false);
  const [includeTrim, setIncludeTrim] = useState(false);
  const [doorQuantity, setDoorQuantity] = useState(1);
  const [isBoxSelectOpen, setIsBoxSelectOpen] = useState(false);
  const [isTrimSelectOpen, setIsTrimSelectOpen] = useState(false);

  // ── Fetch Data ──
  useEffect(() => {
    const fetchInstallment = async () => {
      try {
        const res = await fetch(
          "/api/v1/pages/installment?t=" + Date.now() + ""
        );
        if (res.ok) {
          const result = await res.json();
          if (result.content) {
            const c = result.content;
            if (!c.months || !Array.isArray(c.months)) {
              c.months = [3, 6, 12, 24];
            }
            if (!c.partners || !Array.isArray(c.partners)) {
              c.partners = [];
            }
            setInstallmentData(c);
            if (c.months.length > 0) {
              setInstallmentMonths(c.months[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch installment configuration", e);
      }
    };
    fetchInstallment();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/products/${activeSlug}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();

        // Clean images array
        const rawImages = data.images || [];
        const cleanedImages = rawImages
          .map((img: string) => cleanUrl(img))
          .filter(Boolean) as string[];

        // Enrich data with defaults/calculated if missing
        const enrichedProduct = {
          ...data,
          packSize: data.pack_size || 1.0,
          pricePerM2: data.price_outlet || data.price || 0,
          images: cleanedImages,
        };

        setProduct(enrichedProduct);
        const primaryImage =
          cleanUrl(data.image_url) ||
          (cleanedImages.length > 0 ? cleanedImages[0] : null);
        setActiveImage(primaryImage);

        // Fetch similar products or accessories
        if (data.category_id) {
          try {
            const catRes = await fetch(`/api/v1/categories`);
            if (catRes.ok) {
              const categoriesData = await catRes.json();
              setCategories(categoriesData);
              const cat = categoriesData.find(
                (c: any) => c.id === data.category_id
              );
              if (cat) {
                // Traverse up parent categories to find the first configured recommended_accessories
                let recs = null;
                let recCat = cat;
                const recVisited = new Set();
                while (recCat && !recVisited.has(recCat.id)) {
                  recVisited.add(recCat.id);
                  const r = recCat.recommended_accessories;
                  const hasR =
                    r &&
                    ((r.category_ids && r.category_ids.length > 0) ||
                      (r.product_ids && r.product_ids.length > 0));
                  if (hasR) {
                    recs = r;
                    break;
                  }
                  if (recCat.parent_id) {
                    recCat = categoriesData.find(
                      (c: any) => c.id === recCat.parent_id
                    );
                  } else {
                    break;
                  }
                }

                const hasAccs = recs !== null;
                if (hasAccs && recs) {
                  const catFetchPromises = (recs.category_ids || []).map(
                    (cid: number) =>
                      fetch(`/api/v1/products?category_id=${cid}&limit=6`)
                  );
                  const prodFetchPromises = (recs.product_ids || []).map(
                    (pid: number) => fetch(`/api/v1/products/${pid}`)
                  );
                  const [catResponses, prodResponses] = await Promise.all([
                    Promise.all(catFetchPromises),
                    Promise.all(prodFetchPromises),
                  ]);

                  const accList: any[] = [];
                  for (const res of prodResponses) {
                    if (res.ok) {
                      accList.push(await res.json());
                    }
                  }
                  for (const res of catResponses) {
                    if (res.ok) {
                      const prods = await res.json();
                      accList.push(...prods);
                    }
                  }

                  // Filter out duplicates and current product
                  const seen = new Set();
                  const uniqueAccs = accList.filter((p: any) => {
                    if (!p || p.id === data.id || seen.has(p.id)) return false;
                    seen.add(p.id);
                    return true;
                  });

                  if (uniqueAccs.length > 0) {
                    setSimilarProducts(uniqueAccs.slice(0, 4));
                    setIsAccessories(true);
                    setAccessoriesTitle(
                      recs.title || "С этим товаром покупают"
                    );
                  } else {
                    // Fallback to similar products
                    const simRes = await fetch(
                      `/api/v1/products?category_id=${data.category_id}&limit=5`
                    );
                    if (simRes.ok) {
                      const simData = await simRes.json();
                      setSimilarProducts(
                        simData.filter((p: any) => p.id !== data.id).slice(0, 4)
                      );
                    }
                    setIsAccessories(false);
                  }
                } else {
                  // Fallback: Fetch similar products in same category
                  const simRes = await fetch(
                    `/api/v1/products?category_id=${data.category_id}&limit=5`
                  );
                  if (simRes.ok) {
                    const simData = await simRes.json();
                    setSimilarProducts(
                      simData.filter((p: any) => p.id !== data.id).slice(0, 4)
                    );
                  }
                  setIsAccessories(false);
                }

                let currentCat = cat;
                let isOrderOnly = cat.is_order_only || false;
                let isPreorder = cat.is_preorder || false;
                let pricePrefix = cat.price_prefix || "";
                let orderLink = cat.order_link || "";

                const visited = new Set();
                while (
                  currentCat &&
                  currentCat.parent_id &&
                  !visited.has(currentCat.id)
                ) {
                  visited.add(currentCat.id);
                  const parent = categoriesData.find(
                    (c: any) => c.id === currentCat.parent_id
                  );
                  if (parent) {
                    if (parent.is_order_only) {
                      isOrderOnly = true;
                    }
                    if (parent.is_preorder) {
                      isPreorder = true;
                    }
                    if (!pricePrefix && parent.price_prefix) {
                      pricePrefix = parent.price_prefix;
                    }
                    if (!orderLink && parent.order_link) {
                      orderLink = parent.order_link;
                    }
                    currentCat = parent;
                  } else {
                    break;
                  }
                }

                const enrichedCat = {
                  ...cat,
                  is_order_only: isOrderOnly,
                  is_preorder: isPreorder,
                  price_prefix: pricePrefix,
                  order_link: orderLink,
                };
                setProduct((prev: any) => ({ ...prev, category: enrichedCat }));
              }
            }
          } catch (e) {
            console.error("Failed to fetch category/similar", e);
          }

          // Fetch all sibling products in the category to group by color/size variations
          try {
            const siblingsRes = await fetch(
              `/api/v1/products?category_id=${data.category_id}&limit=1000`
            );
            if (siblingsRes.ok) {
              const allSiblings = await siblingsRes.json();
              const currentInfo = parseVariant(data.name);
              setCurrentVariantInfo(currentInfo);

              // Filter active siblings that match this base model name
              const matchingSiblings = allSiblings.filter((p: any) => {
                const pInfo = parseVariant(p.name);
                return (
                  pInfo.baseModel.toLowerCase() ===
                    currentInfo.baseModel.toLowerCase() && p.is_active
                );
              });
              setSiblings(matchingSiblings);

              const uniqueColors = Array.from(
                new Set(
                  matchingSiblings
                    .map((s: any) => parseVariant(s.name).color)
                    .filter(Boolean)
                )
              ) as string[];
              const uniqueSizes = Array.from(
                new Set(
                  matchingSiblings
                    .map((s: any) => parseVariant(s.name).size)
                    .filter(Boolean)
                )
              ) as string[];
              const uniqueEdges = Array.from(
                new Set(
                  matchingSiblings
                    .map((s: any) => parseVariant(s.name).edge)
                    .filter(Boolean)
                )
              ) as string[];
              const uniqueOpenings = Array.from(
                new Set(
                  matchingSiblings
                    .map((s: any) => parseVariant(s.name).opening)
                    .filter(Boolean)
                )
              ) as string[];
              const uniqueClassicTypes = Array.from(
                new Set(
                  matchingSiblings
                    .map((s: any) => parseVariant(s.name).classicType)
                    .filter(Boolean)
                )
              ) as string[];

              uniqueSizes.sort((a, b) => parseInt(a) - parseInt(b));

              setVariants({
                colors: uniqueColors,
                sizes: uniqueSizes,
                edges: uniqueEdges,
                openings: uniqueOpenings,
                classicTypes: uniqueClassicTypes,
              });
            }
          } catch (err) {
            console.error(
              "Failed to fetch sibling products for variants grouping",
              err
            );
          }
        }

        // If it is a door, fetch matching accessories by color
        const productNameLower = data.name.toLowerCase();
        const productBrandLower = (data.brand || "").toLowerCase();
        const doorBrands = [
          "portika",
          "zadoor",
          "profildoors",
          "волховец",
          "volkhovets",
          "filomuro",
        ];
        const doorKeywords = [
          "двер",
          "door",
          "классико",
          "порта",
          "centro",
          "неоклассико",
        ];
        const isProductDoor =
          doorKeywords.some((k) => productNameLower.includes(k)) ||
          doorBrands.some((b) => productBrandLower.includes(b));

        if (isProductDoor) {
          try {
            const accRes = await fetch(
              `/api/v1/products/${data.id}/accessories`
            );
            if (accRes.ok) {
              const accData = await accRes.json();
              setAccessories(accData);
              if (accData.boxes && accData.boxes.length > 0) {
                setSelectedBox(accData.boxes[0]);
              }
              if (accData.trims && accData.trims.length > 0) {
                setSelectedTrim(accData.trims[0]);
              }
            }
          } catch (err) {
            console.error("Failed to fetch door accessories", err);
          }
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeSlug]);

  const handleVariantChange = (
    newColor?: string,
    newSize?: string,
    newEdge?: string,
    newOpening?: string,
    newClassicType?: string
  ) => {
    const targetColor =
      newColor !== undefined ? newColor : currentVariantInfo.color;
    const targetSize =
      newSize !== undefined ? newSize : currentVariantInfo.size;
    const targetEdge =
      newEdge !== undefined ? newEdge : currentVariantInfo.edge;
    const targetOpening =
      newOpening !== undefined ? newOpening : currentVariantInfo.opening;
    const targetClassicType =
      newClassicType !== undefined
        ? newClassicType
        : currentVariantInfo.classicType;

    // Filter candidates based on the clicked attribute first
    let candidates = [...siblings];
    if (newColor !== undefined)
      candidates = candidates.filter(
        (s) => parseVariant(s.name).color === newColor
      );
    if (newSize !== undefined)
      candidates = candidates.filter(
        (s) => parseVariant(s.name).size === newSize
      );
    if (newEdge !== undefined)
      candidates = candidates.filter(
        (s) => parseVariant(s.name).edge === newEdge
      );
    if (newOpening !== undefined)
      candidates = candidates.filter(
        (s) => parseVariant(s.name).opening === newOpening
      );
    if (newClassicType !== undefined)
      candidates = candidates.filter(
        (s) => parseVariant(s.name).classicType === newClassicType
      );

    // Fallback if no candidate matches the clicked attribute
    if (candidates.length === 0) {
      candidates = [...siblings];
    }

    // Score siblings to find the best match preserving as many options as possible
    let bestMatch = null;
    let bestScore = -1;
    for (const s of candidates) {
      const sInfo = parseVariant(s.name);
      let score = 0;
      if (sInfo.color === targetColor) score += 1000;
      if (sInfo.size === targetSize) score += 100;
      if (sInfo.edge === targetEdge) score += 10;
      if (sInfo.opening === targetOpening) score += 5;
      if (sInfo.classicType === targetClassicType) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = s;
      }
    }

    if (bestMatch) {
      window.history.pushState({}, "", `/product/${bestMatch.id}`);
      setActiveSlug(String(bestMatch.id));
    }
  };

  const productName = product?.name || "Товар без названия";
  const {
    cleanTitle,
    parsedColor,
    parsedSize,
    parsedDimensions,
    parsedGlass,
    parsedEdge,
    parsedOpening,
    parsedClassicType,
  } = parseProductName(productName);
  const productBrand = (product?.brand || "").toLowerCase();
  const doorBrands = [
    "portika",
    "zadoor",
    "profildoors",
    "волховец",
    "volkhovets",
    "filomuro",
  ];
  const doorKeywords = [
    "двер",
    "door",
    "классико",
    "порта",
    "centro",
    "неоклассико",
  ];
  const isDoor = product
    ? doorKeywords.some((k) => productName.toLowerCase().includes(k)) ||
      doorBrands.some((b) => productBrand.includes(b))
    : false;
  // Kit calculator (box + trim) only for these brands
  const hasKitCalculator =
    isDoor && !["волховец", "volkhovets"].some((b) => productBrand.includes(b));
  const unit = product
    ? isDoor
      ? "шт"
      : getProductUnit(productName, product.category?.name || "")
    : "м²";

  // ── Calculations ──
  useEffect(() => {
    if (!product) return;
    if (unit === "шт") {
      setPacks(area);
    } else {
      const packSize = product.packSize || 2.13;
      const areaWithWaste = area * (1 + waste / 100);
      const neededPacks = Math.ceil(areaWithWaste / packSize);
      setPacks(neededPacks);
    }
  }, [area, waste, product, unit]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-16 dark:bg-[#0f172a]">
        <div className="mx-auto max-w-7xl px-4 pt-12 lg:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-100 lg:col-span-6 dark:bg-slate-900" />
            <div className="animate-pulse space-y-6 lg:col-span-6">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-24 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-12 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <p className="font-bold tracking-widest text-slate-400 uppercase">
          Товар не найден
        </p>
        <Link
          href="/outlet"
          className="border-b-2 border-[#2c3b6e] text-xs font-black tracking-widest text-[#2c3b6e] uppercase"
        >
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const doorLeafPrice = product.price_outlet || product.price || 0;
  const boxPrice =
    includeBox && selectedBox
      ? selectedBox.price || 0
      : accessories.boxes && accessories.boxes.length > 0
        ? accessories.boxes[0].price
        : 0;
  const trimPrice =
    includeTrim && selectedTrim
      ? selectedTrim.price || 0
      : accessories.trims && accessories.trims.length > 0
        ? accessories.trims[0].price
        : 0;

  const packSize = product.packSize;
  const pricePerM2 = product.pricePerM2;
  const totalArea = packs * packSize;
  const totalPrice = isDoor
    ? (doorLeafPrice +
        (includeBox ? boxPrice * 3 : 0) +
        (includeTrim ? trimPrice * 3 : 0)) *
      doorQuantity
    : unit === "шт"
      ? area * pricePerM2
      : totalArea * pricePerM2;
  const monthlyPayment = totalPrice / installmentMonths;

  const formatPrice = (num: any) => {
    const val = Number(num || 0);
    return Math.round(val)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const productColor = extractColor(productName);

  // installmentPartners loaded dynamically from installmentData.partners

  const tabs = [
    { id: "description", label: "Описание" },
    { id: "specs", label: "Характеристики" },
  ];

  const formatDescription = (text: string) => {
    if (!text) return null;

    // Split by sentences (dot followed by space and Capital letter)
    const sentences = text.split(/(?<=[.!?])\s+(?=[А-ЯA-Z])/);

    if (sentences.length <= 2) return <p>{text}</p>;

    const paragraphs: React.ReactNode[] = [];
    let currentGroup: string[] = [];
    let pCount = 0;

    sentences.forEach((sentence, idx) => {
      // Logic: group 2-3 sentences into a paragraph, or break if it's a "list-like" sentence
      const isListLike = /класс|мм|м²|упаковк|слой|конструк|бренд/i.test(
        sentence
      );

      if (isListLike && currentGroup.length > 0) {
        paragraphs.push(
          <p key={`p-${pCount++}`} className="mb-4">
            {currentGroup.join(" ")}
          </p>
        );
        currentGroup = [];
      }

      currentGroup.push(sentence);

      if (currentGroup.length >= 3 || idx === sentences.length - 1) {
        paragraphs.push(
          <p key={`p-${pCount++}`} className="mb-4">
            {currentGroup.join(" ")}
          </p>
        );
        currentGroup = [];
      }
    });

    return <div className="space-y-2">{paragraphs}</div>;
  };

  const isOrderOnly = product.category?.is_order_only || false;
  const isPreorder = product.category?.is_preorder || false;
  const pricePrefix = product.category?.price_prefix || "";
  const orderLink = product.category?.order_link || "https://t.me/maff_uz";

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-900">
      {/* ── Main Section ── */}
      <section className="mx-auto max-w-7xl px-4 py-3 lg:px-6 lg:py-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
          {/* Visuals - Catalog Style Card */}
          <div className="space-y-4 lg:sticky lg:top-[180px] lg:col-span-6">
            <div className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-2 lg:p-3 shadow-none">
              <div
                className={cn(
                  "group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl lg:rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 transition-colors duration-500",
                  isDoor ? "p-4 lg:p-6" : ""
                )}
              >
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={productName}
                  fill
                  className={cn(
                    "transition-transform duration-1000 group-hover:scale-105",
                    isDoor ? "object-contain p-2" : "object-cover"
                  )}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <ImageIcon className="h-16 w-16 dark:text-white" />
                  <span className="text-xs font-black tracking-widest uppercase dark:text-white">
                    Нет фото
                  </span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 lg:gap-3 px-1 lg:px-2">
                {product.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-slate-50 transition-all dark:bg-slate-900/50",
                      activeImage === img
                        ? "border-[#2c3b6e] dark:border-blue-500"
                        : "border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                      isDoor ? "p-1" : ""
                    )}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${i}`}
                      fill
                      className={cn(
                        "transition-transform duration-500",
                        isDoor ? "object-contain p-1" : "object-cover",
                        activeImage === img
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-100"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Info Zone - Catalog Style Card */}
          <div className="flex flex-col lg:col-span-6">
            <div className="bg-white dark:bg-[#161d2f] rounded-2xl lg:rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-4 lg:p-6 shadow-none h-full">
            {/* ── Top Badge ── */}
            <div className="mb-4">
              {product.category && (
                <Link
                  href={`/catalog?category=${product.category.id}`}
                  className="inline-flex items-center gap-1.5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-[#2c3b6e] dark:text-blue-400 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2c3b6e] dark:bg-blue-400" />
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* ── Header & Desc ── */}
            <div>
              <h1 className="mb-3 text-2xl leading-tight font-bold tracking-tight text-slate-950 lg:text-3xl dark:text-white">
                {cleanTitle}
              </h1>

              {product.description && (
                <div className="text-xs leading-relaxed font-normal text-slate-500 lg:text-sm dark:text-slate-400">
                  {formatDescription(product.description)}
                </div>
              )}
            </div>

            {/* ── Price & Primary Action ── */}
            <div className="flex flex-col justify-between gap-4 py-1 sm:flex-row sm:items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-950 tabular-nums lg:text-4xl dark:text-white">
                  {isOrderOnly && pricePrefix ? (
                    <span className="mr-1 text-xl font-bold">
                      {pricePrefix}
                    </span>
                  ) : null}
                  {formatPrice(product.price_outlet || product.price)}
                </span>
                <span className="ml-1 text-sm font-semibold text-slate-400">
                  сум
                </span>
              </div>
              {isOrderOnly || isPreorder ? (
                <a
                  href={orderLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2c3b6e] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {isPreorder && !isOrderOnly ? "Под заказ" : "Заказать"}
                </a>
              ) : (
                <button
                  disabled={!(product.stock && product.stock > 0)}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all sm:w-auto",
                    product.stock && product.stock > 0
                      ? "bg-[#2c3b6e] text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                      : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  )}
                >
                  {product.stock && product.stock > 0
                    ? "В корзину"
                    : "Нет на складе"}
                </button>
              )}
            </div>

            <div className="my-1 h-px w-full bg-slate-100 dark:bg-slate-800/60" />

            {/* ── Variants ── */}
            {isDoor && siblings.length > 1 && (
              <div className="space-y-4">
                {/* 1. Colors */}
                {variants.colors.length > 1 && (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="pt-1">
                      <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                        Цвет
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {currentVariantInfo.color}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.colors.map((c) => {
                        const isActive = currentVariantInfo.color === c;
                        const hex = getColorHex(c);

                        // Find a sibling with that color that has a valid photo, otherwise fallback
                        const siblingWithColor =
                          siblings.find((s: any) => {
                            const v = parseVariant(s.name);
                            const url = cleanUrl(s.image_url || s.images?.[0]);
                            return v.color === c && url;
                          }) ||
                          siblings.find(
                            (s: any) => parseVariant(s.name).color === c
                          );

                        const imgUrl = cleanUrl(
                          siblingWithColor?.image_url ||
                            siblingWithColor?.images?.[0]
                        );

                        return (
                          <button
                            key={c}
                            onClick={() =>
                              handleVariantChange(
                                c,
                                undefined,
                                undefined,
                                undefined,
                                undefined
                              )
                            }
                            title={c}
                            className={cn(
                              "group relative h-14 w-10 rounded-lg p-[2px] transition-all duration-300 lg:h-15 lg:w-11",
                              isActive
                                ? "border-2 border-slate-950 dark:border-white"
                                : "border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                            )}
                          >
                            <div
                              className="relative h-full w-full overflow-hidden rounded-[4px]"
                              style={!imgUrl ? { backgroundColor: hex } : {}}
                            >
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={c}
                                  fill
                                  className={cn(
                                    "object-cover transition-opacity",
                                    isActive
                                      ? "opacity-100"
                                      : "opacity-80 group-hover:opacity-100"
                                  )}
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-400 select-none">
                                  {c.substring(0, 2)}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Sizes */}
                {variants.sizes.length > 1 && (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                        Размер
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.sizes.map((sz) => {
                        const isActive = currentVariantInfo.size === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() =>
                              handleVariantChange(
                                undefined,
                                sz,
                                undefined,
                                undefined,
                                undefined
                              )
                            }
                            className={cn(
                              "rounded-lg px-4 py-2 text-xs font-bold transition-all",
                              isActive
                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            )}
                          >
                            {sz} мм
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Edges */}
                {variants.edges.length > 1 && (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      Кромка
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.edges.map((edge) => {
                        const isActive = currentVariantInfo.edge === edge;
                        return (
                          <button
                            key={edge}
                            onClick={() =>
                              handleVariantChange(
                                undefined,
                                undefined,
                                edge,
                                undefined,
                                undefined
                              )
                            }
                            className={cn(
                              "rounded-lg px-4 py-2 text-xs font-bold transition-all",
                              isActive
                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            )}
                          >
                            {edge}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Openings */}
                {variants.openings.length > 1 && (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      Открывание
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.openings.map((op) => {
                        const isActive = currentVariantInfo.opening === op;
                        return (
                          <button
                            key={op}
                            onClick={() =>
                              handleVariantChange(
                                undefined,
                                undefined,
                                undefined,
                                op,
                                undefined
                              )
                            }
                            className={cn(
                              "rounded-lg px-4 py-2 text-xs font-bold transition-all",
                              isActive
                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            )}
                          >
                            {op}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. Classic Types */}
                {variants.classicTypes.length > 1 && (
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      Тип остекления
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.classicTypes.map((ct) => {
                        const isActive = currentVariantInfo.classicType === ct;
                        return (
                          <button
                            key={ct}
                            onClick={() =>
                              handleVariantChange(
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                ct
                              )
                            }
                            className={cn(
                              "rounded-lg px-4 py-2 text-xs font-bold transition-all",
                              isActive
                                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            )}
                          >
                            {ct}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="my-1 h-px w-full bg-slate-100 dark:bg-slate-800/60" />

            {/* ── Calculator ── */}
            {hasKitCalculator ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Количество дверей
                  </span>
                  <div className="dark:border-slate-850 flex items-center gap-4 rounded-full border border-slate-100 bg-slate-50 px-2 py-1 dark:bg-slate-900">
                    <button
                      onClick={() =>
                        setDoorQuantity(Math.max(1, doorQuantity - 1))
                      }
                      className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={doorQuantity}
                      onChange={(e) =>
                        setDoorQuantity(Math.max(1, Number(e.target.value)))
                      }
                      className="w-6 bg-transparent text-center text-xs font-bold text-slate-950 outline-none dark:text-white"
                    />
                    <button
                      onClick={() => setDoorQuantity(doorQuantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 1. Box / Коробка */}
                  <div
                    className={cn(
                      "p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 bg-white dark:bg-slate-900/50",
                      includeBox
                        ? "border-slate-300 dark:border-slate-700"
                        : "border-slate-100 dark:border-slate-800/60 opacity-80"
                    )}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeBox}
                        onChange={(e) => setIncludeBox(e.target.checked)}
                        className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-grow flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Дверной короб (3 шт.)
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                          +{formatPrice(boxPrice * 3)} сум
                        </span>
                      </div>
                    </label>

                    {includeBox && accessories.boxes && accessories.boxes.length > 0 && (
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => setIsBoxSelectOpen(!isBoxSelectOpen)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-300"
                        >
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                              {selectedBox?.name || "Выберите короб"}
                            </span>
                            {selectedBox?.sku && (
                              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                                Артикул: {selectedBox.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatPrice(selectedBox?.price || 0)} сум/шт
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-slate-400 transition-transform duration-300",
                                isBoxSelectOpen ? "rotate-180" : ""
                              )}
                            />
                          </div>
                        </button>

                        {isBoxSelectOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-250/80 dark:border-slate-800/80 rounded-xl z-[100] max-h-60 overflow-y-auto no-scrollbar py-1.5 shadow-xl">
                            {accessories.boxes.map((b: any) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBox(b);
                                  setIsBoxSelectOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-200 border-b border-slate-50 dark:border-slate-900/40 last:border-0",
                                  selectedBox?.id === b.id
                                    ? "bg-slate-50 dark:bg-slate-900/60 text-[#2c3b6e] dark:text-blue-400 font-bold"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300"
                                )}
                              >
                                <div className="flex flex-col gap-0.5 max-w-[70%]">
                                  <span className="text-xs font-bold leading-tight">
                                    {b.name}
                                  </span>
                                  {b.sku && (
                                    <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                      Артикул: {b.sku}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold tabular-nums">
                                  {formatPrice(b.price)} сум
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {includeBox && (!accessories.boxes || accessories.boxes.length === 0) && (
                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic px-1">
                        Стандартный короб для {accessories.color || "этого цвета"} (234 000 сум/шт)
                      </div>
                    )}
                  </div>

                  {/* 2. Trim / Наличники */}
                  <div
                    className={cn(
                      "p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 bg-white dark:bg-slate-900/50",
                      includeTrim
                        ? "border-slate-300 dark:border-slate-700"
                        : "border-slate-100 dark:border-slate-800/60 opacity-80"
                    )}
                  >
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeTrim}
                        onChange={(e) => setIncludeTrim(e.target.checked)}
                        className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-grow flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Наличники (3 шт.)
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                          +{formatPrice(trimPrice * 3)} сум
                        </span>
                      </div>
                    </label>

                    {includeTrim && accessories.trims && accessories.trims.length > 0 && (
                      <div className="relative mt-1">
                        <button
                          type="button"
                          onClick={() => setIsTrimSelectOpen(!isTrimSelectOpen)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-300"
                        >
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                              {selectedTrim?.name || "Выберите наличник"}
                            </span>
                            {selectedTrim?.sku && (
                              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                                Артикул: {selectedTrim.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                              {formatPrice(selectedTrim?.price || 0)} сум/шт
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-slate-400 transition-transform duration-300",
                                isTrimSelectOpen ? "rotate-180" : ""
                              )}
                            />
                          </div>
                        </button>

                        {isTrimSelectOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-250/80 dark:border-slate-800/80 rounded-xl z-[100] max-h-60 overflow-y-auto no-scrollbar py-1.5 shadow-xl">
                            {accessories.trims.map((t: any) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setSelectedTrim(t);
                                  setIsTrimSelectOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2.5 flex items-center justify-between transition-all duration-200 border-b border-slate-50 dark:border-slate-900/40 last:border-0",
                                  selectedTrim?.id === t.id
                                    ? "bg-slate-50 dark:bg-slate-900/60 text-[#2c3b6e] dark:text-blue-400 font-bold"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-300"
                                )}
                              >
                                <div className="flex flex-col gap-0.5 max-w-[70%]">
                                  <span className="text-xs font-bold leading-tight">
                                    {t.name}
                                  </span>
                                  {t.sku && (
                                    <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                                      Артикул: {t.sku}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold tabular-nums">
                                  {formatPrice(t.price)} сум
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {includeTrim && (!accessories.trims || accessories.trims.length === 0) && (
                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic px-1">
                        Стандартный наличник для {accessories.color || "этого цвета"} (143 000 сум/шт)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    Итого за комплект
                  </span>
                  <span className="text-xl font-bold text-slate-950 dark:text-white">
                    {formatPrice(totalPrice)} сум
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  {unit === "шт" ? "Количество" : "Площадь"}
                </span>
                <div className="flex items-center gap-4 rounded-full bg-slate-50 px-2 py-1 dark:bg-slate-800/50">
                  <button
                    onClick={() => setArea(Math.max(1, area - 1))}
                    className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-8 bg-transparent text-center text-sm font-bold text-slate-950 outline-none dark:text-white"
                  />
                  <button
                    onClick={() => setArea(area + 1)}
                    className="flex h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Tabs ── */}
            <div className="pt-4">
              <div className="mb-6 flex max-w-sm rounded-full bg-slate-50 p-1 dark:bg-slate-800/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 rounded-full py-2 text-[11px] font-bold whitespace-nowrap transition-all lg:text-xs",
                      activeTab === tab.id
                        ? "border border-slate-100 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in duration-500">
                {activeTab === "description" && (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed text-slate-500 lg:text-sm">
                    {formatDescription(
                      product.description || "Нет дополнительного описания."
                    )}
                  </div>
                )}
                {activeTab === "specs" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(() => {
                      const specs: { l: string; v: string }[] = [];
                      if (
                        product.specifications &&
                        typeof product.specifications === "object"
                      ) {
                        Object.entries(product.specifications).forEach(
                          ([key, value]) => {
                            specs.push({ l: key, v: String(value || "-") });
                          }
                        );
                      }
                      if (
                        !specs.find((s: any) => s.l === "Бренд") &&
                        product.brand
                      )
                        specs.unshift({ l: "Бренд", v: product.brand });
                      if (
                        !specs.find(
                          (s: any) => s.l === "Страна производства"
                        ) &&
                        product.country
                      )
                        specs.unshift({
                          l: "Страна производства",
                          v: product.country,
                        });
                      if (specs.length === 0) {
                        specs.push({ l: "Бренд", v: product.brand || "MAFF" });
                      }
                      return specs.map((s) => (
                        <div
                          key={s.l}
                          className="flex flex-col gap-0.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/30"
                        >
                          <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                            {s.l}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {s.v}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Similar Products ── */}
      {similarProducts.length > 0 && (
        <section className="mx-auto max-w-7xl border-t border-slate-50 px-4 py-10 lg:px-6 lg:py-16 dark:border-slate-800">
          <div className="mb-8 flex items-center justify-between lg:mb-12">
            <div>
              <h2 className="mb-1 text-xl font-black tracking-tighter text-slate-900 uppercase lg:mb-2 lg:text-3xl dark:text-white">
                {isAccessories ? accessoriesTitle : "Похожие товары"}
              </h2>
              <p className="text-[8px] font-black tracking-widest text-slate-400 uppercase lg:text-[10px] dark:text-slate-500">
                {isAccessories
                  ? "Рекомендуемые сопутствующие товары"
                  : "Вам также может понравиться"}
              </p>
            </div>
            <Link
              href="/outlet"
              className="group flex items-center gap-2 text-[8px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-slate-900 lg:text-[10px] dark:text-slate-500 dark:hover:text-white"
            >
              Смотреть все
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 lg:h-4 lg:w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {similarProducts.map((p) => {
              let simOrderOnly = false;
              let simPreorder = false;
              let simOrderLink = "";
              let currentCat = categories.find(
                (c: any) => c.id === p.category_id
              );
              const visited = new Set();
              while (currentCat && !visited.has(currentCat.id)) {
                visited.add(currentCat.id);
                if (currentCat.is_order_only) {
                  simOrderOnly = true;
                }
                if (currentCat.is_preorder) {
                  simPreorder = true;
                }
                if (!simOrderLink && currentCat.order_link) {
                  simOrderLink = currentCat.order_link;
                }
                if (currentCat.parent_id) {
                  currentCat = categories.find(
                    (c: any) => c.id === currentCat.parent_id
                  );
                } else {
                  break;
                }
              }
              return (
                <div key={p.id} className="group relative h-full">
                  <ProductCard
                    id={p.id}
                    title={p.name}
                    price={p.price || 0}
                    priceOutlet={
                      p.price_outlet ? Number(p.price_outlet) : undefined
                    }
                    image={cleanUrl(p.image_url) || ""}
                    brand={p.brand || "MAFF"}
                    country={p.country || "Европа"}
                    grade={p.grade || "Premium"}
                    thickness={p.thickness || "8мм"}
                    inStock={p.stock > 0}
                    isOrderOnly={simOrderOnly}
                    isPreorder={simPreorder}
                    orderLink={simOrderLink}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
