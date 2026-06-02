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
    "ультрадекор": ("Ultradekor", "Россия")
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
    thickness_match = re.search(r'(?:^|\s|\()(\d+(?:\.5)?)\s*(?:мм|mm|x|х|\*)', name_lower)
    if thickness_match:
        thickness = thickness_match.group(1)
        
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


def clean_door_name(name: str) -> str:
    if not name:
        return ""
    # Remove three-dimensional sizes (e.g. 43х700х2000, 2300*600*40)
    name = re.sub(r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\s*[xх\*×]\s*\d+\b', '', name, flags=re.IGNORECASE)
    # Remove two-dimensional sizes (e.g. 2000х800, 43*2600)
    name = re.sub(r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+\b', '', name, flags=re.IGNORECASE)
    # Clean up standalone dashes, commas, semicolons at the end of words or strings (but not parentheses!)
    name = re.sub(r'\s*[,;\-\s]+\s*(?=\s|$)', ' ', name)
    # Clean up empty brackets
    name = re.sub(r'\(\s*\)', '', name)
    name = re.sub(r'\[\s*\]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


