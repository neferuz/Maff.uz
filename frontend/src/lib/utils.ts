import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging tailwind classes with proper overrides
 * Standard in modern professional React/Next.js projects
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Keywords for non-product items to filter out */
const NON_PRODUCT_KEYWORDS = [
  "образец", "образцы",
  "коробка", "короб", "добор", "наличник",
  "стенд", "вывеска", "каталог", "буклет", "щит рекл",
  "футболка", "стойка",
  "герметик", "защелка", "замок", "agb",
  "ключ", "связка",
  "соединение", "соединитель", "петля",
  "ноутбук", "эмблема", "шуруп", "тяга",
  "сумка", "стреч", "пленка",
  "повербанк", "планшет", "подставка",
  "табличка", "рейка", "флаг", "холдер",
  "установка", "станок",
  "жидкий",
  "router", "роутер", "cpe",
  "оперативная", "память", "мышь",
];

/** Check if a product is an actual sellable product (not accessory/sample/merchandise) */
export function isRealProduct(p: any): boolean {
  const nameLower = (p.name || "").toLowerCase();
  for (const kw of NON_PRODUCT_KEYWORDS) {
    if (nameLower.includes(kw)) return false;
  }
  // Only allow "полотно" for actual door brands
  if (nameLower.includes("полотно")) {
    const brandLower = (p.brand || "").toLowerCase();
    const isDoorBrand = ["волховец", "volkhovets", "zadoor", "portika", "profildoors", "filomuro"].some(
      (b) => brandLower.includes(b)
    );
    if (!isDoorBrand) return false;
  }
  return true;
}

/** Clean size dimensions from user-facing names */
export function cleanNameFromDimensions(name: string): string {
  if (!name) return "";
  let cleaned = name;

  // 1. Remove 3D dimensions e.g. 35х600х2000 or 35x600x2000 (with optional space and mm/мм)
  cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?(?:\s*(?:мм|mm|м|m))?/gi, "");

  // 2. Remove 2D dimensions e.g. 35х600
  cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?(?:\s*(?:мм|mm|м|m))?/gi, "");

  // 3. Remove standalone dimension-like numbers with trailing star, e.g. 35*
  cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*\*+/g, "");

  // Clean up punctuation, spaces, and empty parentheses left behind
  cleaned = cleaned.replace(/\s*-\s*(?=\()/g, " "); // Replace dash before parens
  cleaned = cleaned.replace(/\s*-\s*$/, ""); // Replace trailing dash
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\(\s*\)/g, ""); // Remove empty parentheses
  
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^[,\-\s]+|[,\-\s]+$/g, ""); // Strip leading/trailing punctuation/spaces

  return cleaned;
}


/** 
 * Clean door names to strictly display only the core model number 
 * (removes collections, colors, materials, dimensions)
 */
export function getShortDoorName(name: string): string {
    if (!name) return "";
    let cleaned = name;

    // 1. Remove dimensions
    cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?(?:\s*(?:мм|mm|м|m))?/gi, "");
    cleaned = cleaned.replace(/\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?(?:\s*(?:мм|mm|м|m))?/gi, "");
    cleaned = cleaned.replace(/\b(400|600|700|800|900)\b/g, "");

    // 2. Remove parens
    cleaned = cleaned.replace(/\([^)]*\)/g, "");

    // 3. Remove known colors
    const knownColors = [
        "Белый матовый", "Серый матовый", "Матовый графит", "Матовый кремовый",
        "Нордик", "Орех карамель", "Жемчужно-перламутровый", "Беленый дуб",
        "Дуб темный", "Дуб натуральный", "Alaska", "Grey Oak", "Natural Oak",
        "White Oak", "Молочный матовый", "Графит премьер мат", "Тёмный лён",
        "Бетон светлый", "Светлый лён", "Сканди", "Бетон тёмный", "Бренди",
        "Светло-серый", "Оливковый", "Белая эмаль", "Бежевый", "Мелон",
        "Милано", "Венге", "Итальянский орех", "Жасмин белый", "Белый шелк",
        "Тёмно-серый", "Кофе", "Антрацит", "Хром", "Черный", "Черный лакобель",
        "Keramik Beige", "Keramik Brown", "Keramik Valse", "Ice", "Милквуд", "Опал",
        "Айвори", "Стоун", "Дэним", "Шэдоу", "Белый", "Серый", "Кремовый", "Меланж",
        "Светлый кунжут", "Темный кунжут", "Песочный матовый", "Дарквуд",
        "Shellac Cream", "Shellac White", "Shellac Graphite", "Thermo Oak", "Alpik Oak",
        "Black Star", "Light Sonoma", "Cappuccino Veralinga", "Wenge Veralinga",
        "Rocks Beige", "Rocks Pearl", "Nardo Grey", "Праймер White", "Праймер"
    ];
    const sortedColors = knownColors.sort((a,b) => b.length - a.length);
    for (const c of sortedColors) {
        const escaped = c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const reg = new RegExp("(?:^|[^а-яa-z0-9])" + escaped + "(?:$|[^а-яa-z0-9])", "ig");
        cleaned = cleaned.replace(reg, " ");
    }

    // 4. Remove materials
    const materials = ["ПП", "ЭКО", "Флекс Эмаль", "Эксимер", "Эмаль", "ПВХ", "шпон", "Milling White I", "Milling White II", "Magic Fog", "Reverse", "PRO"];
    for (const m of materials) {
        const escaped = m.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const reg = new RegExp("(?:^|[^а-яa-z0-9])" + escaped + "(?:$|[^а-яa-z0-9])", "ig");
        cleaned = cleaned.replace(reg, " ");
    }

    
    // Clean extra spaces and punctuation
    cleaned = cleaned.replace(/\s+/g, " ").replace(/^[,\-\s]+|[,\-\s]+$/g, "").trim();
    return cleaned;
}
