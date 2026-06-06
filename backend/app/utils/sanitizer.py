import re

BRAND_MAPPING = {
    "0f86afa8-b97c-11e5-80c8-002590ec5d5d": "KRONO",
    "ALSAFLOOR_EPI": "Alsafloor (EPI)",
    "russkiy-profil": "Русский Профиль",
    "JUTEKS": "Juteks",
    "TARKETT": "Tarkett",
    "KRONOSPAN": "Kronospan",
    "BERRY_ALLOC": "BerryAlloc",
    "QUICK_STEP": "Quick-Step",
    "cBxINZEo": "Art House", # Mapping based on name 'Art House Glue'
}

COUNTRY_MAPPING = {
    "GERMANY": "Германия",
    "FRANCE": "Франция",
    "RUSSIA": "Россия",
    "BELARUS": "Беларусь",
    "SOUTH_KOREA": "Южная Корея",
    "UZBEKISTAN": "Узбекистан",
    "CHINA": "Китай",
    "TURKEY": "Турция",
    "POLAND": "Польша",
    "BELGIUM": "Бельгия",
    "ESTONIA": "Эстония",
    "SERBIA": "Сербия",
    "AUSTRIA": "Австрия",
}

def sanitize_brand(brand: str) -> str:
    if not brand:
        return ""
    
    # Check direct mapping
    if brand in BRAND_MAPPING:
        return BRAND_MAPPING[brand]
    
    # Check if it's a GUID
    if re.match(r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', brand.lower().strip()):
        return "Бренд из 1С" # Placeholder or keep it if unknown
    
    # Clean up underscore/kebab case
    clean = brand.replace("_", " ").replace("-", " ")
    # Title Case
    return " ".join(w.capitalize() for w in clean.split())

def sanitize_country(country: str) -> str:
    if not country:
        return ""
    
    upper_country = country.upper().strip()
    if upper_country in COUNTRY_MAPPING:
        return COUNTRY_MAPPING[upper_country]
    
    return country.capitalize()


# Comprehensive Brand and Collection mappings for parsing
BRANDS_MAP = {
    "joss beaumont": ("Joss Beaumont", "Россия"),
    "jossbeaumont": ("Joss Beaumont", "Россия"),
    "gusto": ("Joss Beaumont", "Россия"),
    "liberte": ("Joss Beaumont", "Россия"),
    "opus": ("Joss Beaumont", "Россия"),
    "veritas": ("Joss Beaumont", "Россия"),
    
    "swiss krono": ("Swiss Krono", "Россия"),
    "swisskrono": ("Swiss Krono", "Россия"),
    "swiss-krono": ("Swiss Krono", "Россия"),
    "magister": ("Swiss Krono", "Россия"),
    
    "kronopol": ("Kronopol", "Польша"),
    "aurum": ("Kronopol", "Польша"),
    "platinium": ("Kronopol", "Польша"),
    "dolce": ("Kronopol", "Польша"),
    "ferrum": ("Kronopol", "Польша"),
    "paloma": ("Kronopol", "Польша"),
    "movie": ("Kronopol", "Польша"),
    "marine": ("Kronopol", "Польша"),
    "blackpool": ("Kronopol", "Польша"),
    "fiori": ("Kronopol", "Польша"),
    "sigma": ("Kronopol", "Польша"),
    
    "kronotex": ("Kronotex", "Германия"),
    "mammut": ("Kronotex", "Германия"),
    "маммут": ("Kronotex", "Германия"),
    "херрингбон": ("Kronotex", "Германия"),
    "robusto": ("Kronotex", "Германия"),
    "catwalk": ("Kronotex", "Германия"),
    "my castle": ("Kronotex", "Германия"),
    "mycastle": ("Kronotex", "Германия"),
    "amazone": ("Kronotex", "Германия"),
    "амазон": ("Kronotex", "Германия"),
    "exquisite": ("Kronotex", "Германия"),
    "exquiusite": ("Kronotex", "Германия"),
    "экскьюзит": ("Kronotex", "Германия"),
    
    "arbiton": ("Arbiton", "Польша"),
    "integra": ("Arbiton", "Польша"),
    "diamond": ("Arbiton", "Польша"),
    "indo": ("Arbiton", "Польша"),
    "vega": ("Arbiton", "Польша"),
    "vigo": ("Arbiton", "Польша"),
    "stiq": ("Arbiton", "Польша"),
    
    "alsafloor": ("Alsafloor", "Франция"),
    "epi": ("Alsafloor", "Франция"),
    
    "agt": ("AGT", "Турция"),
    "pruva": ("AGT", "Турция"),
    "concept": ("AGT", "Турция"),
    "yoga": ("AGT", "Турция"),
    "effect": ("AGT", "Турция"),
    "prk": ("AGT", "Турция"),
    "marco polo": ("AGT", "Турция"),
    "natura line": ("AGT", "Турция"),
    
    "classen": ("Classen", "Германия"),
    
    "solid": ("Solid", "Россия"),
    "солид": ("Solid", "Россия"),
    
    "russkiy profil": ("Русский Профиль", "Россия"),
    "русский профиль": ("Русский Профиль", "Россия"),
    "russkiy-profil": ("Русский Профиль", "Россия"),
    
    "silkwood": ("Silkwood", "Россия"),
    "silk wood": ("Silkwood", "Россия"),
    "silk road": ("Silk Road", "Россия"),
    "silkroad": ("Silk Road", "Россия"),
    "силк роуд": ("Silk Road", "Россия"),
    "шелковый путь": ("Silk Road", "Россия"),
    
    "kastamonu": ("Kastamonu", "Россия"),
    "кастамону": ("Kastamonu", "Россия"),
    
    "alwood": ("Alwood", "Узбекистан"),
    "элвуд": ("Alwood", "Узбекистан"),
    
    "tarkett": ("Tarkett", "Германия"),
    "таркетт": ("Tarkett", "Германия"),
    
    "coswick": ("Coswick", "Беларусь"),
    "косвик": ("Coswick", "Беларусь"),
    
    "barlinek": ("Barlinek", "Польша"),
    "барлинек": ("Barlinek", "Польша"),
    
    "tarwood": ("Tarwood", "Беларусь"),
    "тарвуд": ("Tarwood", "Беларусь"),
    
    "egger": ("Egger", "Германия"),
    "epl": ("Egger", "Германия"),
    
    "haro": ("Haro", "Германия"),
    "quick-step": ("Quick-Step", "Бельгия"),
    "quick step": ("Quick-Step", "Бельгия"),
    "квик степ": ("Quick-Step", "Бельгия"),
    
    "portika": ("Portika", "Россия"),
    "zadoor": ("Zadoor", "Россия"),
    "profildoors": ("ProfilDoors", "Россия"),
    "волховец": ("Волховец", "Россия"),
    "filomuro": ("Filomuro", "Италия"),
    "zuber": ("Zuber", "Китай"),
    "frida": ("Frida", "Китай"),
    "porta": ("Porta", "Россия"),
    "ultrawood": ("Ultrawood", "США"),
    
    "ultradekor": ("Ultradekor", "Россия"),
    "ультрадекор": ("Ultradekor", "Россия"),
    
    "kronofloor": ("Kronofloor", "Польша"),
    "кронофлор": ("Kronofloor", "Польша"),
    "rocko": ("Rocko", "Польша"),
    "рокко": ("Rocko", "Польша"),
    
    "sag": ("SAG", "Узбекистан"),
    "саг": ("SAG", "Узбекистан"),
    
    "system": ("System", "Турция"),
    "систем": ("System", "Турция"),
}

COUNTRIES_MAP = {
    "россия": "Россия", "russia": "Россия", "рф": "Россия",
    "германия": "Германия", "germany": "Германия",
    "бельгия": "Бельгия", "belgium": "Бельгия",
    "турция": "Турция", "turkey": "Турция", "турц": "Турция",
    "польша": "Польша", "poland": "Польша",
    "беларусь": "Беларусь", "belarus": "Беларусь", "белоруссия": "Беларусь",
    "франция": "Франция", "france": "Франция",
    "китай": "Китай", "china": "Китай",
    "узбекистан": "Узбекистан", "uzbekistan": "Узбекистан",
    "сша": "США", "usa": "США",
    "италия": "Италия", "italy": "Италия"
}

COLLECTION_DEFAULTS = {
    "gusto": ("33/АС5", "8"),
    "liberte": ("32/АС4", "8"),
    "opus": ("33/АС5", "8"),
    "veritas": ("33/АС5", "8"),
    "concept": ("32/АС4", "10"),
    "pruva": ("32/АС4", "8"),
    "yoga": ("32/АС4", "8"),
    "effect": ("32/АС4", "8"),
    "marco polo": ("32/АС4", "8"),
    "marine": ("32/АС4", "10"),
    "blackpool": ("32/АС4", "10"),
    "fiori": ("33/АС5", "10"),
    "movie": ("33/АС5", "8"),
    "paloma": ("33/АС5", "8"),
    "aurum dolce": ("33/АС5", "8"),
    "mammut": ("33/АС5", "12"),
    "маммут": ("33/АС5", "12"),
    "robusto": ("33/АС5", "12"),
    "catwalk": ("32/АС4", "8"),
    "my castle": ("33/АС5", "10"),
    "amazone": ("33/АС5", "10"),
    "амазон": ("33/АС5", "10"),
}

def parse_product_characteristics(name: str, category_brand: str = None, category_country: str = None):
    """
    Parse brand, country, grade, and thickness from product name and default category lineage.
    """
    if not name:
        return category_brand, category_country, None, None
        
    name_lower = name.lower()
    
    # 1. Brand & Country from Name scan
    brand = None
    country = None
    for kw, (b, c) in BRANDS_MAP.items():
        if kw in name_lower:
            brand = b
            country = c
            break
            
    # Use category defaults if name scan didn't find brand/country
    if not brand:
        brand = category_brand
    if not country:
        country = category_country
        
    # Check country scan if still no country
    if not country:
        for kw, c in COUNTRIES_MAP.items():
            if kw in name_lower:
                country = c
                break
                
    # 3. Grade / Class
    grade = None
    if "33/ac5" in name_lower or "33/ас5" in name_lower or "33класс" in name_lower or "33 класс" in name_lower or "33кл" in name_lower or "33 кл" in name_lower:
        grade = "33/АС5"
    elif "32/ac4" in name_lower or "32/ас4" in name_lower or "32класс" in name_lower or "32 класс" in name_lower or "32кл" in name_lower or "32 кл" in name_lower:
        grade = "32/АС4"
    elif "31/ac3" in name_lower or "31/ас3" in name_lower or "31класс" in name_lower or "31 класс" in name_lower or "31кл" in name_lower or "31 кл" in name_lower:
        grade = "31/АС3"
    elif "34/ac6" in name_lower or "34/ас6" in name_lower or "34класс" in name_lower or "34 класс" in name_lower or "34кл" in name_lower or "34 кл" in name_lower:
        grade = "34/АС6"
        
    # 4. Thickness
    thickness = None
    # First try: explicit thickness with unit (e.g. "4mm", "12мм", "5.5mm")
    explicit_thick = re.search(r'(?:^|[\s\*xх×])(\d+(?:\.\d+)?)\s*(?:мм|mm)\b', name_lower)
    if explicit_thick:
        thickness = explicit_thick.group(1)
    else:
        # Fallback: dimension string like "630*126*4mm" — take the LAST number before mm/мм
        dim_match = re.search(r'(\d+)\s*[xх\*×]\s*(\d+)\s*[xх\*×]\s*(\d+(?:\.\d+)?)\s*(?:мм|mm)?', name_lower)
        if dim_match:
            # The third number is typically the thickness
            thickness = dim_match.group(3)
        else:
            # Simple pattern: standalone number before мм/mm
            simple_match = re.search(r'(?:^|\s)(\d+(?:\.5)?)\s*(?:мм|mm)', name_lower)
            if simple_match:
                thickness = simple_match.group(1)
        
    # Apply collection fallbacks for grade and thickness if not found
    for coll_kw, (def_grade, def_thick) in COLLECTION_DEFAULTS.items():
        if coll_kw in name_lower:
            if not grade:
                grade = def_grade
            if not thickness:
                thickness = def_thick
            break
            
    # If still no grade (for parquet etc)
    if not grade:
        if "премиум" in name_lower or "premium" in name_lower or "селект" in name_lower or "select" in name_lower:
            grade = "Премиум"
        elif "элит" in name_lower or "elite" in name_lower:
            grade = "Элит"
        elif "натур" in name_lower or "nature" in name_lower or "natur" in name_lower:
            grade = "Натур"
        elif "рустик" in name_lower or "rustic" in name_lower:
            grade = "Рустик"
        elif "стандарт" in name_lower or "standard" in name_lower:
            grade = "Стандарт"
            
    return brand, country, grade, thickness



def get_volkhovets_kit_description(name: str) -> str:
    if not name or "волховец" not in name.lower():
        return ""
    
    name_upper = name.upper()
    
    kits = {
        "ROCCA": "Стандартный комплект\nМодель 830I / Гладкая эмаль\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 14 611 601 сум\nЦены указаны: *без установки и фурнитуры",
        "MASCOT": "Стандартный комплект\nМодель 846l / Гладкая эмаль\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 14 611 601 сум\nЦены указаны: *без установки и фурнитуры",
        "ESSE": "Нестандартный комплект\nМодель 8531 / Матовый облачный серый\nПолотно 800 х 2600 мм\nКороб компланарный\nНаличник компланарный\nСтоимость: 12 456 808 сум\nЦены указаны: *без установки и фурнитуры",
        "NEO CLASSIC": "Стандартный комплект\nМодель 8003.0I / Гладкая эмаль\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - І шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 13 160 361 сум\nЦены указаны: *без установки и фурнитуры",
        "LINEA": "Нестандартный комплект\nМодель 8059 / Матовый белоснежный\nПолотно 800 х 2600 мм\nКороб компланарный\nНаличник компланарный\nСтоимость: 12 947 844 сум\nЦены указаны: *без установки и фурнитуры",
        "LIGNUM": "Нестандартный комплект\nМодель 073І / LIGNUM ДУБ КОРОЛЕВСКИЙ БРАШ\nПолотно 800 х 2600 мм\nКлассический короб\nКомплект элементов портала\nНаличник - 2,5 × 2\nСтоимость: 36 905 232 сум\nЦены указаны: *без установки и фурнитуры",
        "PLANO": "Нестандартный комплект\nМодель 6305 / Бук белоснежный с позолотой\nПолотно 800 × 2600 мм\nМАССИВ ДУБА\nКлассический короб\nКомплект элементов портала\nКарниз\nНаличник - 2,5 × 2\nСтоимость: 31 346 784 сум\nЦены указаны: *без установки и фурнитуры",
        "EGO": "Стандартный комплект\nМодель 6193 / Дуб без эффектов, стекло Сатин\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - І шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 25 108 241 сум\nЦены указаны: *без установки и фурнитуры",
        "LITERA": "Стандартный комплект\nМодель 6363 / Бук с эффектами\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 х 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 25 764 281 сум\nЦены указаны: *без установки и фурнитуры",
        "PLANUM PRO": "Стандартный комплект\nМодель ООО / Шпон с эффектом Naturwood\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - скрытый\nУплотнитель для скрытого короба\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 15 404 813 сум\nЦены указаны: *без установки и фурнитуры",
        "PARIS": "Стандартный комплект\nМодель 8112 / Гладкая эмаль, стекло Сатин\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 х 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 15 784 521 сум\nЦены указаны: *без установки и фурнитуры",
        "VELVET": "Стандартный комплект\nМодель 8213 / Дуб с эффектами матовый\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб скрытый\nУплотнитесь для скрытого короба\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 32 859 453 сум\nЦены указаны: *без установки и фурнитуры",
        "WALL DOOR": "Стандартный комплект\nМодель ООО / Под окраску\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - скрытый\nУплотнитель для скрытого короба\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 11 329 744 сум\nЦены указаны: *без установки и фурнитуры",
        "GRIGLIATO": "Стандартный комплект\nМодель 63lI / Бук с эффектами, стекло Сатин\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 26 281 161 сум\nЦены указаны: *без установки и фурнитуры",
        "RIFT": "Стандартный комплект\nМодель 0205 / Шпон эвкалипта с эффектом Naturwood\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - скрытый\nУплотнитель для скрытого короба\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 23 018 853 сум\nЦены указаны: *без установки и фурнитуры",
        "PLANUM": "Стандартный комплект\nМодель ООО / ПЭТ\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 6 023 441 сум\nЦены указаны: *без установки и фурнитуры",
        "FORMATO": "Стандартный комплект\nМодель 040.06 / Прозрачное стекло\nВысота каж. полотна - 2000 - 2400\nШирина каж. полотна - 400 - 950\nКомплект для установки раздвижных систем на потолок декоративный, длина - 1600\nФурнитура подвеса полотна, матовый хром, с доводчиком - 2 шт\nСтоимость: 68 347 440 сум",
        "CENTRO": "Стандартный комплект\nМодель 2503 / ПЭТ\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - І шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 8 985 561 сум\nЦены указаны: *без установки и фурнитуры",
        "FREEDOM": "Стандартный комплект\nМодель 4295 /ПЭТ\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 7 256 001 сум\nЦены указаны: *без установки и фурнитуры",
        "GALANT": "Стандартный комплект\nМодель 1421 / Ламинатин\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 7 733 121 сум\nЦены указаны: *без установки и фурнитуры",
        "NEO": "Стандартный комплект\nМодель 2121 / ПЭТ\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 6 619 841 сум\nЦены указаны: *без установки и фурнитуры",
        "ANTIQUE": "Стандартный комплект\nМодель 7303\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 × 2\nКомплект Фурнитуры - петли, замок\nСтоимость: ОТ 35 624 761 сум\nЦены указаны: *без установки и фурнитуры",
        "CHARM": "Стандартный комплект\nМодель 6711 / Бук без эффектов\nШирина полотна 600/700/800/900\nМАССИВ ДУБА\nДлина полотна - 2000/2100\nКороб - 1 шт комплект\nНаличник - 2,5 х 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 20 118 361 сум\nЦены указаны: *без установки и фурнитуры",
        "IMPERIAL": "Стандартный комплект\nМодель 6503 / IMPERIAL, БУК БЕЗ ЭФФЕКТОВ\nШирина полотна 600/700/800/900\nДлина полотна - 2000/2100\nКороб - І шт комплект\nНаличник - 2,5 × 2\nКомплект фурнитуры - петли, замок\nСтоимость: ОТ 32 563 241 сум\nЦены указаны: *без установки и фурнитуры",
    }
    
    for collection, description in kits.items():
        if collection in name_upper:
            # Special case for Antique model 7301 which is non-standard
            if collection == "ANTIQUE" and "7301" in name_upper:
                return "Нестандартный комплект\nМодель 7301 / Бук бисквитный\nПолотно 800 х 2600 мм\nКлассический короб\nКомплект элементов портала\nКарниз\nПодпортальная декоративная планка\nСтоимость: 36 072 260 сум\nЦены указаны: *без установки и фурнитуры"
            return description
            
    return ""




def clean_door_name(name: str) -> str:
    if not name:
        return ""
    
    # 1. Remove prefixes like "Полотно дв."
    name = re.sub(r'^(?:Полотно дв\.|Полотно)\s+', '', name, flags=re.IGNORECASE)
    
    # 2. Remove leading article numbers (usually 3-5 digits at the start)
    # The article number is still stored in the SKU/artikul field for specs
    name = re.sub(r'^\d{3,5}\b\s*', '', name)
    
    # 3. Remove common technical suffixes and details that clutter the title
    suffixes = [
        r'нестд\b', r'уни\b', r'вр\b', r'тип\b', r'петл[иья]?\b', r'ответ\b',
        r'универсальное\b', r'врезка\b', r'ти[пn]\b', r'левое\b', r'правое\b',
        r'\b\d\s+\d\b', # technical noise like "1 4" or "1 3"
        r'\bтип\s+\d\b'
    ]
    for s in suffixes:
        name = re.sub(s, '', name, flags=re.IGNORECASE)

    # Clean up standalone dashes, commas, semicolons at the end of words or strings
    name = re.sub(r'\s*[,;\-\s]+\s*(?=\s|$)', ' ', name)
    # Clean up empty brackets
    name = re.sub(r'\(\s*\)', '', name)
    name = re.sub(r'\[\s*\]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()
