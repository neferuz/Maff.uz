"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { cn, cleanNameFromDimensions, getShortDoorName } from "@/lib/utils";
import { useShop } from "@/context/shop-context";
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
    "Keramik Valse",
    "Rocks Beige",
    "Rocks Pearl",
    "Nardo Grey",
    "Alpik Oak",
    "Black Star",
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

  let colorScanText = normYo(cleaned);
  for (const c of sortedColors) {
    const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp(
      "(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])",
      "i"
    );
    if (reg.test(colorScanText)) {
      if (!parsedColorsList.includes(c)) {
        parsedColorsList.push(c);
      }
      const replaceReg = new RegExp(
        "(^|[^а-яa-z0-9])" + escapedC + "(?=$|[^а-яa-z0-9])",
        "gi"
      );
      colorScanText = colorScanText.replace(replaceReg, "$1 ");
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
    parsedColor: (parsedColorsList.join(" / ") || "Не указан").replace(/\s*\/\s*/g, " / ").trim(),
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

const normalizeSize = (sz: string) => {
  if (!sz) return "";
  let clean = sz.replace(/[xх\*×]/gi, "*").replace(/\s+/g, "");
  
  const parts = clean.split("*");
  if (parts.length === 3) {
    return clean; // e.g. 35*600*2000
  }
  if (parts.length === 2) {
    const num1 = parseInt(parts[0]);
    const num2 = parseInt(parts[1]);
    if (!isNaN(num1) && !isNaN(num2)) {
      const width = num1 < num2 ? num1 : num2;
      const height = num1 > num2 ? num1 : num2;
      return `${height}*${width}`;
    }
  }
  return clean;
};

const formatSizeForDisplay = (sz: string) => {
  if (!sz) return "";
  const clean = sz.replace(/[xх\*×]/gi, "*").replace(/\s+/g, "");
  const parts = clean.split("*");
  
  if (parts.length === 3) {
    const thick = parts[0];
    const width = parts[1];
    const height = parts[2];
    if (height === "2000") {
      return `${width} мм`;
    }
    return `${height}*${width} мм`;
  }
  
  if (parts.length === 2) {
    const height = parts[0];
    const width = parts[1];
    if (height === "2000") {
      return `${width} мм`;
    }
    return `${height}*${width} мм`;
  }
  
  if (/^\d+$/.test(clean)) {
    return `${clean} мм`;
  }
  return `${sz} мм`;
};

const parseVariant = (name: string) => {
  const parsed = parseProductName(name);
  return {
    baseModel: parsed.cleanTitle,
    color: parsed.parsedColor,
    size: normalizeSize(parsed.parsedDimensions || parsed.parsedSize),
    parsedDimensions: parsed.parsedDimensions,
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
  initialProduct,
}: {
  params: { slug: string };
  initialProduct?: any;
}) {
  const router = useRouter();
  const { addToCart } = useShop();

  // ── Pre-process initialProduct if needed
  const cleanedInitImages = Array.from(new Set(initialProduct?.images?.map((img: string) => cleanUrl(img)).filter(Boolean) || []));
  const enrichedInitProduct = initialProduct ? {
    ...initialProduct,
    packSize: initialProduct.pack_size || 1.0,
    pricePerM2: initialProduct.price_outlet || initialProduct.price || 0,
    images: cleanedInitImages,
  } : null;

  // ── State ──
  const [activeSlug, setActiveSlug] = useState<string>(params.slug);
  const [product, setProduct] = useState<any>(enrichedInitProduct);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isAccessories, setIsAccessories] = useState(false);
  const [accessoriesTitle, setAccessoriesTitle] = useState(
    "С этим товаром покупают"
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!enrichedInitProduct);
  const [area, setArea] = useState(1);
  const [packs, setPacks] = useState(1);
  const [waste, setWaste] = useState(0); // percentage
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const hasInitDesc = enrichedInitProduct?.description && enrichedInitProduct.description.trim().length > 0;
  const [activeTab, setActiveTab] = useState(hasInitDesc ? "description" : "specs");
  
  const initPrimaryImage = enrichedInitProduct ? (
    cleanUrl(enrichedInitProduct.image_url) ||
    (enrichedInitProduct.images?.length > 0 ? enrichedInitProduct.images[0] : null)
  ) : null;
  const [activeImage, setActiveImage] = useState<string | null>(initPrimaryImage);
  const [siblings, setSiblings] = useState<any[]>([]);
  const [variants, setVariants] = useState<{
    colors: string[];
    sizes: string[];
    widths: string[];
    heights: string[];
    edges: string[];
    openings: string[];
    classicTypes: string[];
  }>({
    colors: [],
    sizes: [],
    widths: [],
    heights: [],
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
  const [activePartner, setActivePartner] = useState<any>(null);

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
  const [isColorSelectOpen, setIsColorSelectOpen] = useState(false);
  const [isSizeSelectOpen, setIsSizeSelectOpen] = useState(false);

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
            if (c.partners && c.partners.length > 0) {
              setActivePartner(c.partners[0]);
            }
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
        if (!product) {
          setIsLoading(true);
        }
        const res = await fetch(`/api/v1/products/${activeSlug}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();

        // Clean images array
        const rawImages = data.images || [];
        const cleanedImages = Array.from(new Set(rawImages
          .map((img: string) => cleanUrl(img))
          .filter(Boolean))) as string[];

        // Enrich data with defaults/calculated if missing
        const enrichedProduct = {
          ...data,
          packSize: data.pack_size || 1.0,
          pricePerM2: data.price_outlet || data.price || 0,
          images: cleanedImages,
        };

        setProduct(enrichedProduct);
        
        const hasDesc = enrichedProduct.description && enrichedProduct.description.trim().length > 0;
        setActiveTab(hasDesc ? "description" : "specs");

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

              uniqueSizes.sort((a, b) => {
                const getWidth = (str: string) => {
                  const matches = str.match(/\d+/g);
                  if (!matches) return parseInt(str) || 0;
                  // Usually width is the middle or largest value (e.g. 600, 700, 800)
                  return Math.max(...matches.map(Number).filter(n => n >= 400 && n <= 1000)) || parseInt(str) || 0;
                };
                return getWidth(a) - getWidth(b);
              });

              const uniqueWidths = Array.from(
                new Set(
                  uniqueSizes.map((sz) => {
                    const parts = sz.split("*");
                    return parts.length === 2 ? parts[1] : (parts.length === 3 ? parts[1] : sz);
                  }).filter(Boolean)
                )
              ) as string[];

              const uniqueHeights = Array.from(
                new Set(
                  uniqueSizes.map((sz) => {
                    const parts = sz.split("*");
                    return parts.length === 2 ? parts[0] : (parts.length === 3 ? parts[2] : "");
                  }).filter(Boolean)
                )
              ) as string[];

              uniqueWidths.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
              uniqueHeights.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

              setVariants({
                colors: uniqueColors,
                sizes: uniqueSizes,
                widths: uniqueWidths,
                heights: uniqueHeights,
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
    newClassicType?: string,
    newWidth?: string,
    newHeight?: string
  ) => {
    const targetColor =
      newColor !== undefined ? newColor : currentVariantInfo.color;
    const targetEdge =
      newEdge !== undefined ? newEdge : currentVariantInfo.edge;
    const targetOpening =
      newOpening !== undefined ? newOpening : currentVariantInfo.opening;
    const targetClassicType =
      newClassicType !== undefined
        ? newClassicType
        : currentVariantInfo.classicType;

    let targetSize = newSize !== undefined ? newSize : currentVariantInfo.size;

    // Calculate targetSize based on width and height if either is updated
    if (newWidth !== undefined || newHeight !== undefined) {
      const currentSizeParts = currentVariantInfo.size.split("*");
      const currentHeight = currentSizeParts.length === 2 ? currentSizeParts[0] : (currentSizeParts.length === 3 ? currentSizeParts[2] : "");
      const currentWidth = currentSizeParts.length === 2 ? currentSizeParts[1] : (currentSizeParts.length === 3 ? currentSizeParts[1] : currentVariantInfo.size);

      const nextHeight = newHeight !== undefined ? newHeight : currentHeight;
      const nextWidth = newWidth !== undefined ? newWidth : currentWidth;

      targetSize = nextHeight ? `${nextHeight}*${nextWidth}` : nextWidth;
    }

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
    if (newWidth !== undefined || newHeight !== undefined) {
      candidates = candidates.filter((s) => {
        const sSize = parseVariant(s.name).size;
        const sParts = sSize.split("*");
        const sHeight = sParts.length === 2 ? sParts[0] : (sParts.length === 3 ? sParts[2] : "");
        const sWidth = sParts.length === 2 ? sParts[1] : (sParts.length === 3 ? sParts[1] : sSize);

        if (newWidth !== undefined && sWidth !== newWidth) return false;
        if (newHeight !== undefined && sHeight !== newHeight) return false;
        return true;
      });
    }
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
      if (s.price && s.price > 0) score += 500; // Strongly prefer items with actual prices

      if (score > bestScore) {
        bestScore = score;
        bestMatch = s;
      }
    }

    if (bestMatch) {
      // Optimistic update for instant visual feedback
      const newImg = cleanUrl(bestMatch.image_url || bestMatch.images?.[0]);
      if (newImg) setActiveImage(newImg);
      setCurrentVariantInfo(parseVariant(bestMatch.name));
      setProduct((prev: any) => ({ ...prev, ...bestMatch }));

      window.history.replaceState({}, "", `/product/${bestMatch.id}`);
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

  const hasDescription = product?.description && product.description.trim().length > 0;
  const tabs = [
    ...(hasDescription ? [{ id: "description", label: "Описание" }] : []),
    { id: "specs", label: "Характеристики" },
  ];

  const formatDescription = (text: string) => {
    if (!text) return null;

    const sentences = text.split(/(?<=[.!?])\s+(?=[А-ЯA-Z])/);

    if (sentences.length <= 2) return <p>{text}</p>;

    const paragraphs: React.ReactNode[] = [];
    let currentGroup: string[] = [];
    let pCount = 0;

    sentences.forEach((sentence, idx) => {
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

  const productCategory = categories.find((c: any) => c.id === product.category_id);
  const isOrderOnly = product.category?.is_order_only || productCategory?.is_order_only || false;
  const isPreorder = product.category?.is_preorder || productCategory?.is_preorder || false;
  const pricePrefix = product.category?.price_prefix || productCategory?.price_prefix || "";
  const orderLink = product.category?.order_link || productCategory?.order_link || "https://t.me/maff_uz";

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-3 lg:px-6 lg:py-8">
        <div className="mb-6 flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
            Главная
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-350 shrink-0" />
          <Link href="/catalog" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
            Каталог
          </Link>
          {productCategory && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-350 shrink-0" />
              <Link href={`/catalog?category=${productCategory.id}`} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
                {productCategory.name}
              </Link>
            </>
          )}
          {product.brand && (!productCategory || productCategory.name.toLowerCase() !== product.brand.toLowerCase()) && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-350 shrink-0" />
              <Link href={`/catalog?brand=${product.brand}`} className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
                {product.brand}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-slate-350 shrink-0" />
          <span className="text-slate-800 dark:text-slate-300 font-extrabold truncate max-w-[200px] sm:max-w-xs md:max-w-sm shrink-0">
            {cleanNameFromDimensions(product.name)}
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-3 lg:sticky lg:top-[180px] lg:col-span-6">
            <div
              className={cn(
                "group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 lg:rounded-2xl dark:border-slate-800 dark:bg-slate-800/50",
                isDoor ? "p-6 lg:p-10" : ""
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
              <div className="grid grid-cols-4 gap-2 lg:gap-3">
                {product.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-slate-50 transition-all lg:rounded-2xl dark:bg-slate-800/50",
                      activeImage === img
                        ? "border-[#2c3b6e] ring-2 ring-blue-100 dark:border-blue-500 dark:ring-blue-900/30"
                        : "border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                      isDoor ? "p-2" : ""
                    )}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${i}`}
                      fill
                      className={cn(
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

          <div className="flex flex-col space-y-2 pt-0 lg:col-span-6 lg:pt-1">
            <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center flex-wrap gap-2 leading-none">
              <span>{product.brand || "Maff"}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{product.country || "Европа"}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{product.stock && product.stock > 0 ? "В НАЛИЧИИ" : "ПОД ЗАКАЗ"}</span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white uppercase">
              {isDoor ? getShortDoorName(product.name) : cleanNameFromDimensions(product.name)}
            </h1>

            {/* Price & Fast Installment Box */}
            <div className="rounded-xl border border-slate-100/80 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                {(product.price_outlet || product.price) > 0 ? (
                  <>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                      Цена за {unit}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-slate-950 tabular-nums lg:text-4xl dark:text-white">
                        {isOrderOnly && pricePrefix ? (
                          <span className="mr-1 text-xl font-bold">{pricePrefix}</span>
                        ) : null}
                        {formatPrice(product.price_outlet || product.price)}
                      </span>
                      <span className="text-sm font-semibold text-slate-400 uppercase">
                        сум
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-1.5 mt-2 mb-2">
                    <span className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                      {isDoor && product.brand === "Волховец" ? "Под заказ" : "Уточнить у администрации"}
                    </span>
                    {isDoor && product.brand === "Волховец" && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Индивидуальный расчет стоимости
                      </span>
                    )}
                  </div>
                )}
              </div>
              

            </div>

            {isDoor && siblings.length > 1 && (
              <div className="rounded-xl border border-slate-100/80 bg-white dark:border-slate-800/60 dark:bg-slate-900/10 p-3 space-y-3">
                {variants.colors.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                        Цвет:
                      </span>
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                        {currentVariantInfo.color}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {variants.colors.map((c) => {
                        const isActive = currentVariantInfo.color === c;
                        const hex = getColorHex(c);

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
                              "group relative w-12 h-16 rounded-none overflow-hidden transition-all duration-300 focus:outline-none flex-shrink-0 bg-slate-50 dark:bg-slate-800",
                              isActive
                                ? "border-2 border-[#2c3b6e] dark:border-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30"
                                : "border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:-translate-y-0.5"
                            )}
                          >
                            <div className="relative h-full w-full">
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={c}
                                  fill
                                  className={cn(
                                    "object-contain p-1 transition-opacity duration-300",
                                    isActive
                                      ? "opacity-100"
                                      : "opacity-80 group-hover:opacity-100"
                                  )}
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-500 select-none uppercase" style={{ backgroundColor: hex }}>
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

                {variants.sizes.length > 0 && (
                  <div className="relative inline-block w-full sm:w-auto">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-2">
                      Размер:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizeSelectOpen(!isSizeSelectOpen)}
                      className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 rounded-xl px-4 py-2 flex items-center justify-between gap-4 text-left transition-all duration-300 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
                    >
                      <span className="text-sm font-bold text-slate-850 dark:text-slate-200">
                        {formatSizeForDisplay(currentVariantInfo.size) || "Выберите размер"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-500 transition-transform duration-300",
                          isSizeSelectOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    
                    {isSizeSelectOpen && (
                      <div className="absolute left-0 top-full mt-1 min-w-full w-max bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl z-[100] py-1.5 px-1 flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                        {variants.sizes.map((sz) => {
                          const isActive = currentVariantInfo.size === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                handleVariantChange(undefined, sz, undefined, undefined, undefined);
                                setIsSizeSelectOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 rounded-lg transition-all duration-200",
                                isActive
                                  ? "bg-slate-100 dark:bg-slate-800 text-[#2c3b6e] dark:text-blue-400 font-bold"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold"
                              )}
                            >
                              <span className="text-sm">{formatSizeForDisplay(sz)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Calculator & Quantity Selector ── */}
            {hasKitCalculator ? (
              <div className="space-y-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    Количество дверей
                  </span>
                  <div className="flex items-center gap-4 rounded-full border border-slate-200/60 bg-white px-2 py-1 dark:border-slate-800 dark:bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setDoorQuantity(Math.max(1, doorQuantity - 1))}
                      className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={doorQuantity}
                      onChange={(e) => setDoorQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-8 bg-transparent text-center text-xs font-bold text-slate-955 outline-none dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setDoorQuantity(doorQuantity + 1)}
                      className="flex h-6 w-6 items-center justify-center text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Box Selector */}
                  <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeBox}
                        onChange={(e) => setIncludeBox(e.target.checked)}
                        className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-grow flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Дверной короб (3 шт.)
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                          +{formatPrice(boxPrice * 3)} сум
                        </span>
                      </div>
                    </label>

                    {includeBox && accessories.boxes && accessories.boxes.length > 0 && (
                      <div className="pl-7 mt-1">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsBoxSelectOpen(!isBoxSelectOpen)}
                            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {selectedBox?.name || "Выберите короб"}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300",
                                isBoxSelectOpen ? "rotate-180" : ""
                              )}
                            />
                          </button>
                          
                          {isBoxSelectOpen && (
                            <div className="mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg max-h-48 overflow-y-auto no-scrollbar shadow-sm">
                              {accessories.boxes.map((b: any) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBox(b);
                                    setIsBoxSelectOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors",
                                    selectedBox?.id === b.id
                                      ? "bg-slate-50 dark:bg-slate-800 text-[#2c3b6e] dark:text-blue-400 font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                  )}
                                >
                                  <span className="truncate pr-2">{b.name}</span>
                                  <span className="shrink-0 tabular-nums">{formatPrice(b.price)} сум</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trim Selector */}
                  <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-all hover:border-slate-200 dark:hover:border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeTrim}
                        onChange={(e) => setIncludeTrim(e.target.checked)}
                        className="rounded border-slate-300 text-[#2c3b6e] focus:ring-[#2c3b6e] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-grow flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Наличники (3 шт.)
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                          +{formatPrice(trimPrice * 3)} сум
                        </span>
                      </div>
                    </label>

                    {includeTrim && accessories.trims && accessories.trims.length > 0 && (
                      <div className="pl-7 mt-1">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsTrimSelectOpen(!isTrimSelectOpen)}
                            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {selectedTrim?.name || "Выберите наличник"}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300",
                                isTrimSelectOpen ? "rotate-180" : ""
                              )}
                            />
                          </button>
                          
                          {isTrimSelectOpen && (
                            <div className="mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg max-h-48 overflow-y-auto no-scrollbar shadow-sm">
                              {accessories.trims.map((t: any) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTrim(t);
                                    setIsTrimSelectOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors",
                                    selectedTrim?.id === t.id
                                      ? "bg-slate-50 dark:bg-slate-800 text-[#2c3b6e] dark:text-blue-400 font-bold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                  )}
                                >
                                  <span className="truncate pr-2">{t.name}</span>
                                  <span className="shrink-0 tabular-nums">{formatPrice(t.price)} сум</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-150/40 dark:border-slate-800/80 pt-4">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    Итого за комплект
                  </span>
                  <span className="text-xl font-bold text-slate-950 dark:text-white">
                    {formatPrice(totalPrice)} сум
                  </span>
                </div>
              </div>
            ) : (
              // Twin interactive cards layout for flooring/laminate
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Square area card */}
                <div className="rounded-xl border border-slate-100/80 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/30 p-3 flex flex-col justify-between gap-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-500 uppercase">
                    {unit === "шт" ? "Количество" : "Площадь"}
                  </span>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-full border border-slate-150/40 dark:border-slate-800/80 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setArea(Math.max(1, area - 1))}
                      className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                      className="w-12 bg-transparent text-center text-sm font-extrabold text-slate-955 outline-none dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setArea(area + 1)}
                      className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Total packs card */}
                {unit !== "шт" && (
                  <div className="rounded-xl border border-slate-100/80 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/30 p-3 flex flex-col justify-between gap-2">
                    <span className="text-[10px] font-black tracking-widest text-slate-455 dark:text-slate-500 uppercase">
                      Итого упаковок
                    </span>
                    <div className="py-1">
                      <span className="text-3xl font-extrabold text-slate-955 dark:text-white tabular-nums">
                        {packs}
                      </span>
                      <span className="ml-1 text-sm font-bold text-slate-500 uppercase">
                        уп
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Checkout Actions ── */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                {isOrderOnly || isPreorder ? (
                  <a
                    href={orderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2c3b6e] px-8 py-3.5 text-xs uppercase tracking-widest font-black text-white transition-all duration-350 hover:bg-slate-955 hover:-translate-y-0.5 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    {isPreorder && !isOrderOnly ? "Под заказ" : "Заказать"}
                  </a>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={!(product.stock && product.stock > 0)}
                      onClick={() => {
                        const qty = isDoor ? doorQuantity : (unit === "шт" ? area : packs);
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price_outlet || product.price || 0,
                          image: activeImage || "",
                          variant: `${currentVariantInfo.color || ""} ${currentVariantInfo.size || ""}`.trim() || product.brand || "Default"
                        }, qty);
                      }}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs uppercase tracking-widest font-black transition-all duration-350 hover:-translate-y-0.5",
                        product.stock && product.stock > 0
                          ? "bg-[#2c3b6e] text-white hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500"
                          : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      )}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {product.stock && product.stock > 0 ? "В корзину" : "Нет на складе"}
                    </button>
                    {product.stock && product.stock > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const qty = isDoor ? doorQuantity : (unit === "шт" ? area : packs);
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price_outlet || product.price || 0,
                            image: activeImage || "",
                            variant: `${currentVariantInfo.color || ""} ${currentVariantInfo.size || ""}`.trim() || product.brand || "Default"
                          }, qty);
                          router.push("/cart");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2c3b6e] bg-transparent px-6 py-3.5 text-xs uppercase tracking-widest font-black text-[#2c3b6e] hover:bg-[#2c3b6e] hover:text-white dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-350 hover:-translate-y-0.5"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Купить сразу
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* ── Installment Card (Collapsible/Sleek) ── */}
              {((product.price_outlet || product.price) > 0 || isDoor) && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                      Калькулятор рассрочки
                    </span>
                    <div className="relative h-5 w-16 flex items-center opacity-80">
                      {(() => {
                        const defaultPartner = installmentData.partners && installmentData.partners.length > 0
                          ? installmentData.partners[0]
                          : { name: "Uzum Nasiya", logo: "https://api.logobank.uz/media/logos_png/Uzum_Nasiya-01.png" };
                        const currentPartner = activePartner || defaultPartner;

                        return currentPartner.logo ? (
                          <Image
                            src={currentPartner.logo}
                            alt={currentPartner.name || "Installment"}
                            fill
                            className="object-contain object-right dark:brightness-110 grayscale"
                          />
                        ) : (
                          <span className="text-[8px] font-black text-slate-505 uppercase">
                            {currentPartner.name}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(installmentData.months || [3, 6, 12, 24]).map((m: number) => {
                      const isSelected = installmentMonths === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setInstallmentMonths(m)}
                          className={cn(
                            "rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200",
                            isSelected
                              ? "bg-white dark:bg-slate-800 border-2 border-[#2c3b6e] dark:border-blue-500 text-[#2c3b6e] dark:text-blue-400"
                              : "bg-white/50 dark:bg-slate-800/50 text-slate-600 border border-slate-200 hover:bg-white dark:text-slate-400 dark:border-slate-700 hover:border-slate-300"
                          )}
                        >
                          {m} мес
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-750 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
                        Ежемесячный платеж
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        {totalPrice > 0 ? (
                          <>
                            <span className="text-lg font-extrabold text-[#2c3b6e] dark:text-blue-400 tabular-nums">
                              {formatPrice(monthlyPayment)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">сум / мес</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-slate-500 uppercase italic">Рассчитает менеджер</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
                        Общая сумма
                      </span>
                      <div className="flex items-baseline gap-1">
                        {totalPrice > 0 ? (
                          <>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                              {formatPrice(monthlyPayment * installmentMonths)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">сум</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Индивидуальный расчет</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calculator / Quantity selector ends here */}
          </div>
        </div>
      </section>

      {/* ── Tabs Section (Description & Specifications) ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-16 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl">
          <div className="mb-6 flex justify-start border-b border-slate-100 dark:border-slate-800/80 pb-px">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "pb-4 text-xs font-bold uppercase tracking-wider relative transition-colors focus:outline-none",
                    activeTab === tab.id
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="productTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e] dark:bg-blue-500"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === "description" && (
              <div className="relative flex flex-col items-start">
                <div 
                  className={cn(
                    "prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 lg:text-base transition-all duration-500 overflow-hidden relative w-full",
                    !isDescriptionExpanded && product.description && product.description.length > 250 ? "max-h-[150px]" : "max-h-[3000px]"
                  )}
                >
                  {formatDescription(
                    product.description || "Нет дополнительного описания."
                  )}
                  
                  {!isDescriptionExpanded && product.description && product.description.length > 250 && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
                  )}
                </div>
                
                {product.description && product.description.length > 250 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3 text-sm font-extrabold text-[#2c3b6e] dark:text-blue-400 hover:text-[#1a2342] dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
                  >
                    {isDescriptionExpanded ? "Свернуть описание" : "Читать полностью"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isDescriptionExpanded ? "rotate-180" : "")} />
                  </button>
                )}
              </div>
            )}
            {activeTab === "specs" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(() => {
                      const specs: { l: string; v: string }[] = [];

                      // SKU logic: prefer sku_1c, fallback to sku, artikul, article, code, id
                      const skuVal = (product as any).sku_1c || (product as any).sku || (product as any).artikul || (product as any).article || (product as any).code || product.id;
                      if (skuVal) specs.push({ l: "Артикул", v: String(skuVal) });

                      // Predefined keys to look for in the product object
                      const predefined = [
                        { key: 'brand', label: 'Бренд' },
                        { key: 'country', label: 'Страна производства' },
                        { key: 'series', label: 'Серия' },
                        { key: 'collection', label: 'Коллекция' },
                        { key: 'style', label: 'Стиль' },
                        { key: 'material', label: 'Материал' },
                        { key: 'coating', label: 'Покрытие' },
                        { key: 'glass_type', label: 'Тип стекла' },
                        { key: 'door_type', label: 'Тип двери' },
                        { key: 'thickness', label: 'Толщина' },
                        { key: 'warranty', label: 'Гарантия' },
                      ];

                      predefined.forEach(field => {
                        const val = (product as any)[field.key];
                        if (val) {
                          specs.push({ l: field.label, v: String(val) });
                        }
                      });

                      // Add active variant attributes
                      if (currentVariantInfo.color) specs.push({ l: "Цвет", v: currentVariantInfo.color });
                      if (currentVariantInfo.size) specs.push({ l: "Размер", v: formatSizeForDisplay(currentVariantInfo.size) });

                      // Append any additional dynamic specifications from JSON
                      if (
                        product.specifications &&
                        typeof product.specifications === "object"
                      ) {
                        Object.entries(product.specifications).forEach(
                          ([key, value]) => {
                            // Prevent duplicates
                            if (!specs.find(s => s.l.toLowerCase() === key.toLowerCase())) {
                               specs.push({ l: key, v: String(value || "-") });
                            }
                          }
                        );
                      }

                      if (specs.length === 0) {
                        specs.push({ l: "Бренд", v: product.brand || "MAFF" });
                      }
                      
                      return specs.map((s, idx) => (
                        <tr
                          key={s.l}
                          className={cn(
                            "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30",
                            idx % 2 === 0 ? "bg-white dark:bg-slate-900/40" : "bg-slate-50/50 dark:bg-slate-900/20"
                          )}
                        >
                          <td className="w-[40%] sm:w-1/3 py-2 px-3 sm:py-2.5 sm:px-4 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/60 leading-tight">
                            {s.l}
                          </td>
                          <td className="py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                            {s.v}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
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
                    images={p.images}
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
