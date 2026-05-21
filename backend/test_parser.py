import asyncio
import re
from app.db.session import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select

# Define brand and country lists/mappings
BRANDS_MAP = {
    # Brand keywords -> (Canonical Brand, Canonical Country)
    "joss beaumont": ("Joss Beaumont", "Россия"),
    "jossbeaumont": ("Joss Beaumont", "Россия"),
    "gusto": ("Joss Beaumont", "Россия"),
    "swiss krono": ("Swiss Krono", "Россия"),
    "swisskrono": ("Swiss Krono", "Россия"),
    "swiss-krono": ("Swiss Krono", "Россия"),
    "magister": ("Swiss Krono", "Россия"),
    "kronopol": ("Kronopol", "Польша"),
    "aurum": ("Kronopol", "Польша"),
    "platinium": ("Kronopol", "Польша"),
    "dolce": ("Kronopol", "Польша"),
    "ferrum": ("Kronopol", "Польша"),
    "mammut": ("Kronotex", "Германия"),
    "маммут": ("Kronotex", "Германия"),
    "херрингбон": ("Kronotex", "Германия"),
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
    "haro": ("Haro", "Германия"),
    "quick-step": ("Quick-Step", "Бельгия"),
    "quick step": ("Quick-Step", "Бельгия"),
    "квик степ": ("Quick-Step", "Бельгия"),
    "квик-степ": ("Quick-Step", "Бельгия"),
    "portika": ("Portika", "Россия"),
    "портика": ("Portika", "Россия"),
    "zadoor": ("Zadoor", "Россия"),
    "задор": ("Zadoor", "Россия"),
    "profildoors": ("ProfilDoors", "Россия"),
    "profil doors": ("ProfilDoors", "Россия"),
    "профильдорс": ("ProfilDoors", "Россия"),
    "профиль дорс": ("ProfilDoors", "Россия"),
    "волховец": ("Волховец", "Россия"),
    "volkhovets": ("Волховец", "Россия"),
    "filomuro": ("Filomuro", "Италия"),
    "филомуро": ("Filomuro", "Италия"),
    "zuber": ("Zuber", "Китай"),
    "зубер": ("Zuber", "Китай"),
    "frida": ("Frida", "Китай"),
    "фрида": ("Frida", "Китай"),
    "porta": ("Porta", "Россия"),
    "порта": ("Porta", "Россия"),
    "ultrawood": ("Ultrawood", "США"),
    "ультравуд": ("Ultrawood", "США"),
    "ultradekor": ("Ultradekor", "Россия"),
    "ультрадекор": ("Ultradekor", "Россия"),
    "ultradecor": ("Ultradekor", "Россия")
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

def parse_characteristics(name: str):
    if not name:
        return None, None, None, None
        
    name_lower = name.lower()
    
    # 1. Brand & Country from Brand Mapping
    brand = None
    country = None
    for kw, (b, c) in BRANDS_MAP.items():
        if kw in name_lower:
            brand = b
            country = c
            break
            
    # 2. Country scan if not matched or to override
    if not country:
        for kw, c in COUNTRIES_MAP.items():
            if kw in name_lower:
                country = c
                break
                
    # 3. Grade / Class
    # Laminate Classes
    grade = None
    if "33/ac5" in name_lower or "33/ас5" in name_lower or "33класс" in name_lower or "33 класс" in name_lower or "33кл" in name_lower or "33 кл" in name_lower:
        grade = "33/АС5"
    elif "32/ac4" in name_lower or "32/ас4" in name_lower or "32класс" in name_lower or "32 класс" in name_lower or "32кл" in name_lower or "32 кл" in name_lower:
        grade = "32/АС4"
    elif "31/ac3" in name_lower or "31/ас3" in name_lower or "31класс" in name_lower or "31 класс" in name_lower or "31кл" in name_lower or "31 кл" in name_lower:
        grade = "31/АС3"
    elif "34/ac6" in name_lower or "34/ас6" in name_lower or "34класс" in name_lower or "34 класс" in name_lower or "34кл" in name_lower or "34 кл" in name_lower:
        grade = "34/АС6"
    else:
        # Parquet Grades
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
            
    # 4. Thickness
    # Regex to find thickness: e.g. 8мм, 8 мм, 8X, 8х, 8*
    thickness = None
    thickness_match = re.search(r'(?:^|\s|\()(\d+(?:\.5)?)\s*(?:мм|mm|x|х|\*)', name_lower)
    if thickness_match:
        thickness = thickness_match.group(1)
        
    return brand, country, grade, thickness

async def main():
    async with AsyncSessionLocal() as session:
        stmt = select(Product).limit(100)
        result = await session.execute(stmt)
        products = result.scalars().all()
        
        print(f"{'Original Name':<50} | {'Parsed Brand':<15} | {'Parsed Country':<15} | {'Parsed Grade':<12} | {'Parsed Thickness':<10}")
        print("=" * 115)
        for p in products:
            b, c, g, t = parse_characteristics(p.name)
            # Only print if we are parsing something or to see general behavior
            trunc_name = (p.name[:47] + "...") if len(p.name) > 50 else p.name
            print(f"{trunc_name:<50} | {str(b):<15} | {str(c):<15} | {str(g):<12} | {str(t):<10}")

if __name__ == "__main__":
    asyncio.run(main())
