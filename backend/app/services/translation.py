from __future__ import annotations
import httpx
import json
import re
from fastapi import Request
from sqlalchemy import select
from app.models.translation import AutoTranslation
from app.core.config import settings

GLOSSARY_UZ_LATIN = {
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
    "сбросить фильтры": "Filtrlarni tozalash",
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
}

def translate_locally(text: str, locale: str) -> str | None:
    if not text:
        return None
    cleaned = text.strip()
    lower = cleaned.lower()
    
    if locale == "uz":
        glossary = GLOSSARY_UZ_LATIN
    else:
        return None
        
    if lower in glossary:
        trans = glossary[lower]
        if cleaned.isupper() and cleaned.lower() != cleaned:
            return trans.upper()
        elif cleaned[0].isupper():
            return trans[0].upper() + trans[1:]
        else:
            return trans
            
    if not re.search(r'[а-яА-ЯёЁ]', cleaned):
        return cleaned
        
    return None


def is_admin_request(request: Request) -> bool:
    if not request:
        return False
        
    # Check Referer/Origin headers for port 3001 or admin path
    referer = request.headers.get("referer", "")
    origin = request.headers.get("origin", "")
    if "3001" in referer or "/admin" in referer.lower():
        return True
    if "3001" in origin or "/admin" in origin.lower():
        return True
        
    # Check Authorization header (admin panel requests always send token)
    auth = request.headers.get("authorization", "")
    if auth and auth.startswith("Bearer "):
        return True
        
    return False

def get_locale_from_request(request: Request) -> str:
    if not request:
        return "ru"
        
    # Bypass translation for any request originating from the admin panel
    if is_admin_request(request):
        return "ru"
        
    # 1. Check query parameters
    lang = request.query_params.get("lang")
    if lang in ["ru", "uz", "en"]:
        return lang
        
    # 2. Check cookies
    cookie_lang = request.cookies.get("maff_lang")
    if cookie_lang in ["ru", "uz", "en"]:
        return cookie_lang
        
    # 3. Check Accept-Language header
    accept_lang = request.headers.get("accept-language", "")
    if "uz" in accept_lang.lower():
        return "uz"
    if "en" in accept_lang.lower():
        return "en"
        
    return "ru"

def get_lang_instruction(locale: str) -> str:
    if locale == "uz":
        return """
Целевой язык: Узбекский (Lotin yozuvi - латиница).
Контекст: Премиум-интернет-магазин напольных покрытий (ламинат, паркет, кварцвинил) и межкомнатных дверей в Узбекистане "Maff.uz".

ПРАВИЛА ЛОКАЛИЗАЦИИ НА УЗБЕКСКИЙ ЯЗЫК:
1. Перевод должен быть ЕСТЕСТВЕННЫМ, профессиональным, благозвучным и привычным для узбекских покупателей. Избегай дословного (буквального/машинного) перевода.
2. НЕ ПЕРЕВОДИ И НЕ ИЗМЕНЯЙ:
   - Бренды (Kronopol, Classen, MAFF, ProfilDoors, Zadoor, Portika, Volkhovets и т.д.).
   - Названия коллекций и серий товаров (Dolce, Akaba, Aurum, Centro, NeoClassico, Filomuro и т.д.).
   - Технические параметры, артикулы, числовые маркировки и размеры (например: 8mm, 1,380*0,157, 40014, BB, CK 310, 32/AC4, 33/AC5). Они должны оставаться в оригинальном виде.
3. ПЕРЕВОДИ названия стран (Страна -> Mamlakat):
   - Германия -> Germaniya
   - Китай -> Xitoy
   - Польша -> Polsha
   - Россия -> Rossiya
   - Беларусь -> Belarus
   - Турция -> Turkiya
4. ПЕРЕВОДИ единицы измерения:
   - кв.м / м2 -> m²
   - шт. -> dona
   - уп. -> qadoq
   - пог.м -> metr
5. Переводи типы древесины и цвета в названиях товаров (Дуб -> Eman, Черный -> Qora, Белый -> Oq, Серый -> Kulrang, Ясень -> Kul, Орех -> Yong'oq).
   - Например, "Дуб Маскарпоне" -> "Eman Maskarpone", "CK 310 BB Черный" -> "CK 310 BB Qora".
6. Используй правильную терминологию напольных покрытий и дверей:
   - Наличники / Наличник -> Nalichniklar / Nalichnik (это декоративное обрамление двери, ни в коем случае НЕ переводи как "Naqd pul"!)
   - Дверной короб / Коробка -> Eshik qorobi / Eshik qutisi (ни в коем случае не переводи как "Quti"!)
   - Класс -> Sinf (например, Класс: 33 -> Sinf: 33)
   - Наличие -> Mavjudligi (или Mavjud)
   - Комплектующие -> Butlovchi qismlar (ни в коем случае не "Qo'shimchalar" или "Ehtiyotlar"!)
   - Похожие товары -> O'xshash mahsulotlar
   - Ед. изм. -> O'lchov birligi
   - Сравнение товаров -> Taqqoslash
   - Избранное -> Saralanganlar
   - Рассрочка -> Muddatli to'lov (ни в коем случае не "Reklama"!)
   - Разработка сайта -> Saytni ishlab chiqish
7. Описания товаров переводи гладко, литературным языком, чтобы текст читался естественно на узбекском языке. Не делай механический перевод каждого слова.
"""
    elif locale == "en":
        return """
Target language: English.
Context: Premium flooring (laminate, parquet, quartz vinyl) and interior doors e-commerce store "Maff.uz".

LOCALIZATION RULES FOR ENGLISH:
1. The translation must sound natural, professional, and idiomatic for e-commerce. Avoid word-for-word translation.
2. DO NOT translate:
   - Brand names (Kronopol, Classen, MAFF, ProfilDoors, Zadoor, Portika, etc.).
   - Collection/series names (Dolce, Akaba, Aurum, Centro, etc.).
   - Technical specifications, codes, and sizes (e.g. 8mm, 1,380*0,157, 3947, BB).
3. Translate country names (Германия -> Germany, Польша -> Poland, Россия -> Russia, Китай -> China, Беларусь -> Belarus, Турция -> Turkey).
4. Translate wood species and colors (Дуб -> Oak, Черный -> Black, Белый -> White, Серый -> Grey).
5. Translate units of measurement (кв.м / м2 -> sq.m., шт. -> pcs, уп. -> pack, пог.м -> m.).
6. Use correct terms:
   - Наличники / Наличник -> Trims / Casing
   - Дверной короб / Коробка -> Door frame / Door box
   - Класс -> Class
   - Наличие -> Availability
   - Комплектующие -> Accessories
   - Похожие товары -> Similar Products
   - Рассрочка -> Installment
   - Разработка сайта -> Website Development
"""
    else:
        return f"Translate/localize to {locale} naturally and professionally."

