from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas.product import Product, ProductCreate, ProductUpdate, ProductDetail
from app.crud.crud_product import product_crud, category_crud
from app.services.one_c import one_c_service
from app.utils.sanitizer import parse_product_characteristics, BRANDS_MAP, clean_door_name

router = APIRouter()

def get_base_model_name(name: str) -> str:
    import re
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
    # Normalize ё->е so colors like "Бетон тёмный" match "Бетон темный" (1:1 char swap keeps indices aligned)
    cleaned_norm = cleaned.replace("ё", "е").replace("Ё", "Е")
    for c in sorted_colors:
        escaped_c = re.escape(c.replace("ё", "е").replace("Ё", "Е"))
        reg = r"(?:^|[^а-яa-z0-9])" + escaped_c + r"(?:$|[^а-яa-z0-9])"
        match = re.search(reg, cleaned_norm, re.IGNORECASE)
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

@router.get("", response_model=List[Product])
async def read_products(
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    category_id: int = None,
    q: str = None,
    include_inactive: bool = False,
    group: bool = False,
) -> Any:
    """
    Retrieve products.
    """
    from sqlalchemy.future import select
    from sqlalchemy.orm import defer
    from app.models.product import Product as ProductModel
    
    query = select(ProductModel).options(defer(ProductModel.description))
    
    if q:
        from sqlalchemy import and_, or_
        terms = [t for t in q.split() if t]
        if terms:
            conditions = []
            for term in terms:
                conditions.append(
                    or_(
                        ProductModel.name.ilike(f"%{term}%"),
                        ProductModel.brand.ilike(f"%{term}%")
                    )
                )
            query = query.filter(and_(*conditions))
    elif category_id:
        from app.models.product import Category as CategoryModel
        cat_result = await db.execute(select(CategoryModel))
        all_cats = cat_result.scalars().all()
        
        def get_all_child_ids(cat_id: int) -> list:
            ids = [cat_id]
            children = [c.id for c in all_cats if c.parent_id == cat_id]
            for child in children:
                ids.extend(get_all_child_ids(child))
            return ids
            
        category_ids = get_all_child_ids(category_id)
        query = query.filter(ProductModel.category_id.in_(category_ids))
        
    if not include_inactive:
        query = query.filter(ProductModel.is_active != False)
        
    result = await db.execute(query.offset(skip).limit(limit))
    products = result.scalars().all()
    
    # Detach instances and remap excluded category IDs to their bypassed ancestors
    from sqlalchemy.orm import make_transient
    for p in products:
        make_transient(p)
        if p.category_id in (449, 457):
            p.category_id = 448
        elif p.category_id == 427:
            p.category_id = 426
        elif p.category_id == 464:
            p.category_id = 328
        elif p.category_id in (143, 377):
            p.category_id = 356
            
    if group:
        # Load all categories to walk the parent chain
        from app.models.product import Category as CategoryModel
        try:
            _ = all_cats
        except NameError:
            cat_result = await db.execute(select(CategoryModel))
            all_cats = cat_result.scalars().all()
            
        def is_under_doors_or_handles(cid: int) -> bool:
            visited = set()
            current_id = cid
            while current_id and current_id not in visited:
                if current_id in (174, 356):
                    return True
                visited.add(current_id)
                parent = next((c for c in all_cats if c.id == current_id), None)
                if not parent:
                    return False
                if parent.parent_id in (174, 356):
                    return True
                current_id = parent.parent_id
            return False

        def is_placeholder_url(url: str) -> bool:
            if not url:
                return True
            url_lower = url.lower()
            return "placeholder" in url_lower or "порта-51" in url_lower

        grouped = {}
        non_grouped = []
        
        for p in products:
            if is_under_doors_or_handles(p.category_id):
                base_name = get_base_model_name(p.name).lower().strip()
                if not base_name:
                    base_name = p.name.lower().strip()
                if base_name not in grouped:
                    grouped[base_name] = p
                else:
                    existing = grouped[base_name]
                    existing_has_real = bool(existing.image_url) and not is_placeholder_url(existing.image_url)
                    current_has_real = bool(p.image_url) and not is_placeholder_url(p.image_url)
                    
                    if not existing_has_real and current_has_real:
                        grouped[base_name] = p
                    elif existing_has_real == current_has_real:
                        existing_has_any = bool(existing.image_url)
                        current_has_any = bool(p.image_url)
                        if not existing_has_any and current_has_any:
                            grouped[base_name] = p
                        elif existing_has_any == current_has_any:
                            if p.stock > 0 and existing.stock <= 0:
                                grouped[base_name] = p
            else:
                non_grouped.append(p)
                
        products = list(grouped.values()) + non_grouped
        
    from app.services.translation import get_locale_from_request, get_translations_bulk
    from app.core.config import settings
    lang = get_locale_from_request(request)
    if lang and lang != "ru":
        await get_translations_bulk(
            db, 
            "product", 
            products, 
            ["name", "unit", "brand", "country", "grade", "thickness"], 
            lang, 
            settings.CLAUDE_API_KEY
        )
        
    return products

