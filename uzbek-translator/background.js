chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    translateText(request.texts, request.apiKey, request.alphabet)
      .then(translated => sendResponse({ success: true, translations: translated }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

const GLOSSARY_LATIN = {
  "рассрочка": "Muddatli to'lov",
  "рассрочка 0%": "Muddatli to'lov 0%",
  "купить в рассрочку": "Muddatli to'lovga sotib olish",
  "в рассрочку": "muddatli to'lovga",
  "комплектующие": "Butlovchi qismlar",
  "наличники": "Nalichniklar",
  "наличник": "Nalichnik",
  "комплект наличников": "Nalichniklar komplekti",
  "дверной короб": "Eshik qorobi",
  "дверной коробка": "Eshik qutisi",
  "коробка": "Eshik qutisi",
  "дверная коробка": "Eshik qutisi",
  "в наличии": "Mavjud",
  "есть в наличии": "Mavjud",
  "нет в наличии": "Mavjud emas",
  "под заказ": "Buyurtma asosida",
  "заказать": "Buyurtma berish",
  "избранное": "Saralanganlar",
  "корзина": "Savat",
  "в корзину": "Savatga",
  "купить": "Sotib olish",
  "купить сейчас": "Hozir xarid qilish",
  "характеристики": "Xususiyatlari",
  "описание": "Tavsif",
  "цена": "Narxi",
  "итого": "Jami",
  "платеж": "To'lov",
  "похожие товары": "O'xshash mahsulotlar",
  "все категории": "Barcha kategoriyalar",
  "дуб": "Eman",
  "черный": "Qora",
  "белый": "Oq",
  "серый": "Kulrang",
  "орех": "Yong'oq",
  "ясень": "Kul",
  "сосна": "Qarag'ay",
  "шоурумы": "Showroomlar",
  "вопросы и ответы": "Savol va javoblar",
  "доставка и оплата": "Yetkazib berish va to'lov",
  "гарантия и возврат": "Kafolat va qaytarish",
  "разработка сайта": "Saytni ishlab chiqish",
  "все права защищены": "Barcha huquqlar himoyalangan",
  "о компании": "Kompaniya haqida",
  "блог": "Blog",
  "партнерам": "Hamkorlarga",
  "архитекторам": "Arxitektorlarga",
  "дизайнерам": "Dizaynerlarga",
  "застройщикам": "Quruvchilarga",
  "оптовикам": "Ulgurji xaridorlarga",
  "аутлет": "Outlet",
  "сертификаты": "Sertifikatlar",
  "поиск товаров...": "Mahsulotlarni qidirish...",
  "каталог": "Katalog",
  "каталог товаров": "Katalog",
  "сравнение": "Taqqoslash",
  "сравнение товаров": "Taqqoslash",
  "личный кабинет": "Shaxsiy kabinet",
  "войти": "Kirish",
  "смотреть всё": "Barchasini ko'rish",
  "смотреть все": "Barchasini ko'rish",
  "добавлено": "Qo'shildi",
  "ваша корзина пуста": "Savatingiz bo'sh",
  "оформить заказ": "Buyurtmani rasmiylashtirish",
  "фио": "F.I.Sh.",
  "номер телефона": "Telefon raqami",
  "отправить заявку": "So'rov yuborish",
  "заявка успешно отправлена!": "Arizangiz muvaffaqiyatli yuborildi!",
  "категории": "Kategoriyalar",
  "назад в каталог": "Katalogga qaytish",
  "главная": "Bosh sahifa",
  "на главную": "Bosh sahifaga",
  "фильтры": "Filtrlar",
  "сбросить фильтры": "Filtrlarni toзалash",
  "по названию": "Nomi bo'yicha",
  "сначала дешевые": "Narxi (arzon)",
  "сначала дорогие": "Narxi (qimmat)",
  "популярные": "Ommabop",
  "новинки": "Yangi mahsulotlar",
  "бренд": "Brend",
  "страна": "Mamlakat",
  "толщина": "Qalinligi",
  "класс": "Sinf",
  "артикул": "Artikul",
  "ед. изм.": "O'lchov birligi",
  "наличие": "Mavjudligi",
  "не найдено": "Topilmadi",
  "рекомендуем": "Tavsiya etamiz",
  "лучший выбор наших экспертов": "Mutaxassislarimizning eng yaxshi tanlovi",
  "наши бренды": "Bizning brendlar",
  "показано": "Ko'rsatildi",
  "из": "dan",
  "быстрый просмотр": "Tezkor ko'rish",
  "двери": "Eshiklar",
  "межкомнатные двери": "Ichki eshiklar",
  "входные двери": "Kirish eshiklari",
  "плитка": "Plitka",
  "плинтус": "Plintus",
  "подложка": "Taglik",
  "клей": "Yelim",
  "фурнитура": "Furnitura",
  "дверная фурнитура": "Eshik furniturasi",
  "ручки": "Tutqichlar",
  "замки": "Qulflar",
  "петли": "Moshlar",
  "ламинат": "Laminat",
  "кварцвинил": "Kvarcvinil",
  "паркетная доска": "Parket taxtasi",
  "инженерная доска": "Injenerlik taxtasi",
  "пороги": "Ostonalar",
  "входные": "Kirish",
  "межкомнатные": "Ichki"
};

const GLOSSARY_CYRILLIC = {
  "рассрочка": "Муддатли тўлов",
  "рассрочка 0%": "Муддатли тўлов 0%",
  "купить в рассрочку": "Муддатли тўловга сотиб олиш",
  "в рассрочку": "муддатли тўловга",
  "комплектующие": "Бутловчи қисмлар",
  "наличники": "Наличниклар",
  "наличник": "Наличник",
  "комплект наличников": "Наличниклар комплекти",
  "дверной короб": "Эшик қороби",
  "дверной коробка": "Эшик қутиси",
  "коробка": "Эшик қутиси",
  "дверная коробка": "Эшик қутиси",
  "в наличии": "Мавжуд",
  "есть в наличии": "Мавжуд",
  "нет в наличии": "Мавжуд эмас",
  "под заказ": "Буюртма асосида",
  "заказать": "Буюртма бериш",
  "избранное": "Сараланганлар",
  "корзина": "Сават",
  "в корзину": "Саватга",
  "купить": "Сотиб олиш",
  "купить сейчас": "Ҳозир харид қилиш",
  "характеристики": "Хусусиятлари",
  "описание": "Тавсиф",
  "цена": "Нархи",
  "итого": "Жами",
  "платеж": "Тўлов",
  "похожие товары": "Ўхшаш маҳсулотлар",
  "все категории": "Барча категориялар",
  "дуб": "Эман",
  "черный": "Қора",
  "белый": "Оқ",
  "серый": "Кулранг",
  "орех": "Ёнғоқ",
  "ясень": "Кул",
  "сосна": "Қарағай",
  "шоурумы": "Шоурумлар",
  "вопросы и ответы": "Савол ва жавоблар",
  "доставка и оплата": "Етказиб бериш va тўлов",
  "гарантия и возврат": "Кафолат ва қайтариш",
  "разработка сайта": "Сайтни ишлаб чиқиш",
  "все права защищены": "Барча ҳуқуқлар ҳимояланган",
  "о компании": "Компания ҳақида",
  "блог": "Блог",
  "партнерам": "Ҳамкорларга",
  "архитекторам": "Архитекторларга",
  "дизайнерам": "Дизайнерларга",
  "застройщикам": "Қурувчиларга",
  "оптовикам": "Улгуржи харидорларга",
  "аутлет": "Аутлет",
  "сертификаты": "Сертификатлар",
  "поиск товаров...": "Маҳсулотларни қидириш...",
  "каталог": "Каталог",
  "каталог товаров": "Каталог",
  "сравнение": "Таққослаш",
  "сравнение товаров": "Таққослаш",
  "личный кабинет": "Шахсий кабинет",
  "войти": "Кириш",
  "смотреть всё": "Барчасини кўриш",
  "смотреть все": "Барчасини кўриш",
  "добавлено": "Қўшилди",
  "ваша корзина пуста": "Саватингиз бўш",
  "оформить заказ": "Буюртмани расмийлаштириш",
  "фио": "Ф.И.Ш.",
  "номер телефона": "Телефон рақами",
  "отправить заявку": "Сўров юбориш",
  "заявка успешно отправлена!": "Аризангиз муваффақиятли юборилди!",
  "категории": "Категориялар",
  "назад в каталог": "Каталогга қайтиш",
  "главная": "Бош саҳифа",
  "на главную": "Бош саҳифага",
  "фильтры": "Филтрлар",
  "сбросить фильтры": "Филтрларни тозалаш",
  "по названию": "Номи бўйича",
  "сначала дешевые": "Нархи (арзон)",
  "сначала дорогие": "Нархи (қиммат)",
  "популярные": "Оммабоп",
  "новинки": "Янги маҳсулотлар",
  "бренд": "Бренд",
  "страна": "Мамлакат",
  "толщина": "Қалинлиги",
  "класс": "Синф",
  "артикул": "Артикул",
  "ед. изм.": "Ўлчов бирлиги",
  "наличие": "Мавжудлиги",
  "не найдено": "Топилмади",
  "рекомендуем": "Тавсия этамиз",
  "лучший выбор наших экспертов": "Мутахассисларимизнинг энг yaxshi tanlovi",
  "наши бренды": "Бизнинг брендлар",
  "показано": "Кўрсатилди",
  "из": "дан",
  "быстрый просмотр": "Тезкор кўриш",
  "двери": "Эшиклар",
  "межкомнатные двери": "Ички эшиклар",
  "входные двери": "Кириш эшиклари",
  "плитка": "Плитка",
  "плинтус": "Плинтус",
  "подложка": "Таглик",
  "клей": "Елим",
  "фурнитура": "Фурнитура",
  "дверная фурнитура": "Эшик фурнитураси",
  "ручки": "Тутқичлар",
  "замки": "Қулфлар",
  "петли": "Мошлар",
  "ламинат": "Ламинат",
  "kварцвинил": "Кварцвинил",
  "паркетная доска": "Паркет тахтаси",
  "инженерная доска": "Инженерлик тахтаси",
  "пороги": "Остоналар",
  "входные": "Кириш",
  "межкомнатные": "Ички"
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function restoreCase(original, translation) {
  if (original === original.toUpperCase() && original !== original.toLowerCase()) {
    return translation.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return translation[0].toUpperCase() + translation.slice(1);
  }
  return translation;
}

function translatePhraseLocally(text, glossary) {
  if (!text) return null;
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();
  
  if (glossary[lower]) {
    return restoreCase(cleaned, glossary[lower]);
  }
  
  // Skip pure non-Cyrillic texts (e.g. brand names, numbers, tags, size markers)
  if (!/[а-яА-ЯёЁ]/.test(cleaned)) {
    return cleaned;
  }
  
  let translated = cleaned;
  let replacedAny = false;
  
  const keys = Object.keys(glossary).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const escaped = escapeRegExp(key);
    const regex = new RegExp(`(?<![а-яёА-ЯЁ])${escaped}(?![а-яёА-ЯЁ])`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, (match) => {
        replacedAny = true;
        return restoreCase(match, glossary[key]);
      });
    }
  }
  
  if (replacedAny) {
    return translated;
  }
  
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    translateText(request.texts, request.apiKey, request.alphabet)
      .then(translated => sendResponse({ success: true, translations: translated }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function translateText(texts, apiKey, alphabet) {
  const glossaryObj = alphabet === "latin" ? GLOSSARY_LATIN : GLOSSARY_CYRILLIC;
  
  const translations = new Array(texts.length).fill(null);
  const pendingIndices = [];
  const pendingTexts = [];
  
  for (let i = 0; i < texts.length; i++) {
    const orig = texts[i];
    const localVal = translatePhraseLocally(orig, glossaryObj);
    if (localVal !== null) {
      translations[i] = localVal;
    } else {
      pendingIndices.push(i);
      pendingTexts.push(orig);
    }
  }
  
  if (pendingTexts.length > 0) {
    const alphabetNote = alphabet === "latin"
      ? "Используй латинский алфавит узбекского языка (Lotin yozuvi)."
      : "Используй кириллический алфавит узбекского языка (Ўзбек кириллицаси).";

    const glossaryPrompt = alphabet === "latin"
      ? `ПРАВИЛА И ГЛОССАРИЙ (Lotin yozuvi):
- "Рассрочка" -> "Muddatli to'lov" (НИ В КОЕМ СЛУЧАЕ НЕ "Reklama" или "Bo'lib to'lash")
- "Комплектующие" -> "Butlovchi qismlar" (ни в коем случае не "Qo'shimchalar" или "Ehtiyotlar")
- "Наличники" / "Наличник" -> "Nalichniklar" / "Nalichnik" (это планки вокруг двери, ни в коем случае НЕ "Naqd pul" / наличные деньги!)
- "Дверной короб" / "Коробка" -> "Eshik qorobi" / "Eshik qutisi" (ни в коем случае не просто "Quti"!)
- "В наличии" -> "Mavjud" (не "Stokda")
- "Нет в наличии" -> "Mavjud emas"
- "Под заказ" -> "Buyurtma asosida"
- "Заказать" -> "Buyurtma berish"
- "Избранное" -> "Saralanganlar"
- "Корзина" -> "Savat"
- "В корзину" -> "Savatga"
- "Купить" -> "Sotib olish"
- "Характеристики" -> "Xususiyatlari"
- "Описание" -> "Tavsif"
- "Цена" -> "Narxi"
- "Итого" -> "Jami"
- "Платеж" -> "To'lov"
- "Похожие товары" -> "O'xshash mahsulotlar"
- "Все категории" -> "Barcha kategoriyalar"
- "Дуб" -> "Eman"
- "Черный" -> "Qora"
- "Белый" -> "Oq"
- "Серый" -> "Kulrang"
- "Орех" -> "Yong'oq"
- "Ясень" -> "Kul"
- "Сосна" -> "Qarag'ay"
- "Шоурумы" -> "Showroomlar"
- "Вопросы и ответы" -> "Savol va javoblar"
- "Доставка и оплата" -> "Yetkazib berish va to'lov"
- "Гарантия и возврат" -> "Kafolat va qaytarish"
- "Разработка сайта" -> "Saytni ishlab chiqish"`
      : `ПРАВИЛА И ГЛОССАРИЙ (Cyrillic):
- "Рассрочка" -> "Муддатли тўлов" (НИ В КОЕМ СЛУЧАЕ НЕ "Реклама" или "Бўлиб тўлаш")
- "Комплектующие" -> "Бутловчи қисмлар" (ни в коем случае не "Қўшимчалар")
- "Наличники" / "Наличник" -> "Наличниклар" / "Наличник" (это планки вокруг двери, ни в коем случае НЕ "Нақд пул" / наличные деньги!)
- "Дверной короб" / "Коробка" -> "Эшик қороби" / "Эшик қутиси" (ни в коем случае не просто "Қути"!)
- "В наличии" -> "Мавжуд"
- "Нет в наличии" -> "Мавжуд эмас"
- "Под заказ" -> "Буюртма асосида"
- "Заказать" -> "Буюртма бериш"
- "Избранное" -> "Сараланганлар"
- "Корзина" -> "Сават"
- "В корзину" -> "Саватга"
- "Купить" -> "Сотиб олиш"
- "Характеристики" -> "Хусусиятлари"
- "Описание" -> "Тавсиф"
- "Цена" -> "Нархи"
- "Итого" -> "Жами"
- "Платеж" -> "Тўлов"
- "Похожие товары" -> "Ўхшаш маҳсулотлар"
- "Все категории" -> "Барча категориялар"
- "Дуб" -> "Эман"
- "Черный" -> "Қора"
- "Белый" -> "Оқ"
- "Серый" -> "Кулранг"
- "Орех" -> "Ёнғоқ"
- "Ясень" -> "Кул"
- "Сосна" -> "Қарағай"
- "Шоурумы" -> "Шоурумлар"
- "Вопросы и ответы" -> "Савол ва жавоблар"
- "Доставка и оплата" -> "Етказиб бериш ва тўлов"
- "Гарантия и возврат" -> "Кафолат ва қайтариш"
- "Разработка сайта" -> "Сайтни ишлаб чиқиш"`;

    const combined = pendingTexts.map((t, i) => `[${i}] ${t}`).join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Ты — профессиональный локализатор и переводчик для премиум-салона дверей и напольных покрытий (ламинат, паркет, двери) "Maff.uz".
Переведи предоставленные тексты с русского на грамотный, естественный узбекский язык.
${alphabetNote}

${glossaryPrompt}

ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА:
1. Перевод должен звучать профессионально и органично. Избегай буквального/дословного перевода.
2. НЕ ПЕРЕВОДИ И НЕ ИЗМЕНЯЙ: бренды (Kronopol, Classen, MAFF, ProfilDoors, Zadoor, Portika, Volkhovets и др.), названия серий/коллекций, а также размеры, числа и технические параметры (например, 8mm, 1,380*0,157, BB, 33/AC5).
3. Сохрани нумерацию [0], [1], [2]... перед переведенным текстом.
4. Выдавай ТОЛЬКО готовый перевод. Никаких введений, объяснений и markdown-разметки. Твой ответ должен содержать только строки в формате: "[индекс] переведенный текст".

Тексты для локализации:
${combined}`
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Unknown API Error");
    }

    const result = data.content[0].text;
    const lines = result.split("\n");
    for (let i = 0; i < pendingTexts.length; i++) {
      const line = lines.find(l => l.trim().startsWith(`[${i}]`));
      const targetIndex = pendingIndices[i];
      if (line) {
        const cleaned = line.trim().replace(/^\[\d+\]\s*:?\s*/, "");
        translations[targetIndex] = cleaned;
      } else {
        translations[targetIndex] = pendingTexts[i];
      }
    }
  }
  
  return translations;
}