async def translate_text_claude(text: str, target_lang: str, api_key: str) -> str:
    if not text or not text.strip():
        return text
        
    local_val = translate_locally(text, target_lang)
    if local_val is not None:
        return local_val
        
    lang_instruction = get_lang_instruction(target_lang)
        
    prompt = f"""Локализуй следующий текст на целевой язык естественным и профессиональным образом.
Целевой язык: {target_lang}
Инструкция по локализации: {lang_instruction}
Переведи только этот текст, не добавляй никаких пояснений, комментариев или вводных фраз. Твой ответ должен содержать только готовый перевод.

Текст для локализации:
{text}"""

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": settings.CLAUDE_MODEL,
        "max_tokens": 4000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        translated = data["content"][0]["text"].strip()
        return translated

async def translate_json_content(content: dict | list, locale: str, api_key: str) -> dict | list:
    if not content:
        return content
    if locale == "ru" or not locale:
        return content
        
    lang_instruction = get_lang_instruction(locale)

    prompt = f"""Локализуй все текстовые значения в следующем JSON-объекте на целевой язык естественным и профессиональным образом.
Целевой язык: {locale}
Инструкция по локализации: {lang_instruction}

ПРАВИЛА:
1. Переводи только строковые значения (тексты). Не меняй ключи (keys) JSON.
2. Не меняй числа, булевы значения, null.
3. Сохраняй неизменными URL-адреса, адреса электронной почты и телефонные номера.
4. Не добавляй никаких пояснений, введений или форматирования markdown (вроде ```json). Твой ответ должен быть только валидным JSON-объектом.

JSON для локализации:
{json.dumps(content, ensure_ascii=False, indent=2)}"""

    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    
    payload = {
        "model": settings.CLAUDE_MODEL,
        "max_tokens": 4000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
            response.raise_for_status()
            response_data = response.json()
            result_text = response_data["content"][0]["text"].strip()
            
            if result_text.startswith("```"):
                lines = result_text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                result_text = "\n".join(lines).strip()
                
            return json.loads(result_text)
    except Exception as e:
        print(f"Error in JSON translation: {e}")
        return content

async def translate_page_content(db, slug: str, content: dict | list, locale: str, api_key: str) -> dict | list:
    if not content:
        return content
    if locale == "ru" or not locale:
        return content
        
    orig_str = json.dumps(content, sort_keys=True, ensure_ascii=False)
    
    stmt = select(AutoTranslation).where(
        AutoTranslation.locale == locale,
        AutoTranslation.entity_type == "page",
        AutoTranslation.entity_id == slug,
        AutoTranslation.field_name == "content"
    )
    res = await db.execute(stmt)
    cached = res.scalars().first()
    
    if cached and cached.original_text == orig_str:
        try:
            return json.loads(cached.translated_text)
        except Exception:
            pass
            
    translated_dict = await translate_json_content(content, locale, api_key)
    translated_str = json.dumps(translated_dict, ensure_ascii=False)
    
    if cached:
        cached.original_text = orig_str
        cached.translated_text = translated_str
    else:
        new_cache = AutoTranslation(
            locale=locale,
            entity_type="page",
            entity_id=slug,
            field_name="content",
            original_text=orig_str,
            translated_text=translated_str
        )
        db.add(new_cache)
        
    await db.commit()
    return translated_dict

async def get_translations_bulk(db, entity_type: str, entities: list, fields: list[str], locale: str, api_key: str):
    if locale == "ru" or not locale or not entities:
        return
        
    entity_ids = []
    for e in entities:
        ent_id = getattr(e, 'id', None) or (isinstance(e, dict) and e.get('id'))
        if ent_id is not None:
            entity_ids.append(str(ent_id))
            
    if not entity_ids:
        return
        
    stmt = select(AutoTranslation).where(
        AutoTranslation.locale == locale,
        AutoTranslation.entity_type == entity_type,
        AutoTranslation.entity_id.in_(entity_ids)
    )
    res = await db.execute(stmt)
    existing = res.scalars().all()
    
    cache_map = {(x.entity_id, x.field_name): x for x in existing}
    translations_by_field = {(x.entity_id, x.field_name): x.translated_text for x in existing}
    
    missing_items = []
    idx = 0
    
    for entity in entities:
        ent_id = str(getattr(entity, 'id', None) or (isinstance(entity, dict) and entity.get('id')))
        for field in fields:
            orig_text = getattr(entity, field, None) or (isinstance(entity, dict) and entity.get(field))
            if not orig_text or not isinstance(orig_text, str) or not orig_text.strip():
                continue
                
            cached = cache_map.get((ent_id, field))
            
            local_val = translate_locally(orig_text, locale)
            if local_val is not None:
                translations_by_field[(ent_id, field)] = local_val
                if cached:
                    cached.original_text = orig_text
                    cached.translated_text = local_val
                else:
                    new_trans = AutoTranslation(
                        locale=locale,
                        entity_type=entity_type,
                        entity_id=ent_id,
                        field_name=field,
                        original_text=orig_text,
                        translated_text=local_val
                    )
                    db.add(new_trans)
                    cache_map[(ent_id, field)] = new_trans
                continue

            if not cached or cached.original_text != orig_text:
                missing_items.append({
                    'entity_id': ent_id,
                    'field_name': field,
                    'text': orig_text,
                    'index': idx
                })
                idx += 1
                
    if missing_items:
        texts_to_translate = {item['index']: item['text'] for item in missing_items}
        
        lang_instruction = get_lang_instruction(locale)
            
        prompt = f"""Локализуй следующие фрагменты текста на целевой язык естественным и профессиональным образом.
Целевой язык: {locale}
Инструкция по локализации: {lang_instruction}

Фрагменты для локализации переданы в формате JSON.
Твоя задача — вернуть JSON-объект с теми же ключами (номерами индексов), содержащий только локализованные тексты. Не меняй ключи, переводи только значения.
Не добавляй никаких пояснений, комментариев или форматирования markdown (вроде ```json). Ответ должен быть строго валидным JSON-объектом.

Фрагменты для локализации:
{json.dumps(texts_to_translate, ensure_ascii=False, indent=2)}"""

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        payload = {
            "model": settings.CLAUDE_MODEL,
            "max_tokens": 4000,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
                response.raise_for_status()
                response_data = response.json()
                result_text = response_data["content"][0]["text"].strip()
                
                if result_text.startswith("```"):
                    lines = result_text.split("\n")
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].startswith("```"):
                        lines = lines[:-1]
                    result_text = "\n".join(lines).strip()
                    
                translations_map = json.loads(result_text)
                
                for item in missing_items:
                    str_idx = str(item['index'])
                    translated_val = translations_map.get(str_idx, item['text'])
                    
                    translations_by_field[(item['entity_id'], item['field_name'])] = translated_val
                    
                    cached = cache_map.get((item['entity_id'], item['field_name']))
                    if cached:
                        cached.original_text = item['text']
                        cached.translated_text = translated_val
                    else:
                        new_trans = AutoTranslation(
                            locale=locale,
                            entity_type=entity_type,
                            entity_id=item['entity_id'],
                            field_name=item['field_name'],
                            original_text=item['text'],
                            translated_text=translated_val
                        )
                        db.add(new_trans)
                        cache_map[(item['entity_id'], item['field_name'])] = new_trans
                        
            await db.commit()
        except Exception as e:
            print(f"Bulk translation error: {e}")
            
    for entity in entities:
        ent_id = str(getattr(entity, 'id', None) or (isinstance(entity, dict) and entity.get('id')))
        for field in fields:
            val = translations_by_field.get((ent_id, field))
            if val is not None:
                if isinstance(entity, dict):
                    entity[field] = val
                else:
                    setattr(entity, field, val)
