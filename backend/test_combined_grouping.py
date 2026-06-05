import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

def get_base_model_name_combined(name: str) -> str:
    if not name:
        return ""
    
    # 1. Handle products path
    name_lower = name.lower()
    is_handle = any(kw in name_lower for kw in ["ручк", "ручка", "ручки", "петли", "ограничител"])
    
    if is_handle:
        name_lower = name_lower.replace("k.sl.fly", "fly sl")
        name_lower = name_lower.replace("bk6 tl", "blade tl")
        
        known_models = [
            "pixar-l", "pixar l", "axel-l", "axel l", "agate", "mimas", "metis", "concordia", "sarp", "marvel", 
            "akik", "atlas", "aten", "despina", "odin", "zetta", "gamma", "vega", "sinus", 
            "rocca", "prizma", "rodin", "rocket", "spinal", "maja", "carme", "linear", 
            "stark", "jasper", "vision", "libra", "blade tl", "blade-tl", "fly sl", "fly-sl", "columba", 
            "wave urs", "wave-urs", "wave", "stimul", "wc-bolt", "agb 1367", "agb 1593", "agb 1625", 
            "agb 1727", "agb 815", "agb 820", "agb 821", "agb 827", "agb 849", "agb 850", 
            "agb 851", "agb 873", "agb 874", "agb 899", "agb 906", "agb 913", "agb 914", 
            "agb 915", "agb 928", "agb 929", "agb 944", "agb 949", "agb 950", "agb 951", 
            "agb 952", "agb 953", "agb 959", "agb 811", "sx 713", "sx 804", "sx 806",
            "а14-1162", "а32-1771", "а32-1727", "a14-1593", "a32-1625", "columba",
            "mori", "neo", "sample", "spline jk", "ultra jk", "aqua urs", "aqua-urs", "aqua"
        ]
        known_models = sorted(known_models, key=lambda x: -len(x))
        
        for model in known_models:
            pattern = r'\b' + re.escape(model) + r'\b'
            if re.search(pattern, name_lower):
                if model in ["pixar-l", "pixar l", "axel-l", "axel l", "agate", "mimas", "metis", "concordia", "sarp", 
                             "marvel", "akik", "atlas", "aten", "despina", "odin", "zetta", "gamma", 
                             "vega", "sinus", "rocca", "prizma", "rodin", "rocket", "spinal", "maja", 
                             "carme", "linear", "stark", "jasper", "vision", "libra"]:
                    normalized_model = model.replace("-", " ")
                    capitalized_model = " ".join(w.capitalize() for w in normalized_model.split())
                    return f"System {capitalized_model}"
                elif model.startswith("agb ") or model.startswith("sx "):
                    return model.upper()
                else:
                    return " ".join(w.capitalize() for w in model.split())

    # 2. General/Door products path
    cleaned = name
    for tag in ["Zadoor-S Classic", "S Classic", "Zadoor", "Portika", "Volkhovets", "Волховец", "Filomuro", "Art-Lite", "ArtКлассик", "АртКлассик"]:
        cleaned = re.sub(re.escape(tag), "", cleaned, flags=re.IGNORECASE)
        
    tags_to_remove = [
        r"\(Образец\)", r"Образец", r"СТЕНД", r"Стенд", r"ДРУЖБА", 
        r"ПАРКЕНТ ДВЕРИ", r"ПАРКЕНТ", r"Стенд слева", r"Стенд справа", 
        r"слева", r"справа", r"Дверное полотно", r"Стоевая", r"\(для полотна\)"
    ]
    for tag in tags_to_remove:
        cleaned = re.sub(tag, "", cleaned, flags=re.IGNORECASE)
        
    cleaned = re.sub(r'ПГ\s+ПГ', ' ПГ ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'ПО\s+ПО', ' ПО ', cleaned, flags=re.IGNORECASE)
    
    cleaned = re.sub(r'ПТА-(\d+)', r'-\1', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(\d+)[A-Z]\b', r'\1', cleaned)
    cleaned = re.sub(r'\s*-\s*(\d+)', r'-\1', cleaned)
    
    triggers = [
        r'\b\d+A[A-Z]\b',
        r'\b[B-Z]\s+ПП\b',
        r'\b[B-Z]\b',
        r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\s*[xх\*×]\s*\d+\b',
        r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\b',
        r'\b(400|600|700|800|900)\b',
        r'\(',
        r'\bALU\b',
        r'Revers|Реверс',
        r'с четвертью|с четв\.|четвертью',
        r'под покраску|под покр',
        r'\bПП\b',
        r'\bФлекс\b',
        r'\bЭмаль\b',
        r'\bЭксимер\b',
        r'\bЭко\b',
        r'\bЭКО\b',
        r'\bЭкошпон\b',
        r'\bШпон\b',
        r'\bГрунт\b',
        r'\bЗеркало\b',
        r'левая|правая|\bлев\b|\bправ\b',
        r'с врезкой|\bс\s+вр\b|без врезки',
        r'сатинато|прозрач',
        r'RAL\s+\d+',
        r'\bTopan\b',
        r'\bToppan\b'
    ]
    
    earliest_idx = len(cleaned)
    for trig in triggers:
        match = re.search(trig, cleaned, re.IGNORECASE)
        if match and match.start() < earliest_idx:
            earliest_idx = match.start()
            
    known_colors = [
        "Белый матовый", "Серый матовый", "Матовый графит", "Матовый кремовый",
        "Нордик", "Орех карамель", "Жемчужно-перламутровый", "Беленый дуб",
        "Дуб темный", "Дуб темный продольный", "Дуб натуральный", "Дуб натуральный продольный",
        "Alaska", "Grey Oak", "Natural Oak", "White Oak", "Молочный матовый", "Графит премьер мат",
        "Тёмный лён", "Бетон светлый", "Светлый лён", "Сканди", "Бетон тёмный", "Бренди",
        "Светло-серый", "Оливковый", "Белая эмаль", "Бежевый", "Мелон", "Милано", "Венге",
        "Итальянский орех", "Жасмин белый", "Белый шелк", "Тёмно-серый", "Кофе", "Антрацит", "Хром", "Черный", "Черный лакобель",
        "Ламинатин Белый", "Keramik Beige", "Keramik Brown", "Ice", "Милквуд", "Опал", "Айвори", "Стоун", "Дэним", "Шэдоу",
        "Белый", "Серый", "Кремовый", "Меланж", "Светлый кунжут", "Темный кунжут", "Песочный матовый", "Дарквуд", "Дарк Вуд"
    ]
    sorted_colors = sorted(known_colors, key=lambda x: -len(x))
    for c in sorted_colors:
        escaped_c = re.escape(c)
        reg = r"(?:^|[^а-яа-ёa-z0-9])" + escaped_c + r"(?:$|[^а-яа-ёa-z0-9])"
        match = re.search(reg, cleaned, re.IGNORECASE)
        if match and match.start() < earliest_idx:
            earliest_idx = match.start()
            
    cleaned = cleaned[:earliest_idx]
    
    cleaned = re.sub(r'Английская классика 2|АК2|АК 2|АК-2', 'Английская классика', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bАК\b', 'Английская классика', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\bА\s+К\b', 'Английская классика', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'(-?\d+)\.\d+', r'\1', cleaned)
    
    cleaned = re.sub(r'\s+', ' ', cleaned)
    # Fix the strip issue where it stripped the letter 's'
    cleaned = cleaned.strip().strip(",;-#().")
    return cleaned

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Let's test a few doors and handles
        res = await session.execute(
            text("SELECT name FROM product WHERE category_id IN (174, 356) OR category_id IN (SELECT id FROM category WHERE parent_id IN (174, 356, 143)) LIMIT 30")
        )
        names = [row[0] for row in res.fetchall()]
        print("Testing combined grouping logic on names:")
        for name in names:
            print(f"Original: {name}")
            print(f"Grouped : {get_base_model_name_combined(name)}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(main())
