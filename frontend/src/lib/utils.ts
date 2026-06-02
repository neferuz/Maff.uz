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
  const priceVal = Number(p.price_outlet || p.price || 0);
  if (priceVal === 0 || priceVal === null || priceVal === undefined) return false;
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