@router.get("/legacy-redirect/{path:path}")
async def legacy_redirect(
    path: str,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Intelligent redirect from old Bitrix URLs to new product or category pages.
    """
    from fastapi.responses import RedirectResponse
    from sqlalchemy.future import select
    from app.models.product import Product as ProductModel
    from app.models.product import Category as CategoryModel
    import re

    path_clean = path.strip("/")
    if not path_clean:
        return RedirectResponse(url="/catalog", status_code=301)
        
    segments = [s.lower() for s in path_clean.split("/") if s]
    if not segments:
        return RedirectResponse(url="/catalog", status_code=301)
        
    # Get leaf segment
    leaf = segments[-1]
    
    # 1. Extract potential SKUs
    parts = re.split(r'[-_]', leaf)
    potential_skus = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if p.isdigit() and len(p) >= 3:
            potential_skus.append(p)
        elif p.startswith("epl") and len(p) >= 5:
            potential_skus.append(p.upper())
        elif p.startswith("el") and len(p) >= 5:
            potential_skus.append(p.upper())
        elif p.startswith("ehl") and len(p) >= 5:
            potential_skus.append(p.upper())
        elif p.startswith("k") and len(p) >= 4 and p[1:].isdigit():
            potential_skus.append(p.upper())
            
    # Try SKU match first
    for sku in potential_skus:
        # Search by exact SKU
        q = select(ProductModel).where(ProductModel.sku == sku)
        res = await db.execute(q)
        prod = res.scalars().first()
        if prod:
            return RedirectResponse(url=f"/product/{prod.id}", status_code=301)
            
        # Try name contains SKU
        q = select(ProductModel).where(ProductModel.name.ilike(f"%{sku}%"))
        res = await db.execute(q)
        prod = res.scalars().first()
        if prod:
            return RedirectResponse(url=f"/product/{prod.id}", status_code=301)

    # 2. Try keyword/translit matching (useful for doors & other products without standard sku)
    TRANSLIT_MAP = {
        "belennyy": "белен",
        "belenyi": "белен",
        "dub": "дуб",
        "oreh": "орех",
        "yasen": "ясень",
        "seryy": "серый",
        "belyy": "белый",
        "chernyy": "черный",
        "venge": "венге",
        "shokolad": "шоколад",
        "grafit": "графит",
        "yasen": "ясен",
    }
    
    words = [w for w in parts if len(w) >= 2 and w not in ["pg", "dg", "door", "dveri", "faska", "klass", "class", "vlagostoykiy"]]
    if words:
        search_terms = []
        for w in words:
            if w in TRANSLIT_MAP:
                search_terms.append(TRANSLIT_MAP[w])
            else:
                search_terms.append(w)
                
        if len(search_terms) >= 2:
            q = select(ProductModel).where(
                ProductModel.name.ilike(f"%{search_terms[0]}%"),
                ProductModel.name.ilike(f"%{search_terms[1]}%")
            )
            res = await db.execute(q)
            prod = res.scalars().first()
            if prod:
                return RedirectResponse(url=f"/product/{prod.id}", status_code=301)
        elif len(search_terms) == 1:
            q = select(ProductModel).where(ProductModel.name.ilike(f"%{search_terms[0]}%"))
            res = await db.execute(q)
            prod = res.scalars().first()
            if prod:
                return RedirectResponse(url=f"/product/{prod.id}", status_code=301)

    # 3. Last resort fallback: try to find a category match from segments
    for segment in reversed(segments):
        if segment in ["laminat", "dveri", "porozhki", "plintus", "podlozhka", "klei", "furnitura"]:
            if segment == "laminat":
                return RedirectResponse(url="/category/laminat", status_code=301)
            elif segment == "dveri":
                return RedirectResponse(url="/category/mezhkomnatnye-dveri", status_code=301)
            elif segment == "plintus":
                return RedirectResponse(url="/category/plintus", status_code=301)
            elif segment == "porozhki":
                return RedirectResponse(url="/category/porogi", status_code=301)
            elif segment == "podlozhka":
                return RedirectResponse(url="/category/podlozhka", status_code=301)
                
        q = select(CategoryModel).where(CategoryModel.name.ilike(segment))
        res = await db.execute(q)
        cat = res.scalars().first()
        if cat:
            cat_slug = cat.name.lower().replace(" ", "-")
            return RedirectResponse(url=f"/category/{cat_slug}", status_code=301)
            
    return RedirectResponse(url="/catalog", status_code=301)

@router.get("/{id}", response_model=ProductDetail)
async def read_product(
    id: int,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get product by ID.
    """
    product = await product_crud.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Load category attributes for this product (inherit from parents if empty)
    category_attributes = None
    if product.category_id:
        # Fetch all categories to walk the tree
        all_cats = await category_crud.get_multi(db, limit=1000)
        cat_map = {c.id: c for c in all_cats}
        curr_id = product.category_id
        visited = set()
        while curr_id and curr_id not in visited:
            visited.add(curr_id)
            cat = cat_map.get(curr_id)
            if cat and cat.attributes:
                category_attributes = cat.attributes
                break
            curr_id = cat.parent_id if cat else None
    # Attach dynamically so Pydantic picks it up
    product.category_attributes = category_attributes

    # Detach instance and remap excluded category IDs to their bypassed ancestors
    from sqlalchemy.orm import make_transient
    make_transient(product)
    if product.category_id in (449, 457):
        product.category_id = 448
    elif product.category_id == 427:
        product.category_id = 426
    elif product.category_id == 464:
        product.category_id = 328
    elif product.category_id in (143, 377):
        product.category_id = 356

    from app.services.translation import get_locale_from_request, get_translations_bulk
    from app.core.config import settings
    lang = get_locale_from_request(request)
    if lang and lang != "ru":
        await get_translations_bulk(
            db,
            "product",
            [product],
            ["name", "description", "unit", "brand", "country", "grade", "thickness"],
            lang,
            settings.CLAUDE_API_KEY
        )

    return product

@router.post("/sync")
async def sync_products(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Sync products with 1C in background.
    """
    from app.db.session import AsyncSessionLocal
    
    async def run_sync():
        async with AsyncSessionLocal() as background_db:
            await perform_sync(background_db)
            
    background_tasks.add_task(run_sync)
    return {"status": "success", "message": "Синхронизация запущена в фоновом режиме"}


VOLKHOVETS_NON_DOOR_IDS = [
    2423, 2560, 4901, 4954, 2422, 2353, 4253, 5018, 2815, 2816,
    2157, 4348, 2366, 5420, 5421, 6421, 1330, 2403, 4252, 2774
]

def extract_volkhovets_group_key(name: str):
    import re
    # 1. Extract model
    model_match = re.search(r'\b(\d{4}(?:\.\d)?|\d{4}/\d{4})\b', name)
    model = model_match.group(1) if model_match else "UNKNOWN"
    
    # 2. Extract collection
    collection = "Planum"
    name_lower = name.lower()
    for coll in ['rocca', 'wall-door', 'toscana', 'palazzo', 'plano', 'mascot', 'galant', 'paris', 'centro', 'charm', 'neo', 'linea', 'antique', 'esse', 'formato', 'freedom', 'imperial', 'lignum', 'rift', 'velvet']:
        if coll in name_lower:
            collection = coll.capitalize()
            break
            
    # 3. Extract color/finish
    # If the name has parentheses, extract from inside parentheses
    paren_match = re.search(r'\((.+?)\)', name)
    if paren_match:
        color_raw = paren_match.group(1)
    else:
        # Otherwise, clean the name string to get the color
        color_raw = name
        # Remove model and collection
        if model != "UNKNOWN":
            color_raw = color_raw.replace(model, "")
        color_raw = re.sub(collection, "", color_raw, flags=re.IGNORECASE)
        # Remove common door keywords
        stop_words = [
            "полотно", "дверь", "дв.", "дв", "волнохвец", "волховец", "образец", "левое", "правое",
            "ответное", "универсальное", "уни", "врезка", "тип", "петли", "петли.", "петлей",
            "петля", "без", "врезки", "с", "увс", "нестд", "обратное", "открывание", "открыв.",
            "открывания", "ал.кром.", "ал.кр", "алю", "кр.", "коробка", "комплект", "отк."
        ]
        for sw in stop_words:
            color_raw = re.sub(rf'\b{sw}\b', "", color_raw, flags=re.IGNORECASE)
            
    # 4. Clean up color_raw from dimensions, prep and opening tags
    color_clean = re.sub(r'\b\d+\s+\d+\b', '', color_raw)
    color_clean = re.sub(r'\b\d+[\*xх×]\d+\b', '', color_clean)
    color_clean = re.sub(r'\b(вр|отв|откр|лев|прав|петл|пет|обрат\s*открыв|открыв|ответ|нестандартн|универ|врез|тип\s*\d+|врезка)\b', '', color_clean, flags=re.IGNORECASE)
    color_clean = re.sub(r'[\.]', ' ', color_clean)
    color_clean = re.sub(r'[\,\@\#\$\%\^\&\*\(\)\_\+\=\[\]\{\}\;\:\'\"\\\|\<\>\/\?]', ' ', color_clean)
    color_clean = re.sub(r'\s+', ' ', color_clean).strip()
    color_clean = re.sub(r'^\d+\s+', '', color_clean)
    
    if color_clean:
        color_clean = color_clean[0].upper() + color_clean[1:]
    else:
        color_clean = "Под окраску"
        
    return model, collection, color_clean

def parse_volkhovets_options(name: str):
    import re
    name_lower = name.lower()
    
    # Opening options
    opening = None
    if "левое обратное" in name_lower or "левое обрат" in name_lower:
        opening = "Левое (обратное открывание)"
    elif "правое обратное" in name_lower or "правое обрат" in name_lower:
        opening = "Правое (обратное открывание)"
    elif "левое" in name_lower or " лев " in name_lower or " лев." in name_lower:
        opening = "Левое"
    elif "правое" in name_lower or " прав " in name_lower or " прав." in name_lower:
        opening = "Правое"
    elif "универсальное" in name_lower or "уни" in name_lower or "универс" in name_lower:
        opening = "Универсальное"
        
    # Hinges options
    hinges = None
    hinge_match = re.search(r'(\d+)\s+пет[лльеиу]', name_lower)
    if hinge_match:
        hinges = f"{hinge_match.group(1)} петли"
        
    # Prep options
    prep = None
    if "без врезки" in name_lower:
        prep = "Без врезки"
    elif "врезка тип 1" in name_lower or "вр. тип 1" in name_lower or "вр.тип 1" in name_lower or "вр тип 1" in name_lower or "тип 1" in name_lower:
        prep = "Под петли и замок (Тип 1)"
    elif "врезка тип 6" in name_lower or "вр. тип 6" in name_lower or "вр.тип 6" in name_lower or "вр тип 6" in name_lower or "тип 6" in name_lower:
        prep = "Под петли и замок (Тип 6)"
    elif "врезка тип 8" in name_lower or "вр. тип 8" in name_lower or "вр.тип 8" in name_lower or "вр тип 8" in name_lower or "тип 8" in name_lower:
        prep = "Под петли и замок (Тип 8)"
        
    return opening, hinges, prep


async def perform_sync(db: AsyncSession):
    # 1. Fetch from 1C (looping through all products)
    all_one_c_items = []
    skip = 0
    batch_size = 1000
    
    while True:
        items = await one_c_service.fetch_nomenclatura(top=batch_size, skip=skip, is_folder=False)
        if not items:
            break
        all_one_c_items.extend(items)
        skip += batch_size
        if len(items) < batch_size:
            break
            
    one_c_prices = await one_c_service.fetch_prices()
    one_c_outlet_prices = await one_c_service.fetch_prices(price_type_uuid="091cf19f-c9e5-11f0-8c60-ed99052a37f1")
    one_c_wholesale_prices = await one_c_service.fetch_prices(price_type_uuid="e4337751-af0a-11f0-8c5e-a6abec9b25d5")
    one_c_stocks = await one_c_service.fetch_stock()
    one_c_warehouses = await one_c_service.fetch_warehouses()
    
    # 2. Create maps
    price_map = {p["Номенклатура_Key"]: p["Цена"] for p in one_c_prices}
    outlet_price_map = {p["Номенклатура_Key"]: p["Цена"] for p in one_c_outlet_prices}
    wholesale_price_map = {p["Номенклатура_Key"]: p["Цена"] for p in one_c_wholesale_prices}
    
    # Exclude defective, showroom, office, and marketing warehouses
    excluded_warehouse_keys = set()
    for wh in one_c_warehouses:
        name = wh.get("Description", "").lower()
        if any(x in name for x in ["брак", "витрин", "ветрин", "офис", "маркетинг"]):
            excluded_warehouse_keys.add(wh.get("Ref_Key"))
            
    stock_map = {}
    for s in one_c_stocks:
        nom_key = s.get("Номенклатура_Key")
        wh_key = s.get("Склад_Key")
        bal = s.get("ВНаличииBalance", 0) or 0
        if wh_key in excluded_warehouse_keys:
            continue
        stock_map[nom_key] = stock_map.get(nom_key, 0) + bal
    
    # 3. Create category map (ref_key -> id)
    db_categories = await category_crud.get_multi(db, limit=1000)
    cat_map = {c.ref_key: c.id for c in db_categories}
    cat_name_map = {c.name.upper(): c.id for c in db_categories if c.name}
    
    # Build category ancestor mappings to get default brand/country from lineage
    cat_by_id = {c.id: c for c in db_categories}
    cat_defaults = {}
    for c in db_categories:
        curr = c
        brand, country = None, None
        visited = set()
        while curr and curr.id not in visited:
            visited.add(curr.id)
            curr_name_lower = curr.name.lower()
            for kw, (b, co) in BRANDS_MAP.items():
                if kw in curr_name_lower:
                    brand = b
                    country = co
                    break
            if brand:
                break
            curr = cat_by_id.get(curr.parent_id) if curr.parent_id else None
        cat_defaults[c.id] = (brand, country)
    
    # 4. Fetch all existing products from the database for in-memory mapping
    from sqlalchemy.future import select
    from app.models.product import Product as ProductModel
    db_products_res = await db.execute(select(ProductModel))
    db_products = db_products_res.scalars().all()
    product_map = {p.ref_key: p for p in db_products if p.ref_key}
    
    # Build name-based category matching list (sorted by name length DESC for specificity)
    # This allows "Aurum Dolce 8мм..." to match "Aurum Dolce" before "Kronopol"
    cat_name_match_list = []
    cat_by_id_sync = {c.id: c for c in db_categories}
    for c in db_categories:
        if c.name and c.name.strip():
            clean_name = c.name.strip()
            cat_name_match_list.append((clean_name.upper(), c.id, len(clean_name)))
    # Sort by length descending (most specific first)
    cat_name_match_list.sort(key=lambda x: -x[2])
    
    # Categories to skip during name matching (too generic)
    skip_cat_names = {'ЛАМИНАТ', 'ПАРКЕТ', 'ПЛИНТУС', 'ДВЕРИ', 'РУЧКИ', 'ПАРКЕТНАЯ ДОСКА',
                      'ПОДЛОЖКА ПОД ПАРКЕТ И ЛАМИНАТ', 'ПОДЛОЖКА ПОД ПАРКЕТ И ЛАМИНАТ ',
                      'ДЕКОРАТИВНЫЕ НАСТЕННЫЕ ДЕКОРЫ', 'SPС', 'OSB', 'ПОРОГИ', ' ПОРОГИ',
                      'КОВРОВЫЕ ПЛИТКИ', 'КОВРОВЫЕ ПЛИТКИ '}
    
    # Build synonym-based mapping: keyword -> category_id
    # This maps Russian product names to their category IDs
    synonym_map = {}
    for c in db_categories:
        cname = (c.name or "").strip().upper()
        cid = c.id
        # Add the category name itself as a keyword
        if cname and cname not in skip_cat_names and len(cname) >= 3:
            synonym_map[cname] = cid
    
    # Add Russian->Latin synonyms (Kronotex product lines have Russian names in 1C)
    # Map: keyword in product name -> category_id
    # We'll build this from known patterns
    russian_synonyms = {
        # Kronotex lines
        'ЭКСКЮСИТ ПЛЮС': None,    # -> Exquiusite+
        'ЭКСКЬЮЗИТ ПЛЮС': None,   # -> Exquiusite+
        'ЭКСКЮСИТ ПДЮС': None,    # -> Exquiusite+ (typo in 1C)
        'ЭКСКЮСИТ': None,          # -> Exquiusite
        'ЭКСКЬЮЗИТ': None,         # -> Exquiusite
        'АМАЗОН': None,            # -> Amazone
        'МАММУТ ПЛЮС': None,       # -> Mammut+  (check if exists)
        'МАММУТ': None,            # -> Mammut
        'ХЕРРИНГБОН': None,        # -> Herringbone
        'МАЙ КАСТЛ': None,        # -> My Castle
        'МЕГА': None,              # -> Mega+
        'КЭТУОЛК': None,          # -> Catwalk
        'РАБУСТО': None,          # -> Robusto
        'РОБУСТО': None,          # -> Robusto
    }
    
    # Resolve synonym targets by matching to actual category names
    for c in db_categories:
        cname_upper = (c.name or "").strip().upper()
        if 'EXQUIUSITE+' in cname_upper or 'EXQUIUSITE PLUS' in cname_upper or cname_upper == 'EXQUIUSITE+':
            russian_synonyms['ЭКСКЮСИТ ПЛЮС'] = c.id
            russian_synonyms['ЭКСКЬЮЗИТ ПЛЮС'] = c.id
            russian_synonyms['ЭКСКЮСИТ ПДЮС'] = c.id
        elif 'EXQUIUSITE' in cname_upper and '+' not in cname_upper:
            russian_synonyms['ЭКСКЮСИТ'] = c.id
            russian_synonyms['ЭКСКЬЮЗИТ'] = c.id
        elif cname_upper == 'AMAZONE':
            russian_synonyms['АМАЗОН'] = c.id
        elif 'MAMMUT' in cname_upper and '+' in cname_upper:
            russian_synonyms['МАММУТ ПЛЮС'] = c.id
        elif 'MAMMUT' in cname_upper and '+' not in cname_upper and 'PLUS' not in cname_upper:
            russian_synonyms['МАММУТ'] = c.id
        elif cname_upper == 'HERRINGBONE (АНГЛ ЕЛКА)' or cname_upper == 'HERRINGBONE':
            russian_synonyms['ХЕРРИНГБОН'] = c.id
        elif 'MY CASTLE' in cname_upper:
            russian_synonyms['МАЙ КАСТЛ'] = c.id
        elif cname_upper == 'MEGA+' or cname_upper == 'MEGA':
            russian_synonyms['МЕГА'] = c.id
        elif cname_upper == 'CATWALK':
            russian_synonyms['КЭТУОЛК'] = c.id
        elif cname_upper == 'ROBUSTO':
            russian_synonyms['РАБУСТО'] = c.id
            russian_synonyms['РОБУСТО'] = c.id
        # Single-keyword partial matches (category name is longer than the keyword in product name)
        elif 'MAGISTER' in cname_upper:
            russian_synonyms['MAGISTER'] = c.id  # "Magister Aqua Lock" matches product "...Magister 7086..."
        elif 'ENIGMA' in cname_upper and 'PLATINIUM' in cname_upper:
            russian_synonyms['ENIGMA'] = c.id  # "Platinium Enigma Aqua Block" matches product "Enigma 8мм..."
    
    # Remove unresolved synonyms
    russian_synonyms = {k: v for k, v in russian_synonyms.items() if v is not None}
    # Sort by length descending (most specific first, e.g. "ЭКСКЮСИТ ПЛЮС" before "ЭКСКЮСИТ")
    sorted_synonyms = sorted(russian_synonyms.items(), key=lambda x: -len(x[0]))
    
    # Article prefix mapping for EGGER products
    # EPL = EGGER Pro Laminate, EBL = EGGER Basic Laminate
    egger_article_prefixes = {}
    for c in db_categories:
        cname_upper = (c.name or "").strip().upper()
        if 'EGGER' in cname_upper and 'HOME' in cname_upper:
            egger_article_prefixes['EPL'] = c.id  # EGGER home is the main EPL category
        elif 'EGGER' in cname_upper and 'BASIC' in cname_upper:
            egger_article_prefixes['EBL'] = c.id
        elif 'EGGER' in cname_upper and 'PRO' in cname_upper and c.parent_id and not any(
            cc.parent_id == c.id for cc in db_categories
        ):
            # Leaf EGGER Pro category
            pass
    
    # Find main Laminate category ID for last-resort fallback
    laminate_cat_id = None
    for c in db_categories:
        if (c.name or "").strip().upper() == 'ЛАМИНАТ' and not c.parent_id:
            laminate_cat_id = c.id
            break
    
    synced_count = 0
    for item in all_one_c_items:
        ref_key = item.get("Ref_Key")
        name = item.get("НаименованиеПолное") or item.get("Description")
        sku = item.get("Артикул")
        parent_key = item.get("Parent_Key")
        image_key = item.get("ФайлКартинки_Key")
        
        price = price_map.get(ref_key, 0)
        price_outlet = outlet_price_map.get(ref_key, None)
        # If outlet price is 0 or matches standard retail, we can set it to None or o_price
        if price_outlet == 0 or price_outlet == price:
            price_outlet = None
            
        # Outlet wholesale (USD converted to UZS at 13,000 rate)
        price_outlet_usd = wholesale_price_map.get(ref_key, None)
        price_outlet_wholesale = None
        if price_outlet_usd is not None and price_outlet_usd > 0:
            price_outlet_wholesale = price_outlet_usd * 13000.0
        else:
            price_outlet_usd = None
            
        stock = max(0.0, stock_map.get(ref_key, 0))
        category_id = cat_map.get(parent_key)
        
        # Override for EGGER products: map to leaf categories instead of generic categories 101/397 or None
        name_upper = (name or "").upper()
        sku_upper = (sku or "").upper()
        desc_val = item.get("Описание") or ""
        desc_upper = desc_val.upper()
        
        is_egger = (
            "EGGER" in name_upper or "EGER" in name_upper or 
            "EGGER" in desc_upper or "EGER" in desc_upper or
            sku_upper.startswith("EPL") or sku_upper.startswith("EHL") or 
            sku_upper.startswith("EBL") or sku_upper.startswith("EL") or
            " lp_8mm_34kl_faska_el" in (" " + sku_upper.lower())
        )
        
        if is_egger or category_id in (101, 397):
            # Rule 1: EverSense (category ID 370)
            if "EVERSENSE" in name_upper or "EVERSENSE" in desc_upper or sku_upper.startswith("EL") or "EL10" in sku_upper or "EL21" in sku_upper or "EL750" in sku_upper or " lp_8mm_34kl_faska_el" in (" " + sku_upper.lower()):
                category_id = 370
            # Rule 2: Basic (category ID 102)
            elif "EBL" in sku_upper or "BASIC" in name_upper or "BASIC" in desc_upper:
                category_id = 102
            # Rule 3: EGGER Home (category ID 397)
            elif "EHL" in sku_upper or "EGGER HOME" in desc_upper or "EGER HOME" in desc_upper:
                category_id = 397
            # Rule 4: EGGER Pro (EPL)
            elif "EPL" in sku_upper or "EGGER PRO" in desc_upper or "EGER PRO" in desc_upper:
                is_aqua = "AQUA" in name_upper or "AQUA" in desc_upper or "АКВА" in name_upper or "АКВА" in desc_upper or "AKVA" in name_upper or "AKVA" in desc_upper
                is_large = "LARGE" in name_upper or "LARGE" in desc_upper or "ЛАРДЖ" in name_upper or "ЛАРДЖ" in desc_upper or "ЛАДЖ" in name_upper or "ЛАДЖ" in desc_upper
                
                if is_aqua:
                    if is_large:
                        category_id = 103  # Large Aqua
                    else:
                        category_id = 105  # Classic Aqua
                else:
                    if is_large:
                        category_id = 106  # Large
                    else:
                        category_id = 104  # Classic
            else:
                if not category_id or category_id == 101:
                    category_id = 397
        
        is_handle_or_fitting = any(kw in name_upper for kw in [
            'РУЧК', 'РУЧКА', 'РУЧКИ', 'ПЕТЛИ', 'ОГРАНИЧИТЕЛ', 'ЗАВЕРТК', 'ПЕТЛЯ'
        ])
        has_sp_prefix = any(kw in name_upper for kw in ['SP51', 'SP57', 'SP64', 'SP66', 'SP63', 'SP67'])

        # Override for Door products: map to specific leaf collections instead of Zadoor or None
        is_door = any(kw in name_upper for kw in [
            'ПОЛОТНО', 'ДВЕРЬ', 'ДВЕРН', 'КОРОБ', 'НАЛИЧНИК', 'ДОБОР', 'СТОЕВ', 'ПРИТВОРН',
            'ФАЛЬШ-ФРАМУГА', 'СТОЙКИ ДЛЯ ДВЕРЕЙ', 'ФРАМУГА', 'FILOMURO', 'КВАДРО', 
            'ВЕНЕЦИЯ', 'НЕАПОЛЬ', 'ТУРИН', 'ПОРТА', 'ZADOOR', 'PORTIKA', 'ВОЛХОВЕЦ', 'КВАЛИТЕТ', 'KVALITET',
            'КЛАССИКО', 'CLASSICO', 'НЕОКЛАССИКО', 'NEOCLASSICO'
        ])
        is_flooring_sample = any(kw in name_upper for kw in [
            'ЩИТ РЕКЛ', 'ПЛАНШЕТ РЕКЛАМНЫЙ', 'СТЕНД TAR', 'СТЕНД SWISS', 'СТЕНД KRONO', 
            'СТЕНД AGT', 'СТЕНД JB', 'СТЕНД EGGER', 'КАТАЛОГ ПАРКЕТА', 'ОБРАЗЦЫ TAR', 'ОБРАЗЦЫ COS'
        ])
        is_door = (is_door or has_sp_prefix) and not is_flooring_sample and not is_handle_or_fitting
        is_volkhovets = is_door and (
            "ВОЛХОВЕЦ" in name_upper or 
            "VOLKHOVETS" in name_upper or 
            (category_id and category_id in [329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 349, 350, 353])
        )

        if is_door and (not category_id or category_id in (174, 176, 323, 328, 357)):
            import re
            # Extract any 3 or 4 digit model number from the name, excluding common dimensions
            model_match = re.search(r'(?:ПОЛОТНО ДВ\.|ПОЛОТНО)\s+(\d{3,4})', name_upper)
            if model_match:
                model_num = model_match.group(1)
            else:
                model_num = ""
                for num in re.findall(r'\b\d{3,4}\b', name_upper):
                    if num not in ("600", "700", "800", "900", "2000", "2100", "2200", "2300", "2400", "2600", "1000", "1500", "1600"):
                        model_num = num
                        break
            
            v_cat_id = None
            
            if "PLANUM PRO" in name_upper:
                v_cat_id = 330
                is_volkhovets = True
            elif "WALL DOOR" in name_upper or "WALL-DOOR" in name_upper:
                v_cat_id = 353
                is_volkhovets = True
            elif "PLANUM" in name_upper and model_num in ("0010", "0015", "0020"):
                v_cat_id = 346
                is_volkhovets = True
            # Rocca (ID 337)
            elif "ROCCA" in name_upper or (model_num and model_num.startswith("83")):
                v_cat_id = 337
                is_volkhovets = True
            # Antique (ID 335)
            elif "ANTIQUE" in name_upper or (model_num and (model_num.startswith("73") or model_num.startswith("71"))):
                v_cat_id = 335
                is_volkhovets = True
            # Mascot (ID 334)
            elif "MASCOT" in name_upper or (model_num and model_num.startswith("84")):
                v_cat_id = 334
                is_volkhovets = True
            # Esse (ID 332)
            elif "ESSE" in name_upper or (model_num and model_num.startswith("85")):
                v_cat_id = 332
                is_volkhovets = True
            # Neo Classic (ID 344)
            elif "NEO CLASSIC" in name_upper or "NEOCLASSICO" in name_upper or model_num == "8003":
                v_cat_id = 344
                is_volkhovets = True
            # Linea (ID 342)
            elif "LINEA" in name_upper or model_num == "8059":
                v_cat_id = 342
                is_volkhovets = True
            # Charm (ID 350)
            elif "CHARM" in name_upper or (model_num and model_num.startswith("80")) or model_num == "6711":
                v_cat_id = 350
                is_volkhovets = True
            # Ego (ID 341)
            elif "EGO" in name_upper or model_num == "6123":
                v_cat_id = 341
                is_volkhovets = True
            # Toscana (ID 329)
            elif "TOSCANA" in name_upper or "PALAZZO" in name_upper or "PLANO" in name_upper or "GRIGLIATO" in name_upper or "LITERA" in name_upper or (model_num and (model_num.startswith("63") or model_num.startswith("68"))):
                v_cat_id = 329
                is_volkhovets = True
            # Imperial (ID 338)
            elif "IMPERIAL" in name_upper or model_num == "6503":
                v_cat_id = 338
                is_volkhovets = True
            # Formato (ID 333)
            elif "FORMATO" in name_upper or (model_num and model_num.startswith("040")):
                v_cat_id = 333
                is_volkhovets = True
            # Freedom (ID 336)
            elif "FREEDOM" in name_upper or (model_num and (model_num.startswith("42") or model_num.startswith("77"))):
                v_cat_id = 336
                is_volkhovets = True
            # Lignum (ID 339)
            elif "LIGNUM" in name_upper or (model_num and model_num.startswith("07")):
                v_cat_id = 339
                is_volkhovets = True
            # Velvet (ID 347)
            elif "VELVET" in name_upper or (model_num and model_num.startswith("82")):
                v_cat_id = 347
                is_volkhovets = True
            # Rift (ID 343)
            elif "RIFT" in name_upper or (model_num and model_num.startswith("02")):
                v_cat_id = 343
                is_volkhovets = True
            # Paris (ID 331)
            elif "PARIS" in name_upper or (model_num and model_num.startswith("81")):
                v_cat_id = 331
                is_volkhovets = True
            # Galant (ID 345)
            elif "GALANT" in name_upper or (model_num and model_num.startswith("14")):
                v_cat_id = 345
                is_volkhovets = True
            # Neo (ID 340)
            elif "NEO" in name_upper or (model_num and model_num.startswith("21")):
                v_cat_id = 340
                is_volkhovets = True
            # Centro (ID 349)
            elif "CENTRO" in name_upper or (model_num and model_num.startswith("25")):
                v_cat_id = 349
                is_volkhovets = True
            # Planum (ID 346)
            elif "PLANUM" in name_upper or model_num in ("0010", "0015", "0020"):
                v_cat_id = 346
                is_volkhovets = True
            # Generic/Fallback Волховец
            elif "ВОЛХОВЕЦ" in name_upper or "VOLKHOVETS" in name_upper:
                v_cat_id = 464
                is_volkhovets = True
                
            if is_volkhovets:
                category_id = v_cat_id
            else:
                # Zadoor / Portika / other doors rules
                zadoor_fallback_id = cat_map.get("14b504b0-4609-11ed-aa23-505dac4282cc") or cat_map.get("906172ca-5fd0-11ec-a9fd-505dac4282cc") or 449
                portika_fallback_id = cat_map.get("b779d45d-727f-11ef-8c32-c42dcda0bdba") or cat_map.get("a9fac7e2-727f-11ef-8c32-c42dcda0bdba") or 426
                is_portika = (
                    "PORTIKA" in name_upper or "ПОРТИКА" in name_upper or 
                    "ПОРТА-" in name_upper or "ПОРТА " in name_upper or "PORTA" in name_upper or
                    "КЛАССИКО" in name_upper or "CLASSICO" in name_upper or
                    "НЕОКЛАССИКО" in name_upper or "NEOCLASSICO" in name_upper
                )
                
                if is_portika:
                    if "INVISIBLE" in name_upper:
                        category_id = cat_map.get("966f0549-b3b9-11ef-8c33-ac5a3889fd1c") or portika_fallback_id
                    elif "НЕОКЛАССИКО" in name_upper or "NEOCLASSICO" in name_upper:
                        category_id = cat_map.get("f9769a49-8889-11ef-8c32-c42dcda0bdba") or portika_fallback_id
                    elif "КЛАССИКО" in name_upper or "CLASSICO" in name_upper:
                        category_id = cat_map.get("0af9ee79-7280-11ef-8c32-c42dcda0bdba") or portika_fallback_id
                    elif "ПОРТА" in name_upper or "PORTA" in name_upper:
                        category_id = cat_map.get("1388b45a-8889-11ef-8c32-c42dcda0bdba") or portika_fallback_id
                    else:
                        category_id = cat_map.get("b779d45d-727f-11ef-8c32-c42dcda0bdba") or cat_map.get("a9fac7e2-727f-11ef-8c32-c42dcda0bdba") or portika_fallback_id
                elif "FILOMURO" in name_upper or "ELEN" in name_upper:
                    category_id = cat_map.get("30e0b783-357a-11ed-aa22-505dac4282cc") or zadoor_fallback_id
                elif "BAGUETTE" in name_upper or "БАГЕТ" in name_upper:
                    category_id = cat_map.get("127131ea-357a-11ed-aa22-505dac4282cc") or zadoor_fallback_id
                elif "HORIZONT" in name_upper:
                    category_id = cat_map.get("ad5af5a0-a771-11ec-aa0b-505dac4282cc") or zadoor_fallback_id
                elif "LEGNO" in name_upper:
                    category_id = cat_map.get("d8d1d84b-be18-11f0-8c5f-c63bcafa6d19") or zadoor_fallback_id
                elif "ART LITE" in name_upper or "ART-LITE" in name_upper:
                    category_id = cat_map.get("e3fa7cb9-3579-11ed-aa22-505dac4282cc") or zadoor_fallback_id
                elif "ART CLASSIC" in name_upper or "ART-CLASSIC" in name_upper or "ARTКЛАССИК" in name_upper or "АРТКЛАССИК" in name_upper:
                    category_id = cat_map.get("de8dc177-980f-11ee-8c27-c862deca6261") or zadoor_fallback_id
                elif "FORMA" in name_upper:
                    category_id = cat_map.get("52eaeb61-357a-11ed-aa22-505dac4282cc") or zadoor_fallback_id
                elif "ZADOOR-S CLASSIC" in name_upper or "S CLASSIC" in name_upper or "S-CLASSIC" in name_upper or "ВЕНЕЦИЯ" in name_upper or "VENICE" in name_upper or "НЕАПОЛЬ" in name_upper or "NEAPOL" in name_upper or "ТУРИН" in name_upper or "TURIN" in name_upper:
                    category_id = cat_map.get("00a290f8-5fd6-11ec-a9fd-505dac4282cc") or zadoor_fallback_id
                elif "SK" in name_upper:
                    category_id = cat_map.get("3f75b95b-d29e-11ed-aa29-505dac4282cc") or zadoor_fallback_id
                elif "SP51" in name_upper or "SP57" in name_upper or "SP64" in name_upper or "SP66" in name_upper or "SP63" in name_upper or "SP67" in name_upper or "SP" in name_upper:
                    category_id = cat_map.get("11e6fc9e-a4f0-11ec-aa0b-505dac4282cc") or zadoor_fallback_id
                elif "SENSE" in name_upper:
                    category_id = cat_map.get("9e9b49e0-be1b-11f0-8c5f-c63bcafa6d19") or zadoor_fallback_id
                elif "ZADOOR-S" in name_upper or "ZADOOR S" in name_upper or "S-" in name_upper or "S -" in name_upper or "S2" in name_upper:
                    category_id = cat_map.get("e679f9c3-904b-11ef-8c32-c42dcda0bdba") or zadoor_fallback_id
                elif "КВАЛИТЕТ" in name_upper or "TOPAN" in name_upper or "TOPPAN" in name_upper or "KVALITET" in name_upper:
                    category_id = cat_map.get("7fd24a38-357a-11ed-aa22-505dac4282cc") or zadoor_fallback_id
                elif "ЗАКАЗ" in name_upper:
                    category_id = cat_map.get("d771779e-2166-11ee-8c1f-81d2968293f9") or zadoor_fallback_id
                else:
                    category_id = cat_map.get("14b504b0-4609-11ed-aa23-505dac4282cc") or cat_map.get("906172ca-5fd0-11ec-a9fd-505dac4282cc") or zadoor_fallback_id

        if not category_id:
            # 0.5 Swiss Krono & Bosco & Kronopol keyword overrides
            if 'CASPIAN' in name_upper:
                category_id = 318
            elif 'ECOLOGIK' in name_upper:
                category_id = 319
            elif 'FANAT' in name_upper:
                category_id = 320
            elif 'SYNCHROPOLIS' in name_upper:
                category_id = 407
            elif 'ARTO' in name_upper:
                category_id = 65
            elif 'BOSCO' in name_upper:
                category_id = 131
            elif 'GROTESK' in name_upper:
                category_id = 371
            elif 'COMPLIMENT' in name_upper:
                category_id = 386
            elif 'HOMESTANDART' in name_upper or 'HOMESTANDARD' in name_upper:
                category_id = 387
            elif 'BIOM' in name_upper:
                # Exclude Biomio floor cleaning agent
                if 'BIOMIO' not in name_upper and 'СРЕДСТВО' not in name_upper:
                    category_id = 401
            elif 'MAGISTER' in name_upper:
                category_id = 321
            elif 'INFINITY' in name_upper:
                category_id = 392
            elif 'VOLO' in name_upper:
                category_id = 393
            elif 'HERRINGBONE' in name_upper and 'ХЕРРИНГБОН' not in name_upper:
                category_id = 358
            elif 'WPC' in name_upper:
                category_id = 399
            elif 'STIMUL' in name_upper:
                category_id = 377
            
            # 0.7 Specific handles and thresholds mapping (runs before general name matching to avoid false name hits like Arbiton "VEGA" plinths)
            if any(kw in name_upper for kw in ['Д.РУЧКА', 'ДВЕРНАЯ РУЧКА', 'РУЧК', 'РУЧКА', 'РУЧКИ']):
                system_models = {
                    'PIXAR': 144, 'AXEL': 145, 'AGATE': 146, 'MIMAS': 147, 'METIS': 148,
                    'CONCORDIA': 149, 'SARP': 150, 'MARVEL': 151, 'AKIK': 152, 'DESPINA': 155,
                    'ODIN': 156, 'ZETTA': 157, 'GAMMA': 158, 'VEGA': 159, 'SINUS': 160,
                    'ROCCA': 161, 'PRIZMA': 162, 'RODIN': 163, 'ROCKET': 164, 'SPINAL': 165,
                    'MAJA': 166, 'CARME': 167, 'LINEAR': 168, 'STARK': 169, 'JASPER': 170,
                    'VISION': 171, 'LIBRA': 172
                }
                model_cid = None
                for model_kw, cid in system_models.items():
                    if model_kw in name_upper:
                        model_cid = cid
                        break
                category_id = model_cid or cat_name_map.get('РУЧКИ SYSTEM') or cat_name_map.get('РУЧКИ')
            elif any(kw in name_upper for kw in ['СТЫК', 'УГОЛ', 'КАНТ ', 'ПОРОГ', 'ПОР0', 'КРЕПЕЖ']):
                if 'КАНТ' in name_upper and 'ПОЛУК' in name_upper:
                    if '0,9' in name_upper or '0.9' in name_upper:
                        category_id = 219
                    elif '1,8' in name_upper or '1.8' in name_upper:
                        category_id = 220
                elif 'КРЕПЕЖ' in name_upper and ('2,7' in name_upper or '2.7' in name_upper):
                    category_id = 222
                elif 'СТЫК' in name_upper and 'Т-ОБРАЗН' in name_upper and '20' in name_upper:
                    if '0,9' in name_upper or '0.9' in name_upper:
                        category_id = 230
                elif 'УГОЛ' in name_upper and '25' in name_upper:
                    if '0,9' in name_upper or '0.9' in name_upper:
                        category_id = 233
                    elif '1,8' in name_upper or '1.8' in name_upper:
                        category_id = 234
                
                if not category_id:
                    category_id = cat_name_map.get('РУССКИЙ ПРОФИЛЬ') or cat_name_map.get(' ПОРОГИ')

            # 1. Try Russian synonym matching first (most specific first)
            if not category_id:
                for syn_keyword, syn_cat_id in sorted_synonyms:
                    if syn_keyword in name_upper:
                        category_id = syn_cat_id
                        break
            
            # 2. Try comprehensive name-based matching (most specific category name first)
            if not category_id:
                for cat_name_upper, cat_id, cat_len in cat_name_match_list:
                    if cat_name_upper in skip_cat_names:
                        continue
                    if cat_len < 3:  # Skip very short names to avoid false matches
                        continue
                    if cat_name_upper in name_upper:
                        category_id = cat_id
                        break
            
            # 3. Article prefix matching for EGGER (EPL/EBL codes)
            if not category_id:
                for prefix, prefix_cat_id in egger_article_prefixes.items():
                    if prefix in name_upper:
                        category_id = prefix_cat_id
                        break
            
            # 4. Fallback: Arbiton keywords
            if not category_id:
                arbiton_keywords = ['DIAMOND', 'INDO', 'INTEGRA', 'STIQ', 'VEGA', 'VIGO']
                for kw in arbiton_keywords:
                    if kw in name_upper:
                        category_id = cat_name_map.get(kw)
                        break
            
            # 5. Fallback: Silk Road / Silkwood products
            if not category_id:
                silk_keywords = ['SILKWOOD', 'SILK ROAD', 'SILKROAD', 'СИЛК РОУД', 'ШЕЛКОВЫЙ ПУТЬ']
                if any(skw in name_upper for skw in silk_keywords):
                    for cat_name, cat_id in cat_name_map.items():
                        if any(skw in cat_name for skw in silk_keywords):
                            category_id = cat_id
                            break
                    if not category_id:
                        category_id = 359
            
            # 6. Keyword-based fallback for uncategorized products
            if not category_id:
                # Build lookup helpers (once, but safe to rebuild each iteration since they're from db_categories)
                # These use cat_name_map which was built earlier
                
                # --- Doors & Door Leaves ---
                # "Порта" -> Двери Portika
                if any(kw in name_upper for kw in ['ПОРТА-', 'ПОРТА ']):
                    category_id = cat_name_map.get('ДВЕРИ PORTIKA') or cat_name_map.get('ДВЕРИ')
                # "Filomuro" / "Elen ПГ" -> Скрытые двери Filomuro
                elif 'FILOMURO' in name_upper:
                    category_id = cat_name_map.get('СКРЫТЫЕ ДВЕРИ FILOMURO ZADOOR') or cat_name_map.get('ДВЕРИ ZADOOR')
                # "SP57" -> ZADOOR SP57
                elif 'SP57' in name_upper:
                    for cn, cid in cat_name_map.items():
                        if 'SP57' in cn:
                            category_id = cid
                            break
                elif 'SP51' in name_upper:
                    for cn, cid in cat_name_map.items():
                        if 'SP51' in cn:
                            category_id = cid
                            break
                elif 'SP66' in name_upper:
                    for cn, cid in cat_name_map.items():
                        if 'SP66' in cn:
                            category_id = cid
                            break
                elif 'SP64' in name_upper:
                    for cn, cid in cat_name_map.items():
                        if 'SP64' in cn:
                            category_id = cid
                            break
                # "Коробка" / "Наличник" / "Доборный" / "Полотно" / "Стоевая" / "Притворная" -> Двери ZADOOR (accessories/leaves)
                elif any(kw in name_upper for kw in ['КОРОБКА', 'НАЛИЧНИК', 'ДОБОРНЫЙ', 'ПОЛОТНО', 'СТОЕВ', 'ПРИТВОРН', 'НЕОКЛАССИКО', 'NEOCLASSICO', 'НЕАПОЛЬ', 'ФАЛЬШ-ФРАМУГА', 'СТОЙКИ ДЛЯ ДВЕРЕЙ', 'ФРАМУГА']):
                    category_id = cat_name_map.get('ДВЕРИ ZADOOR') or cat_name_map.get('ДВЕРИ')
                # --- Underlay ---
                elif 'ПОДЛОЖКА' in name_upper:
                    if 'ПРОБКА' in name_upper or 'ПРОБКОВ' in name_upper:
                        category_id = 215  # Подложка под паркет и ламинат Экопробка
                    else:
                        category_id = 126  # SOLID underlayment
                
                # --- OSB ---
                elif 'OSB' in name_upper:
                    category_id = cat_name_map.get('OSB')
                
                # --- Parquet boards ---
                elif 'ДОСКА ПАРКЕТНАЯ' in name_upper or 'ПАРКЕТНАЯ ДОСКА' in name_upper:
                    if 'TARWOOD' in name_upper or 'ТАРВУД' in name_upper:
                        category_id = 112
                    else:
                        category_id = 406
                    
                # --- Explicit Zadoor / Art Lite mapping ---
                elif 'ART-LITE' in name_upper or 'ART LITE' in name_upper:
                    category_id = 451 # Полотна Art Lite
                elif 'ART CLASSIC' in name_upper or 'ART-CLASSIC' in name_upper:
                    category_id = 450 # Полотна Art Classic
                elif 'CLASSIC BAGUETTE' in name_upper:
                    category_id = 452 # Полотна Classic Baguette
                elif 'ZADOOR-S CLASSIC' in name_upper or 'ZADOOR S CLASSIC' in name_upper:
                    category_id = 461 # Полотна Zadoor-S Classic
                elif 'ZADOOR' in name_upper:
                    category_id = 449 # Полотна Zadoor
                elif 'KRONOPOL' in name_upper:
                    category_id = 362  # Kronopol
                elif 'KRONOTEX' in name_upper:
                    category_id = 64  # Kronotex
                elif 'KRONOSTAR' in name_upper or 'КРОНОСТАР' in name_upper:
                    category_id = 107
                # --- Plinths & Plinth Accessories ---
                elif any(kw in name_upper for kw in ['ПЛИНТУС', 'АНТИПЛИНТУС', 'Модель-L', 'MODEL-L', 'МОДЕЛ-L', 'МОДЕЛЬ L']):
                    category_id = cat_name_map.get('ПЛИНТУС')
                elif any(kw in name_upper for kw in ['ЗАГЛУШКА', 'СОЕД. ЭЛЕМЕНТ', 'СОЕДИНИТЕЛЬ', 'СОЕДЕНИТЕЛ', 'КЛИПСЫ', 'КРЕПЕЖ']) and any(kw2 in name_upper for kw2 in ['ПЛИНТУС', 'ARBITON', 'SOLID', 'UHD']):
                    category_id = cat_name_map.get('ПЛИНТУС') or cat_name_map.get('ARBITON')
                elif any(kw in name_upper for kw in ['ЗАГЛУШКА', 'СОЕД. ЭЛЕМЕНТ', 'СОЕДИНИТЕЛЬ', 'СОЕДЕНИТЕЛ']):
                    category_id = cat_name_map.get('ПЛИНТУС')
                elif 'УПЛОТНИТЕЛ' in name_upper:
                    category_id = cat_name_map.get('ДВЕРИ')
                    
                # --- AGT Decorative Wall Panels (LB & Frente series) ---
                elif any(kw in name_upper for kw in ['ФРЕНТЕ', 'FRENTE', 'ПАНЕЛЬ СТЕНОВАЯ']):
                    category_id = cat_name_map.get('FRENTE') or 398
                elif 'LB' in name_upper or 'SUPRAMAT' in name_upper:
                    for key, val in {
                        'LB-5014': 245, 'LB 5014': 245,
                        'LB-2050': 246, 'LB 2050': 246,
                        'LB-2200': 248, 'LB 2200': 248,
                        'LB-2250': 249, 'LB 2250': 249,
                        'LB-3771': 250, 'LB 3771': 250,
                        'LB-3783': 251, 'LB 3783': 251,
                        'LB-3786': 252, 'LB 3786': 252,
                        'LB-3821': 253, 'LB 3821': 253,
                    }.items():
                        if key in name_upper:
                            category_id = val
                            break
                    if not category_id and ('SUPRAMAT' in name_upper or 'GROUP LB' in name_upper or 'ГРУППА LB' in name_upper):
                        category_id = 244  # Parent: AGT Panels
                
                # --- Villeroy & Boch (V&B) ---
                elif 'V&B' in name_upper or 'VILLEROY' in name_upper:
                    if 'LOFT' in name_upper:
                        category_id = 120  # Loft under Euro Home
                    else:
                        category_id = 118  # Euro Home (main V&B container)
                
                # --- Kronofloor SPC ---
                elif 'KRONOFLOOR' in name_upper or 'КРОНОФЛОР' in name_upper or 'KRONO FLOOR' in name_upper:
                    category_id = 368  # Kronofloor
                elif 'SPC' in name_upper and any(city in name_upper for city in [
                    'АЛИКАНТЕ', 'АЛТЕЯ', 'КАРТАХЕНА', 'СЕВИЛЬЯ', 'АЛЬМЕРИЯ', 'ФЛАМЕНКА',
                    'ALICANTE', 'ALTEA', 'CARTAGENA', 'SEVILLA', 'ALMERIA', 'FLAMENCA'
                ]):
                    category_id = 368  # Kronofloor SPC
                
                # --- Showroom Stands & Samples by brand ---
                elif any(kw in name_upper for kw in ['СТЕНД', 'ЩИТ РЕКЛ', 'ЩИТ РЕКЛАМНЫЙ', 'ОБРАЗЕЦ']):
                    if 'KRONOPOL' in name_upper:
                        category_id = 80
                    elif any(k in name_upper for k in ['KRONOSTAR', 'КРОНОСТАР']):
                        category_id = 107
                    elif 'KRONOTEX' in name_upper:
                        category_id = 68
                    elif 'AGT' in name_upper:
                        category_id = 94
                    elif 'TARWOOD' in name_upper:
                        category_id = 112
                    elif 'COSWICK' in name_upper:
                        category_id = 406
                    elif any(k in name_upper for k in ['ПАРКЕТ', 'ДУБ', 'ОРЕХ']):
                        category_id = 406  # Coswick
            
            # --- Joss Beaumont decors mapping ---
            jb_decors = {
                # 1. Opus (ID 325)
                "ДЕКАРТ": 325,
                "ДЮРАС": 325,
                "ЖУЛЬ ВЕРН": 325,
                "КОЛЕТТ": 325,
                "ЛЕБЛАН": 325,
                # 2. Veritas (ID 374)
                "АРАГОН": 374,
                "ВЕРЛЕН": 374,
                "ГАЛУА": 374,
                "ЛАФАЙЕТ": 374,
                "МИРАБО": 374,
                "ПОТЬЕ": 374,
                "РАВАШОЛЬ": 374,
                # 3. Gusto (ID 110)
                "ГОЙЕР": 110,
                "ЖУРМАН": 110,
                "КАССИНИ": 110,
                "КИПИАНИ": 110,
                "ПАЛЕЙ": 110,
                "РОМАНОФФ": 110,
                "РОШЕФОР": 110,
                "ШЕЛИЯ": 110,
                # 4. Liberte (ID 324)
                "МАКАРОН": 324,
                "МИЛФЕЙ": 324,
                "ПРОФИТРОЛЬ": 324,
                "ШОДО": 324,
            }
            for decor_name, target_cat_id in jb_decors.items():
                if decor_name in name_upper:
                    category_id = target_cat_id
                    break
            
            # 7. Last resort: "ЛП" prefix -> general Laminate category
            if not category_id and name_upper.startswith('ЛП ') and laminate_cat_id:
                category_id = laminate_cat_id
        
        # Image placeholder logic (will be updated by CSV import)
        image_url = None
        if image_key and image_key != "00000000-0000-0000-0000-000000000000":
            image_url = f"https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200&auto=format&fit=crop"
        
        # Dynamic premium oak parquet placeholders for Silkwood
        if not image_url and name and any(skw in name.upper() for skw in ['SILKWOOD', 'SILK ROAD', 'SILKROAD', 'СИЛК РОУД']):
            silk_placeholders = [
                "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
            ]
            h_idx = abs(hash(name + (sku or ""))) % len(silk_placeholders)
            image_url = silk_placeholders[h_idx]
        
        c_brand, c_country = None, None
        if category_id and category_id in cat_defaults:
            c_brand, c_country = cat_defaults[category_id]
            
        parsed_brand, parsed_country, parsed_grade, parsed_thickness = parse_product_characteristics(
            name, c_brand, c_country
        )
        
        # Override for Tarwood brand and category
        is_tarwood = False
        name_upper = (name or "").upper()
        if "ДОСКА ПАРКЕТНАЯ 14" in name_upper or "ПАРКЕТНАЯ ДОСКА 14" in name_upper or "TARWOOD" in name_upper:
            is_tarwood = True
            category_id = 112
            parsed_brand = "Tarwood"
            parsed_country = "Беларусь"
            
            # Map image using DECOR_IMAGE_MAP
            decor_map = {
                "аляска": "tarwood-alyaska.webp",
                "арава": "tarwood-arava.webp",
                "балтик": "tarwood-baltik.jpg",
                "бронза": "tarwood-bronza.jpg",
                "бурбон": "tarwood-burbon.jpg",
                "экстра белый": "tarwood-ekstra-belyi.webp",
                "экстра соло": "tarwood-ekstra-solo.jpg",
                "копченый": "tarwood-kopchenyi.jpg",
                "корица": "tarwood-koritsa.jpg",
                "корсика": "tarwood-korsika.webp",
                "нежный песок": "tarwood-nezhnui-pesok.jpg",
                "орех": "tarwood-oreh.jpg",
                "оригинальный": "tarwood-original.jpg",
                "оригинал": "tarwood-original.jpg",
                "прованс": "tarwood-provans.jpg",
                "сатин": "tarwood-satin.jpg",
                "серый винтаж": "tarwood-seryi-vintazh.jpg",
                "шелк": "tarwood-shelk.jpg",
                "слоновая кость": "tarwood-slonovaya-kost.jpg",
                "cлоновая кость": "tarwood-slonovaya-kost.jpg",
                "слонавая кость": "tarwood-slonovaya-kost.jpg",
                "старый": "tarwood-staryi.jpg",
                "тавор": "tarwood-tavor.jpg",
                "темный шоколад": "tarwood-temnyi-shokolad.jpg",
                "жемчуг": "tarwood-zhemchug.jpg",
                "золотой": "tarwood-zolotoy.jpg"
            }
            decor_file = None
            for dec_name, filename in decor_map.items():
                if dec_name in name.lower():
                    decor_file = filename
                    break
            if decor_file:
                image_url = f"/images/products/tarwood/{decor_file}"

        # Override for Zadoor SP door image mapping
        is_sp_door = is_door and any(kw in name_upper for kw in ['SP51', 'SP57', 'SP64', 'SP66'])
        if is_sp_door:
            category_id = 459
            parsed_brand = "Zadoor"
            parsed_country = "Россия"
            
            # Map image using SP_DECOR_MAP
            sp_img_name = None
            if 'SP51' in name_upper:
                if 'БЕЛЕН' in name_upper:
                    sp_img_name = "sp51_sp_belennyy_dub.jpg"
                elif 'БРЕНД' in name_upper:
                    sp_img_name = "sp51_sp_brendi.jpg"
                elif 'СВЕТЛО-СЕР' in name_upper or 'СВЕТЛО СЕР' in name_upper:
                    sp_img_name = "sp51_sp_svetlo_seryy.jpg"
                elif 'НОРДИК' in name_upper:
                    sp_img_name = "sp51_sp_nordik.jpg"
            elif 'SP57' in name_upper:
                if 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
                    sp_img_name = "sp57_sp_temno_seryy_chernyy_lakobel.jpg"
                elif 'БЕТОН СВЕТ' in name_upper:
                    sp_img_name = "sp57_sp_beton_svetlyy_chernyy_lakobel.jpg"
                elif 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
                    sp_img_name = "sp57_sp_beton_temnyy_chernyy_lakobel.jpg"
                elif 'НОРДИК' in name_upper:
                    sp_img_name = "sp57_sp_nordik_chernyy_lakobel.jpg"
                elif 'ОРЕХ' in name_upper:
                    sp_img_name = "sp57_sp_orekh_karamel_chernyy_lakobel.jpg"
                elif 'СВЕТЛЫЙ Л' in name_upper or 'СВЕТЛЫЙЛ' in name_upper:
                    sp_img_name = "sp57_sp_svetlyy_len_chernyy_lakobel.jpg"
                elif 'ТЕМНЫЙ Л' in name_upper or 'ТЁМНЫЙ Л' in name_upper or 'ТЕМНЫЙЛ' in name_upper or 'ТЁМНЫЙЛ' in name_upper:
                    sp_img_name = "sp57_sp_tyomnyy_len_chernyy_lakobel.jpg"
                elif 'СКАНДИ' in name_upper:
                    sp_img_name = "sp57_sp_skandi_chernyy_lakobel.jpg"
            elif 'SP64' in name_upper:
                if 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
                    sp_img_name = "sp64_sp_beton_temnyy_chernyy_lakobel.jpg"
                elif 'НОРДИК САТ' in name_upper:
                    sp_img_name = "sp64_sp_nordik_satinato.jpg"
                elif 'НОРДИК Ч' in name_upper or 'НОРДИК' in name_upper:
                    sp_img_name = "sp64_sp_nordik_chernyy_lakobel.jpg"
                elif 'СКАНДИ САТ' in name_upper:
                    sp_img_name = "sp64_sp_skandi_satinato.jpg"
                elif 'СКАНДИ Ч' in name_upper or 'СКАНДИ' in name_upper:
                    sp_img_name = "sp64_sp_skandi_chernyy_lakobel.jpg"
                elif 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
                    sp_img_name = "sp64_sp_temno_seryy_chernyy_lakobel.jpg"
            elif 'SP66' in name_upper:
                if 'ТЕМНО-СЕР' in name_upper or 'ТЕМНО СЕР' in name_upper or 'ТЁМНО-СЕР' in name_upper or 'ТЁМНО СЕР' in name_upper:
                    sp_img_name = "sp66_sp_temno_seryy_chernyy_lakobel.jpg"
                elif 'ТЕМНЫЙ Л' in name_upper or 'ТЁМНЫЙ Л' in name_upper or 'ТЕМНЫЙЛ' in name_upper or 'ТЁМНЫЙЛ' in name_upper:
                    sp_img_name = "sp66_sp_temnyy_len_chernyy_lakobel.jpg"
                elif 'ЗЕРКАЛО' in name_upper:
                    sp_img_name = "sp66_sp_svetlyy_len_zerkalo_lyuks.jpg"
                elif 'БЕТОН СВЕТ' in name_upper:
                    sp_img_name = "sp66_sp_beton_svetlyy_chernyy_lakobel.jpg"
                elif 'БЕТОН ТЕМ' in name_upper or 'БЕТОН ТЁМ' in name_upper:
                    sp_img_name = "sp66_sp_beton_temnyy_chernyy_lakobel.jpg"
                elif 'НОРДИК' in name_upper:
                    sp_img_name = "sp66_sp_nordik_chernyy_lakobel.jpg"
                elif 'СВЕТЛЫЙ Л' in name_upper or 'СВЕТЛЫЙЛ' in name_upper or 'СВЕТЛЫЙ ЛЕН' in name_upper:
                    sp_img_name = "sp66_sp_svetlyy_len_chernyy_lakobel.jpg"
                elif 'ОРЕХ' in name_upper:
                    sp_img_name = "sp66_sp_orekh_karamel_chernyy_lakobel.jpg"
                elif 'СВЕТЛО-СЕР' in name_upper or 'СВЕТЛО СЕР' in name_upper:
                    sp_img_name = "sp66_sp_svetlo_seryy_chernyy_lakobel.jpg"
                elif 'СКАНДИ' in name_upper:
                    sp_img_name = "sp66_sp_skandi_chernyy_lakobel.jpg"

            if sp_img_name:
                image_url = f"/static/uploads/doors/{sp_img_name}"
        else:
            is_sp_door = False

        # Override for Venice door image mapping during sync
        is_venice_door = is_door and "ВЕНЕЦИЯ" in name_upper and category_id == 452
        if is_venice_door:
            if "ПО" in name_upper and "В3" in name_upper:
                if "БЕЛ" in name_upper:
                    image_url = "/images/products/zadoor/7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg"
                elif "СЕР" in name_upper:
                    image_url = "/static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_15.jpg"
                elif "ГРАФИТ" in name_upper:
                    image_url = "/static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_13.jpg"
            elif "ПГ" in name_upper and "В3" in name_upper:
                if "БЕЛ" in name_upper:
                    image_url = "/static/uploads/doors/classic_baguette_венеция_пг_в3_белый_матовый_пг_image_1633783169_0.jpg"
                elif "СЕР" in name_upper:
                    image_url = "/static/uploads/doors/classic_baguette_венеция_пг_в3_серый_матовый_пг_image_1633783169_7.jpg"
                elif "ГРАФИТ" in name_upper:
                    image_url = "/static/uploads/doors/classic_baguette_венеция_пг_в3_графит_премьер_мат_пг_image_1633783169_6.jpg"

        # Override for Kvalitet Standart door image mapping during sync
        is_kvalitet_door = is_door and any(kw in name_upper for kw in ["КВАЛИТЕТ", "KVALITET"])
        if is_kvalitet_door:
            is_k11 = "К11" in name_upper or "K11" in name_upper
            is_k14 = "К14" in name_upper or "K14" in name_upper
            is_k15 = "К15" in name_upper or "K15" in name_upper
            is_k13 = "К13" in name_upper or "K13" in name_upper
            is_k17 = "К17" in name_upper or "K17" in name_upper
            is_k21 = "К21" in name_upper or "K21" in name_upper
            is_k10 = "К10" in name_upper or "K10" in name_upper
            is_k2 = "К2" in name_upper or "K2" in name_upper
            is_k7 = "К7" in name_upper or "K7" in name_upper
            is_k1 = "К1" in name_upper or "K1" in name_upper
            
            is_alu_black = "ALU BLACK" in name_upper
            
            kv_img = "kvalitet_k7_dub_naturalnyy_prodolnyy.jpg"
            if is_k11 and is_alu_black:
                kv_img = "kvalitet_k11_alu_black_seryy_poperechnyy.jpg"
            elif is_k11:
                if "СЕРЫЙ" in name_upper:
                    kv_img = "kvalitet_k11_topan_dub_seryy_poperechnyy.jpg"
                else:
                    kv_img = "kvalitet_k11_dub_naturalnyy_poperechnyy.jpg"
            elif is_k14:
                kv_img = "kvalitet_k14_alu_gold_grafit_premer_mat_mg.jpg"
            elif is_k15 or is_k13 or is_k17 or is_k21:
                kv_img = "kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg"
            elif is_k2:
                if "БЕЛЫЙ МАТОВЫЙ" in name_upper or "БЕЛЫЙ МАТ" in name_upper:
                    kv_img = "kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg"
                else:
                    kv_img = "kvalitet_k2_alu_black_dub_naturalnyy_prodolnyy.jpg"
            elif is_k7:
                if "БЕЛЫЙ МАТОВЫЙ" in name_upper or "БЕЛЫЙ МАТ" in name_upper:
                    kv_img = "kvalitet_k7_belyy_matovyy.jpg"
                elif "СЕРЫЙ" in name_upper:
                    kv_img = "kvalitet_k7_dub_seryy_prodolnyy.jpg"
                elif "ТЕМНЫЙ" in name_upper or "ТЁМНЫЙ" in name_upper:
                    kv_img = "kvalitet_k7_dub_temnyy_prodolnyy.jpg"
                elif "ОРЕХ" in name_upper:
                    kv_img = "kvalitet_k7_orekh_shokolad_prodolnyy.jpg"
                else:
                    kv_img = "kvalitet_k7_dub_naturalnyy_prodolnyy.jpg"
            else:
                if is_k10:
                    if "БЕЛЫЙ" in name_upper:
                        kv_img = "kvalitet_k7_belyy_matovyy.jpg"
                    else:
                        kv_img = "kvalitet_k15_alu_gold_molochnyy_matovyy_mg.jpg"
                elif is_k1:
                    kv_img = "kvalitet_k2_alu_black_belyy_matovyy_black_lacobel.jpg"
                    
            image_url = f"/static/uploads/doors/{kv_img}"

        # Override for Zadoor / Portika / Filomuro door image mapping during sync
        is_zadoor_portika = is_door and not is_sp_door and not is_kvalitet_door and not is_venice_door and not is_volkhovets and any(kw in name_upper for kw in ["ZADOOR", "PORTIKA", "FILOMURO", "НЕАПОЛЬ", "ТУРИН", "ВЕНЕЦИЯ", "КЛАССИКО", "НЕОКЛАССИКО", "ПОРТА"])
        if is_zadoor_portika:
            zadoor_img = None
            if 'НЕАПОЛЬ' in name_upper:
                if 'БЕЛ' in name_upper:
                    zadoor_img = '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'
                elif 'СЕР' in name_upper:
                    zadoor_img = '7rh5mmmplrzz0w7olc7lkkvoof388qt2.jpg'
                elif any(kw in name_upper for kw in ['ГРАФИТ', 'ДАРК', 'DARK']):
                    zadoor_img = 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg'
                elif any(kw in name_upper for kw in ['КРЕМ', 'ГОЛД', 'GOLD', 'МОЛОЧН', 'МИЛК']):
                    zadoor_img = 'pv0pfrvm3necldk8v7co9g7d3mz4k2sw.jpg'
                else:
                    zadoor_img = '2h1nq27n2oejjshepu01hom5mpmjdw1u.jpg'
            elif 'ВЕНЕЦИЯ' in name_upper:
                if 'БЕЛ' in name_upper:
                    zadoor_img = '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg'
                elif 'СЕР' in name_upper:
                    zadoor_img = 'l2s21af3ybv41jr3n48j60vj1ah8rbp9.jpg'
                elif any(kw in name_upper for kw in ['ГРАФИТ', 'ДАРК', 'DARK']):
                    zadoor_img = 'hxsocykii22kmksfyhm9u9g7w13cgf3b.jpg'
                elif any(kw in name_upper for kw in ['САТИНАТ', 'КРЕМ', 'ГОЛД', 'GOLD', 'МОЛОЧН', 'МИЛК']):
                    zadoor_img = '7fswt4d1xbzbo1cfe3eyjzxfe2q836wq.jpg'
                else:
                    zadoor_img = '0fg3rzn37qujzdhedjy6i3ytosyk4x30.jpg'
            elif 'ТУРИН' in name_upper:
                if 'СЕР' in name_upper:
                    zadoor_img = 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg'
                elif any(kw in name_upper for kw in ['КРЕМ', 'ГОЛД', 'GOLD', 'МОЛОЧН', 'МИЛК']):
                    zadoor_img = '8z0uzdhgqjreoa7ip7wdfd1uq6y2g3ag.jpg'
                elif any(kw in name_upper for kw in ['ГРАФИТ', 'ДАРК', 'DARK']):
                    zadoor_img = 'jxhxv89opoc758rq3uegwoh8whg0tws9.jpg'
                else:
                    zadoor_img = '47jyoz7ew91x4wihpac27cqmcivk2rrk.jpg'
            elif 'КОЛЛЕКЦИЯ S' in name_upper or 'ПОЛОТНА S ' in name_upper or 'ПОЛОТНА S2' in name_upper:
                if 'МОЛОЧН' in name_upper:
                    zadoor_img = '11t6utfvy0e2u9rf3o3k23p3nmghbfdh.jpg'
                elif 'ГРАФИТ' in name_upper:
                    zadoor_img = 'gjmri0q7e73g07lfk1l93mw4osnlx2i6.jpg'
                else:
                    zadoor_img = 'd1qkjre40mijnzwbani08bajxj0jtsur.jpg'
            elif 'НЕОКЛАССИКО' in name_upper:
                if '2' in name_upper and 'ICE' in name_upper and 'PRO' in name_upper:
                    image_url = '/static/uploads/doors/neoclassico_2_pro_eco_ice_official.jpg'
                    zadoor_img = None
                elif '3' in name_upper and 'ICE' in name_upper and 'PRO' in name_upper:
                    image_url = '/static/uploads/doors/neoclassico_3_pro_eco_ice_official.jpg'
                    zadoor_img = None
                elif '11' in name_upper:
                    if 'BEIGE' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_keramik_beige_official.jpg'
                    elif 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_alaska_official.jpg'
                    elif 'GREY' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_nardo_grey_official.jpg'
                    elif 'BROWN' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_keramik_brown_official.png'
                    elif 'VALSE' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_keramik_valse_official.png'
                    elif 'WHITE' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_11_alaska_official.jpg' # fallback
                    else:
                        image_url = '/static/uploads/doors/neoclassico_11_alaska_official.jpg'
                    zadoor_img = None
                elif '12' in name_upper:
                    if 'BEIGE' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_12_keramik_beige_official.jpg'
                    elif 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_12_alaska_official.jpg'
                    elif 'GREY' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_12_nardo_grey_official.jpg'
                    elif 'BROWN' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_12_keramik_brown_official.png'
                    elif 'VALSE' in name_upper:
                        image_url = '/static/uploads/doors/neoclassico_12_keramik_valse_official.png'
                    else:
                        image_url = '/static/uploads/doors/neoclassico_12_alaska_official.jpg'
                    zadoor_img = None
                else:
                    # Generic fallback if no match
                    image_url = '/static/uploads/doors/neoclassico_11_alaska_official.jpg'
                    zadoor_img = None
            elif 'КЛАССИКО' in name_upper:
                zadoor_img = 'Классико 12-1 Shellac White.jpg'
                if '12.2' in name_upper and 'WHITE' in name_upper:
                    image_url = '/static/uploads/doors/classico_12_2_shellac_white.png'
                    zadoor_img = None
                elif '13.1' in name_upper and 'WHITE' in name_upper:
                    image_url = '/static/uploads/doors/classico_13_1_shellac_white.jpg'
                    zadoor_img = None
                elif '32' in name_upper and 'ALASKA' in name_upper:
                    image_url = '/static/uploads/doors/classico_32_alaska_new.jpg'
                    zadoor_img = None
                elif '33' in name_upper and 'ALASKA' in name_upper:
                    image_url = '/static/uploads/doors/classico_33_alaska_white_crystal.webp'
                    zadoor_img = None
                elif '42' in name_upper:
                    if 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/classico_42_alaska.jpg'
                        zadoor_img = None
                    elif 'GREY' in name_upper:
                        image_url = '/static/uploads/doors/classico_42_nardo_grey.jpg'
                        zadoor_img = None
                    elif 'ICE' in name_upper:
                        image_url = '/static/uploads/doors/classico_42_eco_ice.jpg'
                        zadoor_img = None
                elif '43' in name_upper:
                    if 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/classico_43_alaska_white_crystal.jpg'
                        zadoor_img = None
                    elif 'GREY' in name_upper:
                        image_url = '/static/uploads/doors/classico_43_nardo_grey_white_crystal.jpg'
                        zadoor_img = None
                    elif 'ICE' in name_upper:
                        image_url = '/static/uploads/doors/classico_43_eco_ice_white_ii.jpg'
                        zadoor_img = None
                elif '82' in name_upper and 'ALASKA' in name_upper:
                    image_url = '/static/uploads/doors/classico_82_alaska.jpg'
                    zadoor_img = None
                elif '83' in name_upper and 'ALASKA' in name_upper:
                    image_url = '/static/uploads/doors/classico_83_alaska_white_crystal.jpg'
                    zadoor_img = None
            elif 'НЕОКЛАССИКО' in name_upper:
                zadoor_img = 'Неоклассико-2 PRO ЭКО Ice.jpg'
            elif 'ПОРТА' in name_upper:
                # Porta collection overrides
                if 'ПОРТА-1 ' in name_upper or 'ПОРТА-1 ' in name_upper.replace('-', '- '):
                    if 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/porta_1_alaska_official_v3.jpg'
                    elif 'GREY' in name_upper:
                        image_url = '/static/uploads/doors/porta_1_nardo_grey_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_1_alaska_official_v3.jpg'
                    zadoor_img = None
                elif 'ПОРТА-50 ' in name_upper or 'ПОРТА-50 ' in name_upper.replace('-', '- '):
                    if 'VALSE' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_4ab_keramik_valse_black_official.jpg'
                    elif 'BROWN' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_4ab_keramik_brown_black_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_50_4ab_keramik_valse_black_official.jpg'
                    zadoor_img = None
                elif 'ПОРТА-50.1 ' in name_upper or 'ПОРТА-50.10' in name_upper or 'ПОРТА-50.11' in name_upper:
                    if 'OAK' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_1_4ab_natural_oak_official.jpg'
                    elif 'BEIGE' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_b_rocks_beige_official.jpg'
                    elif 'PEARL' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_b_rocks_pearl_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_50_1_4ab_natural_oak_official.jpg'
                    zadoor_img = None
                elif 'ПОРТА-50 B' in name_upper:
                    if 'BEIGE' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_b_rocks_beige_official.jpg'
                    elif 'PEARL' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_b_rocks_pearl_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_50_b_rocks_beige_official.jpg'
                    zadoor_img = None
                elif 'ПОРТА-51' in name_upper:
                    if 'ALASKA BLACK STAR' in name_upper and '4AB' in name_upper:
                        image_url = '/static/uploads/doors/porta_51_4ab_alaska_black_star_official.jpg'
                    elif 'ALASKA' in name_upper:
                        image_url = '/static/uploads/doors/porta_1_alaska_official_v3.jpg'
                    elif 'OAK' in name_upper:
                        image_url = '/static/uploads/doors/porta_50_1_4ab_natural_oak_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_1_alaska_official_v3.jpg'
                    zadoor_img = None
                elif 'ПОРТА-52' in name_upper:
                    if 'SHELLAC CREAM' in name_upper:
                        image_url = '/static/uploads/doors/porta_52_4ab_shellac_cream_official.png'
                    zadoor_img = None
                elif 'ПОРТА-54' in name_upper:
                    if 'NARDO GREY' in name_upper:
                        image_url = '/static/uploads/doors/porta_54_4ab_nardo_grey_official.jpg'
                    zadoor_img = None
                elif 'ПОРТА-58' in name_upper:
                    if 'GREY OAK' in name_upper:
                        image_url = '/static/uploads/doors/porta_58_4ab_grey_oak_official.jpg'
                    elif 'NATURAL OAK' in name_upper:
                        image_url = '/static/uploads/doors/porta_58_4ab_natural_oak_official.jpg'
                    else:
                        image_url = '/static/uploads/doors/porta_1_nardo_grey_official.jpg'
                    zadoor_img = None
                elif 'ПОРТА INVISIBLE' in name_upper:
                    if 'WHITE' in name_upper or 'ПРАЙМЕР' in name_upper or 'PRIMER' in name_upper:
                        image_url = '/static/uploads/doors/porta_invisible_4a_primer_white_official.png'
                    zadoor_img = None
                elif 'ART-LITE' in name_upper or 'ART LITE' in name_upper:
                    norm_name = name_upper.replace("ВЕНЕЦИЯ 2", "ВЕНЕЦИЯ-2")
                    if 'НЕАПОЛЬ' in norm_name and ('БЕЛАЯ' in norm_name or 'БЕЛЫЙ' in norm_name):
                        image_url = '/static/uploads/doors/art_lite_neapol_white_official.jpg'
                    elif 'ВЕНЕЦИЯ-2' in norm_name and 'ПЕРЛАМУТР' in norm_name:
                        image_url = '/static/uploads/doors/art_lite_venezia_2_pearl_official.jpg'
                    elif 'ВЕНЕЦИЯ' in norm_name and ('БЕЛАЯ' in norm_name or 'БЕЛЫЙ' in norm_name):
                        image_url = '/static/uploads/doors/art_lite_venezia_white_official.jpg'
                    elif 'CHAOS' in norm_name and 'RAL 7044' in norm_name:
                        image_url = '/static/uploads/doors/art_lite_chaos_ral_7044_official.webp'
                    elif 'ПО А2' in norm_name and 'RAL 7044' in norm_name and 'ЧЕРНЫЙ ЛАКОБЕЛЬ' in norm_name:
                        image_url = '/static/uploads/doors/art_lite_po_a2_ral_7044_black_lakobel_official.jpg'
                    zadoor_img = None
                elif 'CLASSIC BAGUETTE' in name_upper:
                    import re
                    is_po = bool(re.search(r'\bПО\b', name_upper))
                    
                    # Determine color category
                    color = "beliy"
                    if any(kw in name_upper for kw in ["ГРАФИТ", "DARK", "ДАРК"]):
                        color = "grafit"
                    elif any(kw in name_upper for kw in ["СЕРЫЙ", "СЕРЫЙ МАТОВЫЙ"]):
                        color = "sery"
                    elif any(kw in name_upper for kw in ["КРЕМ", "ГОЛД", "GOLD", "МОЛОЧН", "МИЛК"]):
                        color = "kremoviy"
                        
                    if "ТУРИН" in name_upper:
                        if "ПО АК" in name_upper or "ПО АК2" in name_upper or "B5" in name_upper or "В5" in name_upper:
                            image_url = "/static/uploads/doors/cb_turin_po_ak_b5_cream_official.png"
                        elif is_po:
                            if color == "grafit":
                                image_url = "/static/uploads/doors/cb_turin_po_b4_grafit.jpg"
                            elif color == "sery":
                                image_url = "/static/uploads/doors/cb_turin_po_b4_sery.jpg"
                            else:
                                image_url = "/static/uploads/doors/cb_turin_po_b4_beliy.jpg"
                        else: # ПГ
                            if color == "grafit":
                                image_url = "/static/uploads/doors/cb_turin_pg_b4_grafit.jpg"
                            elif color == "sery":
                                image_url = "/static/uploads/doors/cb_turin_pg_b4_sery.jpg"
                            elif color == "kremoviy":
                                image_url = "/static/uploads/doors/cb_turin_pg_b4_kremoviy.jpg"
                            else:
                                image_url = "/static/uploads/doors/cb_turin_pg_b4_beliy.jpg"
                                
                    elif "ВЕНЕЦИЯ" in name_upper:
                        if "ПО АК" in name_upper or "ПО АК2" in name_upper:
                            image_url = "/static/uploads/doors/cb_venezia_po_ak_beliy.jpg"
                        elif is_po:
                            if "В5.3" in name_upper or "B5.3" in name_upper or "В5" in name_upper or "B5" in name_upper:
                                if color == "sery":
                                    image_url = "/static/uploads/doors/cb_venezia_po_b53_sery.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_venezia_po_b3_beliy.jpg"
                            else:
                                if color == "grafit":
                                    image_url = "/static/uploads/doors/cb_venezia_po_b3_grafit.jpg"
                                elif color == "sery":
                                    image_url = "/static/uploads/doors/cb_venezia_po_b3_sery.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_venezia_po_b3_beliy.jpg"
                        else: # ПГ
                            if "В4" in name_upper or "B4" in name_upper:
                                if color == "sery":
                                    image_url = "/static/uploads/doors/cb_venezia_pg_b4_sery.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_venezia_pg_b4_beliy.jpg"
                            elif "В5.3" in name_upper or "B5.3" in name_upper or "В5" in name_upper or "B5" in name_upper:
                                image_url = "/static/uploads/doors/cb_venezia_pg_b53_beliy.jpg"
                            else: # В3
                                if color == "grafit":
                                    image_url = "/static/uploads/doors/cb_venezia_pg_b3_grafit.jpg"
                                elif color == "sery":
                                    image_url = "/static/uploads/doors/cb_venezia_pg_b3_sery.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_venezia_pg_b3_beliy.jpg"
                                    
                    elif "НЕАПОЛЬ" in name_upper:
                        if is_po:
                            if color == "kremoviy":
                                image_url = "/static/uploads/doors/cb_neapol_po_b3_kremoviy.jpg"
                            elif color == "grafit":
                                image_url = "/static/uploads/doors/cb_venezia_po_b3_grafit.jpg"
                            elif color == "sery":
                                image_url = "/static/uploads/doors/cb_venezia_po_b3_sery.jpg"
                            else:
                                image_url = "/static/uploads/doors/cb_neapol_po_b3_beliy.jpg"
                        else: # ПГ
                            if "В3" in name_upper or "B3" in name_upper:
                                if color == "sery":
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b1_sery.jpg"
                                elif color == "kremoviy":
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b1_kremoviy.jpg"
                                elif color == "grafit":
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b4_grafit_official.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b3_beliy.jpg"
                            else: # B1
                                if color == "sery":
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b1_sery.jpg"
                                elif color == "kremoviy":
                                    image_url = "/static/uploads/doors/cb_neapol_pg_b1_kremoviy.jpg"
                                else:
                                    image_url = "/static/uploads/doors/cb_ampir_pg_beliy.jpg"
                                    
                    elif "АМПИР" in name_upper:
                        if is_po:
                            image_url = "/static/uploads/doors/cb_ampir_po_b5_beliy_official.jpg"
                        else:
                            if color == "kremoviy":
                                image_url = "/static/uploads/doors/cb_neapol_pg_b1_kremoviy.jpg"
                            else:
                                image_url = "/static/uploads/doors/cb_ampir_pg_beliy.jpg"
                    zadoor_img = None
                else:
                    # Fallback for Porta
                    image_url = '/static/uploads/doors/porta_1_alaska_official_v3.jpg'
                    zadoor_img = None
            elif 'ELEN' in name_upper or 'FILOMURO' in name_upper:
                zadoor_img = '4luduzxj155pp1ut0vbue628mb3dxxow.jpg'
                
            if zadoor_img:
                image_url = f"/images/products/zadoor/{zadoor_img}"

        # Clean name for doors to remove sizes (e.g. 43х700х2000)
        display_name = name
        if is_door:
            display_name = clean_door_name(name)
            
        is_active_target = True
        # Hide samples, booklets, catalogs, showroom stands, and t-shirts
        name_lower = name.lower()
        if any(pat in name_lower for pat in ["образец", "стенд", "буклет", "футболк", "каталог", "дружба", "нестандарт", "стандарт zadoor"]):
            is_active_target = False
        
        # Check if exists (needed before Coswick logic to preserve existing image_url)
        db_obj = product_map.get(ref_key)
        
        # Override for Coswick 9 products constraint by SKU
        coswick_9_skus = {
            '1167-1201-10', '1174-1281-10', '1174-3247-20', '1174-4217-20',
            '1175-1831-10', '1192-1825-10', '1167-1809-10', '1176-4841-20',
            '1174-1854-10'
        }
        
        is_coswick = (category_id == 406 or parsed_brand == "Coswick" or sku in coswick_9_skus)
        if is_coswick:
            if sku in coswick_9_skus:
                is_active_target = True
                category_id = 406
                parsed_brand = "Coswick"
                parsed_country = "Беларусь"
                if db_obj and db_obj.image_url and "/images/products/coswick/" in db_obj.image_url:
                    image_url = db_obj.image_url
                else:
                    image_url = f"/images/products/coswick/coswick-{sku}.png"
            else:
                is_active_target = False
        if is_volkhovets:
            parsed_brand = "Волховец"
            parsed_country = "Россия"

        if db_obj:
            # Update fields directly
            db_obj.sku = sku
            
            # Preserve Volkhovets custom prices, images, and names
            if is_volkhovets:
                if not db_obj.price or db_obj.price <= 0:
                    db_obj.price = price
                if not db_obj.image_url:
                    db_obj.image_url = image_url
                if not db_obj.name or "Volkhovets" not in db_obj.name:
                    db_obj.name = display_name
            else:
                db_obj.price = price
                db_obj.image_url = image_url if (
                    not db_obj.image_url 
                    or (is_tarwood and image_url) 
                    or (is_sp_door and image_url)
                    or (is_venice_door and image_url)
                    or (is_kvalitet_door and image_url)
                    or (is_zadoor_portika and image_url)
                ) else db_obj.image_url
                if is_door or not db_obj.description:
                    db_obj.name = display_name

            db_obj.price_outlet = price_outlet
            db_obj.price_outlet_usd = price_outlet_usd
            db_obj.price_outlet_wholesale = price_outlet_wholesale
            db_obj.stock = stock
            db_obj.category_id = category_id
            db_obj.brand = parsed_brand
            db_obj.country = parsed_country
            db_obj.grade = parsed_grade
            db_obj.thickness = parsed_thickness
            db_obj.is_active = is_active_target
            db.add(db_obj)
        else:
            # Create a new product object and add to session
            new_obj = ProductModel(
                name=display_name, sku=sku, ref_key=ref_key, price=price, price_outlet=price_outlet,
                price_outlet_usd=price_outlet_usd, price_outlet_wholesale=price_outlet_wholesale, stock=stock,
                category_id=category_id, image_url=image_url,
                brand=parsed_brand, country=parsed_country, grade=parsed_grade, thickness=parsed_thickness,
                is_active=is_active_target
            )
            db.add(new_obj)
            product_map[ref_key] = new_obj
        
        synced_count += 1
            
    # === Volkhovets Post-Sync Cleanup & Grouping ===
    from sqlalchemy import select, update
    
    # 1. Deactivate promotional items
    await db.execute(
        update(ProductModel)
        .where(ProductModel.id.in_(VOLKHOVETS_NON_DOOR_IDS))
        .values(is_active=False, image_url=None)
    )
    
    # 2. Group all active Volkhovets products (excluding non-doors)
    stmt_vol = select(ProductModel).where(
        (ProductModel.brand.ilike("%волховец%") | ProductModel.brand.ilike("%volkhovets%")) &
        (ProductModel.id.not_in(VOLKHOVETS_NON_DOOR_IDS))
    )
    res_vol = await db.execute(stmt_vol)
    vol_products = res_vol.scalars().all()
    
    vol_groups = {}
    for p in vol_products:
        model, collection, color = extract_volkhovets_group_key(p.name)
        key = (model, collection, color)
        if key not in vol_groups:
            vol_groups[key] = []
        vol_groups[key].append(p)
        
    for key, prods in vol_groups.items():
        model, collection, color = key
        
        # Sort to prioritize products with custom image URL, lower ID first
        def sort_key(p):
            has_custom_img = p.image_url and "/images/products/volkhovets/" in p.image_url
            return (not has_custom_img, p.id)
            
        prods.sort(key=sort_key)
        rep_prod = prods[0]
        rep_prod.is_active = True
        
        # Deactivate duplicates
        for dup in prods[1:]:
            dup.is_active = False
            
        # Parse and combine options
        openings = set()
        hinges = set()
        preps = set()
        for p in prods:
            op, hg, pr = parse_volkhovets_options(p.name)
            if op: openings.add(op)
            if hg: hinges.add(hg)
            if pr: preps.add(pr)
            
        # Preserve existing detailed specifications
        if rep_prod.specifications and len(rep_prod.specifications) > 5:
            pass
        else:
            rep_prod.specifications = {}
        
        # Clean representative name
        clean_name = f"Дверь межкомнатная Volkhovets {collection} {model}"
        if color and color.lower() != "под окраску":
            clean_name += f" ({color})"
        else:
            clean_name += " под окраску"
        rep_prod.name = clean_name
        
    await db.commit()
    
    return {"status": "success", "synced_count": synced_count}

@router.post("", response_model=ProductDetail)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Create a new product.
    """
    return await product_crud.create(db, obj_in=product_in)

@router.patch("/{id}", response_model=ProductDetail)
async def update_product(
    id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    product = await product_crud.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await product_crud.update(db, db_obj=product, obj_in=product_in)

@router.delete("/{id}")
async def delete_product(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    product = await product_crud.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product_crud.remove(db, id=id)
    return {"status": "success"}

@router.get("/{id}/accessories")
async def get_product_accessories(
    id: int,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get matching короб and наличник accessories for a door product.
    """
    product = await product_crud.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Extract color
    colors = [
        "Белый матовый", "Серый матовый", "Матовый графит", "Матовый кремовый",
        "Нордик", "Орех карамель", "Жемчужно-перламутровый", "Беленый дуб",
        "Дуб темный", "Дуб темный продольный", "Дуб натуральный", "Дуб натуральный продольный",
        "Alaska", "Grey Oak", "Natural Oak", "Молочный матовый", "Графит премьер мат"
    ]
    extracted_color = ""
    for c in colors:
        if c.lower() in product.name.lower():
            extracted_color = c
            break
            
    if not extracted_color:
        # Fallback extraction
        words = product.name.split()
        spec_tokens = {"пг", "по", "в3", "в4", "в5.3", "b5.3", "в5", "b4", "alu", "black", "glass", "стекло", "дверь", "полотно"}
        color_words = []
        for w in reversed(words):
            if w.lower() not in spec_tokens and not any(char.isdigit() for char in w):
                color_words.insert(0, w)
            if len(color_words) >= 2:
                break
        if color_words:
            extracted_color = " ".join(color_words)
            
    if not extracted_color:
        return {"color": "", "boxes": [], "trims": []}
        
    # Query database for boxes containing короб or коробка and the extracted color, price > 0
    from sqlalchemy import select, or_, and_
    from app.models.product import Product as ProductModel
    
    # Simple keyword split to match color words
    color_keywords = extracted_color.replace("(", "").replace(")", "").split()
    
    # We want products that are active and have price > 0
    # For boxes
    box_filters = [
        ProductModel.is_active == True,
        ProductModel.price > 0,
        or_(ProductModel.name.ilike("%короб%"), ProductModel.name.ilike("%коробка%"))
    ]
    for kw in color_keywords:
        box_filters.append(ProductModel.name.ilike(f"%{kw}%"))
        
    box_query = select(ProductModel).where(and_(*box_filters))
    box_result = await db.execute(box_query)
    boxes = box_result.scalars().all()
    
    # For trims
    trim_filters = [
        ProductModel.is_active == True,
        ProductModel.price > 0,
        ProductModel.name.ilike("%наличник%")
    ]
    for kw in color_keywords:
        trim_filters.append(ProductModel.name.ilike(f"%{kw}%"))
        
    trim_query = select(ProductModel).where(and_(*trim_filters))
    trim_result = await db.execute(trim_query)
    trims = trim_result.scalars().all()
    
    from app.services.translation import get_locale_from_request, get_translations_bulk
    from app.core.config import settings
    lang = get_locale_from_request(request)
    if lang and lang != "ru":
        await get_translations_bulk(db, "product", boxes, ["name"], lang, settings.CLAUDE_API_KEY)
        await get_translations_bulk(db, "product", trims, ["name"], lang, settings.CLAUDE_API_KEY)

    return {
        "color": extracted_color,
        "boxes": [{"id": p.id, "name": p.name, "price": p.price, "sku": p.sku} for p in boxes],
        "trims": [{"id": p.id, "name": p.name, "price": p.price, "sku": p.sku} for p in trims]
    }
