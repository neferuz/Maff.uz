const names = [
    "Порта-1 ПП Alaska",
    "Порта-1 ПП Nardo Grey",
    "Порта-50 4AB Эксимер Keramik Valse (Черный: М) Стандарт",
    "Порта-50 4AB Эксимер Keramik Brown (Черный: М) Стандарт",
    "Порта-50.1 4AB ПП Natural Oak",
    "Порта-50 B ПП Rocks Beige (Черный: М)",
    "Порта-50 B ПП Rocks Pearl (Черный: М)",
    "Порта-50.11 4AB ПП Alpik Oak (Черный: М)",
    "Порта-51 4AB ПП Alaska Black Star",
    "Порта-50 4AB Эксимер Keramik Valse (Черный: М) Нестандарт",
    "Порта-50 4AB Эксимер Keramik Brown (Черный: М) Нестандарт",
    "Порта-51 4AB ПП Alpik Oak Black Star",
    "Порта-50.10 B ПП Rocks Beige (Черный: М)",
    "Порта-50.10 B ПП Rocks Pearl (Черный: М)",
    "Порта-58 4AB ПП Grey Oak (Черный: М)"
];

const normYo = (s) => s.replace(/ё/g, "е").replace(/Ё/g, "Е");
const knownColors = [
  "Белый матовый", "Серый матовый", "Матовый графит", "Матовый кремовый",
  "Нордик", "Орех карамель", "Жемчужно-перламутровый", "Беленый дуб",
  "Дуб темный", "Дуб темный продольный", "Дуб натуральный",
  "Дуб натуральный продольный", "Alaska", "Grey Oak", "Natural Oak",
  "White Oak", "Молочный матовый", "Графит премьер мат", "Тёмный лён",
  "Бетон светлый", "Светлый лён", "Сканди", "Бетон тёмный", "Бренди",
  "Светло-серый", "Оливковый", "Белая эмаль", "Бежевый", "Мелон",
  "Милано", "Венге", "Итальянский орех", "Жасмин белый", "Белый шелку",
  "Белый шелк", "Тёмно-серый", "Кофе", "Антрацит", "Хром", "Черный",
  "Черный лакобель", "Ламинатин Белый", "Keramik Beige", "Keramik Brown",
  "Ice", "Милквуд", "Опал", "Айвори", "Стоун", "Дэним", "Шэдоу", "Белый",
  "Серый", "Кремовый", "Меланж", "Светлый кунжут", "Темный кунжут",
  "Песочный матовый", "Дарквуд", "Дарк Вуд", "Грунт", "Без врезки",
  "Keramik Valse", "Rocks Beige", "Rocks Pearl", "Nardo Grey", "Alpik Oak", "Black Star"
];
const sortedColors = [...knownColors].sort((a, b) => b.length - a.length);

function parseProductName(name) {
  let prefixClean = name;
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
  prefixClean = prefixClean.replace(/\(Образец\)/gi, "");
  prefixClean = prefixClean.replace(/Образец/gi, "");
  
  const triggers = [
    /\b\d+\s*[xх\*×]\s*\d+\s*[xх\*×]\s*\d+\b/i, 
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

  for (const trig of triggers) {
    const match = prefixClean.match(trig);
    if (match && match.index !== undefined && match.index < earliestIdx) {
      earliestIdx = match.index;
    }
  }

  const prefixCleanNorm = normYo(prefixClean);
  for (const c of sortedColors) {
    const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp("(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])", "i");
    const match = prefixCleanNorm.match(reg);
    if (match && match.index !== undefined && match.index < earliestIdx) {
      earliestIdx = match.index;
    }
  }

  prefixClean = prefixClean.substring(0, earliestIdx);
  prefixClean = prefixClean.replace(/\s+/g, " ").trim().replace(/^[,;\-\s#\(\)]+|[,;\-\s#\(\)]+$/g, "");
  
  return prefixClean;
}

for (const n of names) {
  console.log(n, "->", parseProductName(n));
}
