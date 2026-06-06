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
];
const sortedColors = [...knownColors].sort((a, b) => b.length - a.length);

function parseColor(name) {
  let parsedColorsList = [];
  const cleaned = name;
  for (const c of sortedColors) {
    const escapedC = normYo(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp("(?:^|[^а-яa-z0-9])" + escapedC + "(?:$|[^а-яa-z0-9])", "i");
    if (reg.test(normYo(cleaned))) {
      if (!parsedColorsList.includes(c)) {
        parsedColorsList.push(c);
      }
    }
  }
  return (parsedColorsList.join(" / ") || "Не указан").replace(/\s*\/\s*/g, " / ").trim();
}

for (const n of names) {
  console.log(n, "->", parseColor(n));
}
