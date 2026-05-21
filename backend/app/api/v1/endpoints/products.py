from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas.product import Product, ProductCreate, ProductUpdate, ProductDetail
from app.crud.crud_product import product_crud, category_crud
from app.services.one_c import one_c_service
from app.utils.sanitizer import parse_product_characteristics, BRANDS_MAP

router = APIRouter()

@router.get("", response_model=List[Product])
async def read_products(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    category_id: int = None,
    q: str = None,
    include_inactive: bool = False,
) -> Any:
    """
    Retrieve products.
    """
    from sqlalchemy.future import select
    from sqlalchemy.orm import defer
    from app.models.product import Product as ProductModel
    
    query = select(ProductModel).options(defer(ProductModel.description))
    
    if q:
        query = query.filter(
            (ProductModel.name.ilike(f"%{q}%")) | 
            (ProductModel.brand.ilike(f"%{q}%"))
        )
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
    return result.scalars().all()

@router.get("/{id}", response_model=ProductDetail)
async def read_product(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get product by ID.
    """
    product = await product_crud.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
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
        if not category_id:
            name_upper = (name or "").upper()
            
            # 1. Try Russian synonym matching first (most specific first)
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
                
                # --- Handles / Door Hardware ---
                elif any(kw in name_upper for kw in ['Д.РУЧКА', 'ДВЕРНАЯ РУЧКА', 'РУЧК', 'РУЧКА', 'РУЧКИ']):
                    category_id = cat_name_map.get('РУЧКИ SYSTEM') or cat_name_map.get('РУЧКИ')
                elif any(kw in name_upper for kw in ['ПЕТЛ', 'ПЕТЛИ', 'ПЕТЛЯ', 'ЗАМОК', 'ЗАВЕРТКА', 'ЦИЛИНДР', 'ДВЕРНОЙ СТОППЕР', 'СТОППЕР', 'УПОР', 'МАГНИТНЫЙ МЕХАНИЗМ', 'ОТВЕТНАЯ ПЛАНКА', 'НАКЛАДКА', 'STOPPINO', 'ЗАЩЕЛК', 'ЗАЩЁЛК', 'КОРПУС', 'ОГРАНИЧИТЕЛ']):
                    category_id = cat_name_map.get('РУЧКИ') or cat_name_map.get('ДВЕРИ')
                elif 'AGB' in name_upper and any(kw in name_upper for kw in ['KNOB', 'KEY', 'СЕРДЦЕВИНА', 'ЗАМОК', 'ПЕТЛ', 'РУЧК', 'НАКЛАДКА', 'ЗАЩЕЛК', 'КОРПУС']):
                    category_id = cat_name_map.get('РУЧКИ')
                elif 'CK ' in name_upper or 'CK-' in name_upper:
                    category_id = cat_name_map.get('РУЧКИ')
                
                # --- Thresholds / Profiles ---
                elif any(kw in name_upper for kw in ['СТЫК', 'УГОЛ ', 'КАНТ ПОЛУК', 'ШИРОКИЙ СТЫК', 'ПОРОГ', 'ПОР0']):
                    category_id = cat_name_map.get('РУССКИЙ ПРОФИЛЬ') or cat_name_map.get(' ПОРОГИ')
                elif name_upper.startswith('38ММ ') or name_upper.startswith('ПРОФИЛЬ') or name_upper.startswith('ПОРОГ ') or name_upper.startswith('ПОР0 '):
                    category_id = cat_name_map.get('РУССКИЙ ПРОФИЛЬ') or cat_name_map.get(' ПОРОГИ')
                
                # --- Underlay ---
                elif 'ПОДЛОЖКА' in name_upper:
                    category_id = cat_name_map.get('ПОДЛОЖКА ПОД ПАРКЕТ И ЛАМИНАТ ') or cat_name_map.get('ПОДЛОЖКА ПОД ПАРКЕТ И ЛАМИНАТ')
                
                # --- OSB ---
                elif 'OSB' in name_upper:
                    category_id = cat_name_map.get('OSB')
                
                # --- Parquet boards ---
                elif 'ДОСКА ПАРКЕТНАЯ' in name_upper:
                    category_id = cat_name_map.get('ПАРКЕТНАЯ ДОСКА')
                    
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
                        category_id = 8  # Паркетная доска
            
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
        
        # Check if exists
        db_obj = product_map.get(ref_key)
        if db_obj:
            # Update fields directly
            db_obj.sku = sku
            db_obj.price = price
            db_obj.price_outlet = price_outlet
            db_obj.price_outlet_usd = price_outlet_usd
            db_obj.price_outlet_wholesale = price_outlet_wholesale
            db_obj.stock = stock
            db_obj.category_id = category_id
            db_obj.brand = parsed_brand
            db_obj.country = parsed_country
            db_obj.grade = parsed_grade
            db_obj.thickness = parsed_thickness
            if not db_obj.description:
                db_obj.name = name
            if not db_obj.image_url:
                db_obj.image_url = image_url
            db.add(db_obj)
        else:
            # Create a new product object and add to session
            new_obj = ProductModel(
                name=name, sku=sku, ref_key=ref_key, price=price, price_outlet=price_outlet,
                price_outlet_usd=price_outlet_usd, price_outlet_wholesale=price_outlet_wholesale, stock=stock,
                category_id=category_id, image_url=image_url,
                brand=parsed_brand, country=parsed_country, grade=parsed_grade, thickness=parsed_thickness
            )
            db.add(new_obj)
            product_map[ref_key] = new_obj
        
        synced_count += 1
        
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
    
    return {
        "color": extracted_color,
        "boxes": [{"id": p.id, "name": p.name, "price": p.price, "sku": p.sku} for p in boxes],
        "trims": [{"id": p.id, "name": p.name, "price": p.price, "sku": p.sku} for p in trims]
    }
