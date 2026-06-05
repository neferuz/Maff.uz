import re

def get_base_model_name(name: str) -> str:
    if not name:
        return ""
    cleaned = name
    
    # 1. Normalize brand names and helper tags first
    for tag in ["Zadoor-S Classic", "S Classic", "Zadoor", "Portika", "Volkhovets", "Волховец", "Filomuro", "Art-Lite", "ArtКлассик", "АртКлассик"]:
        cleaned = re.sub(re.escape(tag), "", cleaned, flags=re.IGNORECASE)
        
    # Clean showroom / stand / sample tags
    tags_to_remove = [
        r"\(Образец\)", r"Образец", r"СТЕНД", r"Стенд", r"ДРУЖБА", 
        r"ПАРКЕНТ ДВЕРИ", r"ПАРКЕНТ", r"Стенд слева", r"Стенд справа", 
        r"слева", r"справа", r"Дверное полотно", r"Стоевая", r"\(для полотна\)"
    ]
    for tag in tags_to_remove:
        cleaned = re.sub(tag, "", cleaned, flags=re.IGNORECASE)
        
    cleaned = re.sub(r'\b(ПО|ПГ|ПГО)\b', '', cleaned, flags=re.IGNORECASE)
    
    # Normalize ПТА-50 to -50
    cleaned = re.sub(r'ПТА-(\d+)', r'-\1', cleaned, flags=re.IGNORECASE)
    # Strip letters after numbers e.g. 50G -> 50
    cleaned = re.sub(r'\b(\d+)[A-Z]\b', r'\1', cleaned)
    # Normalize space around dashes e.g. "Порта -50" -> "Порта-50"
    cleaned = re.sub(r'\s*-\s*(\d+)', r'-\1', cleaned)
    
    # 2. Truncate at variant/color/size/technical details
    triggers = [
        r'\b\d+A[A-Z]\b',
        r'\b[B-Z]\s+ПП\b',
        r'\b[B-Z]\b',
        r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\s*[xх\*×]\s*\d+\b', # 3D dimensions
        r'\b\d+(?:\.\d+)?\s*[xх\*×]\s*\d+(?:\.\d+)?\b',                 # 2D dimensions
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
            
    # Check known color triggers
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
    cleaned = cleaned.strip().strip(",;-#().")
    return cleaned

names = [
    "Classic Baguette Венеция ПО В3 Белый матовый Сатинато с рамкой",
    "Classic Baguette Венеция ПГ В3 Белый матовый"
]

for name in names:
    print(f"Original: {name}")
    print(f"Cleaned : {get_base_model_name(name)}")
    print("-" * 40)
