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
        return "MAFF"
    
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
