// Use native fetch

// Simulated isRealProduct from utils.ts
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

function isRealProduct(p) {
  const nameLower = (p.name || "").toLowerCase();
  for (const kw of NON_PRODUCT_KEYWORDS) {
    if (nameLower.includes(kw)) return false;
  }
  if (nameLower.includes("полотно")) {
    const brandLower = (p.brand || "").toLowerCase();
    const isDoorBrand = ["волховец", "volkhovets", "zadoor", "portika", "profildoors", "filomuro"].some(
      (b) => brandLower.includes(b)
    );
    if (!isDoorBrand) return false;
  }
  return true;
}

const getAllChildIds = (catId, cats, depth = 0) => {
  if (depth > 10) return [catId];
  const children = cats.filter(c => c && c.parent_id === catId);
  let ids = [catId];
  children.forEach(child => {
    ids = [...ids, ...getAllChildIds(child.id, cats, depth + 1)];
  });
  return ids;
};

async function run() {
  try {
    // 1. Fetch categories
    const catRes = await fetch('http://127.0.0.1:8000/api/v1/categories/');
    const safeCategories = await catRes.json();

    const isAccessoryCategoryName = (name) => {
      if (!name) return false;
      const lower = name.toLowerCase();
      return lower.includes("комплектующие") || lower.includes("нестандарт комплектующие");
    };

    const isAccessoryOrChild = (cat) => {
      let current = cat;
      while (current) {
        if (isAccessoryCategoryName(current.name)) {
          return true;
        }
        if (current.parent_id) {
          current = safeCategories.find((c) => c && c.id === current.parent_id);
        } else {
          break;
        }
      }
      return false;
    };

    const categories = safeCategories.filter((c) => c && !isAccessoryOrChild(c));
    console.log('Total categories after accessory filter:', categories.length);

    // 2. Fetch products for category 12
    const prodRes = await fetch('http://127.0.0.1:8000/api/v1/products/?category_id=12&group=true');
    const prodData = await prodRes.json();
    let products = Array.isArray(prodData) ? prodData : [];
    console.log('Total products fetched for cat 12:', products.length);

    // Filter out non-products
    products = products.filter((p) => isRealProduct(p));
    console.log('Products after isRealProduct:', products.length);

    // 3. Compute allFreePriceCategoryIds
    const mainFreeCats = categories.filter(c => 
      c && c.name && (
        c.id === 8 || c.id === 359 || c.id === 174 || c.id === 13 ||
        c.name.toLowerCase().includes('двер') || 
        c.name.toLowerCase().includes('порта') || 
        c.name.toLowerCase().includes('baguette') || 
        c.name.toLowerCase().includes('classic') || 
        c.name.toLowerCase().includes('zadoor') || 
        c.name.toLowerCase().includes('паркет') || 
        c.name.toLowerCase().includes('подложк') ||
        c.name.toLowerCase().includes('coswick') ||
        c.name.toLowerCase().includes('sag') ||
        c.name.toLowerCase().includes('ковров') ||
        c.name.toLowerCase().includes('tarwood') ||
        c.name.toLowerCase().includes('spc') ||
        c.name.toLowerCase().includes('rocko') ||
        c.name.toLowerCase().includes('kronofloor') ||
        c.name.toLowerCase().includes('ламинат') ||
        c.name.toLowerCase().includes('egger') ||
        c.name.toLowerCase().includes('krono') ||
        c.name.toLowerCase().includes('agt') ||
        c.name.toLowerCase().includes('joss') ||
        c.name.toLowerCase().includes('ultradecor') ||
        c.name.toLowerCase().includes('tarkett') ||
        c.name.toLowerCase().includes('salsa') ||
        c.name.toLowerCase().includes('s.classic') ||
        c.name.toLowerCase().includes('silkwood') ||
        c.name.toLowerCase().includes('stimul') ||
        c.name.toLowerCase().includes('ручк') ||
        c.name.toLowerCase().includes('петл') ||
        c.name.toLowerCase().includes('плинтус')
      )
    );

    let ids = [];
    mainFreeCats.forEach(c => {
      ids = [...ids, ...getAllChildIds(c.id, categories)];
    });
    const allFreePriceCategoryIds = Array.from(new Set(ids));
    
    console.log('allFreePriceCategoryIds has 12:', allFreePriceCategoryIds.includes(12));
    console.log('allFreePriceCategoryIds list:', allFreePriceCategoryIds);

    // 4. Filter products like page.tsx does
    let result = [...products];
    const activeCategoryIds = new Set(categories.map(c => c.id));
    result = result.filter(p => p.category_id && activeCategoryIds.has(p.category_id));
    console.log('After activeCategoryIds check:', result.length);

    // Price check
    result = result.filter(p => {
      if (p.category_id === null || p.category_id === undefined) return false;
      const isFreePriceCategory = allFreePriceCategoryIds.includes(p.category_id);
      const pass = p.price >= 1000 || isFreePriceCategory;
      if (!pass) {
        console.log(`FILTERED OUT BY PRICE: name="${p.name}", price=${p.price}, cat_id=${p.category_id}, isFree=${isFreePriceCategory}`);
      }
      return pass;
    });

    console.log('After price filter:', result.length);

  } catch (err) {
    console.error(err);
  }
}

run();
