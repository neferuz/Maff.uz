import re

def get_base_model_name(name: str) -> str:
    if not name: return ""
    name_lower = name.lower()
    cleaned = name
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
        r'Milling',
        r'Magic',
        r'Белый матовый|Серый матовый|Матовый графит|Нордик|Орех карамель',
        r'Жемчужно-перламутровый|Беленый дуб|Дуб темный|Дуб натуральный',
        r'Alaska|Grey Oak|Natural Oak|White Oak|Молочный матовый',
        r'Графит премьер мат|Тёмный лён|Бетон светлый|Светлый лён',
        r'Сканди|Бетон тёмный|Бренди|Светло-серый|Оливковый|Белая эмаль',
        r'Бежевый|Мелон|Милано|Венге|Итальянский орех|Жасмин белый|Белый шелк',
        r'Тёмно-серый|Кофе|Антрацит|Хром|Черный|Черный лакобель',
        r'Keramik Beige|Keramik Brown|Keramik Valse|Ice|Милквуд|Опал|Айвори',
        r'Стоун|Дэним|Шэдоу|Меланж|Светлый кунжут|Темный кунжут',
        r'Песочный матовый|Дарквуд|Shellac Cream|Shellac White|Shellac Graphite',
        r'Thermo Oak|Alpik Oak|Black Star|Light Sonoma|Cappuccino Veralinga',
        r'Wenge Veralinga|Rocks Beige|Rocks Pearl|Nardo Grey',
    ]
    
    for trigger in triggers:
        match = re.search(trigger, cleaned, flags=re.IGNORECASE)
        if match:
            cleaned = cleaned[:match.start()]
    
    cleaned = cleaned.replace("Нестандарт", "").replace("Стандарт", "")
    return cleaned.strip()

allowed_models = [
    "Порта-1 ПП Alaska",
    "Порта-1 ПП Nardo Grey",
    "Порта-50 4AB Эксимер Keramik Valse",
    "Порта-50 4AB Эксимер Keramik Brown",
    "Порта-50.1 4AB ПП Natural Oak",
    "Порта-50 B ПП Rocks Beige",
    "Порта-50 B ПП Rocks Pearl",
    "Порта-50.11 4AB ПП Alpik Oak",
    "Порта-51 4AB ПП Alaska Black Star",
    "Порта-51 4AB ПП Alpik Oak Black Star",
    "Порта-50.10 B ПП Rocks Beige",
    "Порта-50.10 B ПП Rocks Pearl",
    "Порта-58 4AB ПП Grey Oak"
]

grouped = {}
for m in allowed_models:
    b = get_base_model_name(m)
    if b not in grouped: grouped[b] = []
    grouped[b].append(m)

for k, v in grouped.items():
    print(f"Group: '{k}'")
    for val in v:
        print(f"  - {val}")
