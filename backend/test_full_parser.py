import asyncio
import re
from app.db.session import AsyncSessionLocal
from app.models.product import Product, Category
from sqlalchemy import select

# Define brand and country lists/mappings
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

# Collection default values for grade & thickness
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

def parse_characteristics(name: str, category_brand=None, category_country=None):
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

async def main():
    async with AsyncSessionLocal() as session:
        # 1. Load categories and build ancestor maps
        cat_result = await session.execute(select(Category))
        categories = cat_result.scalars().all()
        cat_by_id = {c.id: c for c in categories}
        
        # Traverse parent chain to assign brand/country defaults to categories
        cat_defaults = {}
        for c in categories:
            # Climb up
            curr = c
            brand, country = None, None
            visited = set()
            while curr and curr.id not in visited:
                visited.add(curr.id)
                curr_name_lower = curr.name.lower()
                # Check if this category name contains any brand names
                for kw, (b, co) in BRANDS_MAP.items():
                    if kw in curr_name_lower:
                        brand = b
                        country = co
                        break
                if brand:
                    break
                curr = cat_by_id.get(curr.parent_id) if curr.parent_id else None
            cat_defaults[c.id] = (brand, country)
            
        # 2. Query products
        prod_result = await session.execute(select(Product).limit(100))
        products = prod_result.scalars().all()
        
        print(f"{'Original Name':<45} | {'Category ID/Name':<20} | {'Brand':<15} | {'Country':<15} | {'Grade':<10} | {'Thickness':<5}")
        print("=" * 125)
        for p in products:
            c_brand, c_country = cat_defaults.get(p.category_id, (None, None))
            b, co, g, t = parse_characteristics(p.name, c_brand, c_country)
            trunc_name = (p.name[:42] + "...") if len(p.name) > 45 else p.name
            cat_name = cat_by_id.get(p.category_id).name if p.category_id and p.category_id in cat_by_id else "None"
            trunc_cat = (cat_name[:17] + "...") if len(cat_name) > 20 else cat_name
            print(f"{trunc_name:<45} | {trunc_cat:<20} | {str(b):<15} | {str(co):<15} | {str(g):<10} | {str(t):<5}")

if __name__ == "__main__":
    asyncio.run(main())
