from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_product import product_crud, category_crud
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.services.one_c import one_c_service

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
    from app.models.product import Product as ProductModel
    
    query = select(ProductModel)
    
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

@router.get("/{id}", response_model=Product)
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
    
    # 4. Fetch all existing products from the database for in-memory mapping
    from sqlalchemy.future import select
    from app.models.product import Product as ProductModel
    db_products_res = await db.execute(select(ProductModel))
    db_products = db_products_res.scalars().all()
    product_map = {p.ref_key: p for p in db_products if p.ref_key}
    
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
            arbiton_keywords = ['DIAMOND', 'INDO', 'INTEGRA', 'STIQ', 'VEGA', 'VIGO']
            for kw in arbiton_keywords:
                if kw in name_upper:
                    category_id = cat_name_map.get(kw)
                    break
            
            # Map Silk Road / Silkwood products
            if not category_id:
                silk_keywords = ['SILKWOOD', 'SILK ROAD', 'SILKROAD', 'СИЛК РОУД', 'ШЕЛКОВЫЙ ПУТЬ']
                if any(skw in name_upper for skw in silk_keywords):
                    for cat_name, cat_id in cat_name_map.items():
                        if any(skw in cat_name for skw in silk_keywords):
                            category_id = cat_id
                            break
                    if not category_id:
                        category_id = 359
        
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
                category_id=category_id, image_url=image_url
            )
            db.add(new_obj)
            product_map[ref_key] = new_obj
        
        synced_count += 1
        
    await db.commit()
    
    return {"status": "success", "synced_count": synced_count}

@router.patch("/{id}", response_model=Product)
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
