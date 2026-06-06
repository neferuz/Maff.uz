from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_product import category_crud
from app.schemas.product import Category, CategoryCreate, CategoryUpdate, CategoryReorder
from app.services.one_c import one_c_service

router = APIRouter()

@router.get("", response_model=List[Category])
async def read_categories(
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 1000,
    include_inactive: bool = False,
) -> Any:
    """
    Retrieve categories with product counts.
    """
    from sqlalchemy import func
    from app.models.product import Product, Category as CategoryModel
    
    # 1. Fetch categories
    query = select(CategoryModel)
    if not include_inactive:
        query = query.filter(CategoryModel.is_active != False)
    query = query.order_by(CategoryModel.sort_order.asc(), CategoryModel.name.asc())
    categories_result = await db.execute(query.offset(skip).limit(limit))
    categories = categories_result.scalars().all()
    
    # 2. Fetch active products to calculate count with the same filters as frontend
    # Build a map of category_id -> children_ids first
    category_map = {c.id: c for c in categories}
    children_map = {}
    for c in categories:
        if c.parent_id:
            if c.parent_id not in children_map:
                children_map[c.parent_id] = []
            children_map[c.parent_id].append(c.id)

    # Recursive function to get all descendants of a category ID
    def get_descendant_ids(cat_id):
        desc = [cat_id]
        for child_id in children_map.get(cat_id, []):
            desc.extend(get_descendant_ids(child_id))
        return desc

    # Free price categories logic to match frontend page.tsx
    free_names_keywords = [
        'двер', 'порта', 'baguette', 'classic', 'zadoor', 'паркет', 'подложк',
        'coswick', 'sag', 'ковров', 'tarwood', 'spc', 'rocko', 'kronofloor',
        'ламинат', 'egger', 'krono', 'agt', 'joss', 'ultradecor', 'tarkett',
        'salsa', 's.classic', 'silkwood', 'stimul', 'ручк', 'петл', 'плинтус',
        'декор', 'панел', 'frente', 'порог', 'стык', 'кант', 'ковродержател',
        'крепеж', 'профил', 'wpc', 'decopro'
    ]
    free_ids = {8, 359, 174, 13}
    
    main_free_cats = []
    for c in categories:
        c_name_lower = c.name.lower()
        if c.id in free_ids or any(kw in c_name_lower for kw in free_names_keywords):
            main_free_cats.append(c.id)
            
    free_price_cat_ids = set()
    for cat_id in main_free_cats:
        free_price_cat_ids.update(get_descendant_ids(cat_id))

    # Fetch all active products
    products_result = await db.execute(
        select(Product.id, Product.name, Product.brand, Product.price, Product.category_id, Product.image_url)
        .filter(Product.is_active == True)
    )
    all_products = products_result.all()
    
    NON_PRODUCT_KEYWORDS = [
        "образец", "образцы",
        "коробка", "короб", "добор", "наличник",
        "стенд", "вывеска", "каталог", "буклет", "щит рекл",
        "футболка", "стойка",
        "герметик", "защелка", "замок", "agb",
        "ключ", "связка",
        "соединение", "соединитель", "петля",
        "ноутбук", "эмблема", "шуруп", "тяга",
        "сумка", "стреч", "пленка",
        "повербанк", "планшет", "подставка",
        "табличка", "рейка", "флаг", "холдер",
        "установка", "станок",
        "жидкий",
        "router", "роутер", "cpe",
        "оперативная", "память", "мышь",
    ]
    
    # 2. Group products to get accurate counts (matching products.py logic)
    from app.api.v1.endpoints.products import get_base_model_name
    
    def is_placeholder_url(url: str) -> bool:
        if not url:
            return True
        url_lower = url.lower()
        return "placeholder" in url_lower or "порта-51" in url_lower

    category_grouped_products = {} # category_id -> set(group_keys)
    
    for p in all_products:
        p_id, p_name, p_brand, p_price, p_category_id, p_image_url = p
        if p_category_id is None:
            continue
            
        name_lower = (p_name or "").lower()
        
        # 1. Non-product keywords check
        is_real = True
        for kw in NON_PRODUCT_KEYWORDS:
            if kw in name_lower:
                is_real = False
                break
        if not is_real:
            continue
            
        # 2. Polotno check
        if "полотно" in name_lower:
            brand_lower = (p_brand or "").lower()
            is_door_brand = any(b in brand_lower for b in ["волховец", "volkhovets", "zadoor", "portika", "profildoors", "filomuro"])
            if not is_door_brand:
                continue
                
        # 3. Price check
        price_val = float(p_price or 0)
        if price_val < 1000 and p_category_id not in free_price_cat_ids:
            continue
            
        # 4. Grouping Logic
        if p_category_id not in category_grouped_products:
            category_grouped_products[p_category_id] = set()
            
        if p_category_id in free_price_cat_ids:
            # For doors and handles, use the grouping key
            base_name = get_base_model_name(p_name).lower().strip()
            if not base_name:
                base_name = name_lower.strip()
            
            has_real_img = p_image_url and not is_placeholder_url(p_image_url)
            # Simplified key for counting: if same image, it's one product. 
            # If no image, base_name is the key.
            if has_real_img:
                group_key = f"img_{p_image_url}"
            else:
                group_key = f"name_{base_name}"
            
            category_grouped_products[p_category_id].add(group_key)
        else:
            # For other categories, every product is unique
            category_grouped_products[p_category_id].add(p_id)
            
    direct_counts = {cid: len(keys) for cid, keys in category_grouped_products.items()}

        
    # 4. Recursive function to get total count for category hierarchy
    def get_total_count(cat_id):
        count = direct_counts.get(cat_id, 0)
        children = children_map.get(cat_id, [])
        for child_id in children:
            count += get_total_count(child_id)
        return count
        
    # 5. Populate product_count for each category
    result = []
    
    EXCLUDED_IDS = {427, 449, 457, 464, 377, 143}
    EXCLUDED_NAMES = {
        "полотна на заказ",
        "полотна horizont",
        "полотна sense",
        "horizont",
        "sense",
    }
    
    for c in categories:
        if not include_inactive and c.id in EXCLUDED_IDS:
            continue
            
        name_lower = c.name.lower().strip()
        if not include_inactive and name_lower in EXCLUDED_NAMES:
            continue
            
        name_clean = c.name
        parent_id_clean = c.parent_id
        
        if not include_inactive:
            import re
            # Clean Zadoor prefix
            name_clean = re.sub(r'^(Полотна|Полотно)\s+', '', c.name, flags=re.IGNORECASE)
            # Clean Volkhovets prefix
            name_clean = re.sub(r'^Двери\s+Волховец\s+', '', name_clean, flags=re.IGNORECASE)
            # Clean Portika suffix
            name_clean = re.sub(r'\s*/\s*Двери\s*Мебель', '', name_clean, flags=re.IGNORECASE)
            # Clean Handle prefixes
            name_clean = re.sub(r'^Дверные\s+ручки\s+', '', name_clean, flags=re.IGNORECASE)
            name_clean = re.sub(r'^Дверные\s+ограничители\s+', '', name_clean, flags=re.IGNORECASE)
            
            # Map Zadoor-S Classic to S-Classic
            if name_clean == "Zadoor-S Classic":
                name_clean = "S-Classic"
            
            # Bypass parent_id
            if c.parent_id == 427:
                parent_id_clean = 426
            elif c.parent_id == 449:
                parent_id_clean = 448
            elif c.parent_id == 464:
                parent_id_clean = 328
            elif c.parent_id == 143:
                parent_id_clean = 356
                
        # We need to convert from SQLAlchemy model to Pydantic-compatible dict or object
        c_dict = {
            "id": c.id,
            "name": name_clean,
            "ref_key": c.ref_key,
            "parent_id": parent_id_clean,
            "description": c.description,
            "image_url": c.image_url,
            "product_count": get_total_count(c.id),
            "is_active": c.is_active,
            "is_order_only": c.is_order_only,
            "is_preorder": c.is_preorder,
            "price_prefix": c.price_prefix,
            "order_link": c.order_link,
            "sort_order": c.sort_order,
            "recommended_accessories": c.recommended_accessories,
            "attributes": c.attributes or [],
        }
        result.append(c_dict)
        
    from app.services.translation import get_locale_from_request, get_translations_bulk
    from app.core.config import settings
    lang = get_locale_from_request(request)
    if lang and lang != "ru":
        await get_translations_bulk(db, "category", result, ["name", "description"], lang, settings.CLAUDE_API_KEY)

    return result

@router.post("/sync")
async def sync_categories(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Sync categories with 1C.
    """
    # 1. Fetch from 1C (looping through all folders)
    all_one_c_items = []
    skip = 0
    batch_size = 1000
    
    while True:
        items = await one_c_service.fetch_nomenclatura(top=batch_size, skip=skip, is_folder=True)
        if not items:
            break
        all_one_c_items.extend(items)
        skip += batch_size
        if len(items) < batch_size:
            break
            
    synced_count = 0
    for item in all_one_c_items:
        # No need to check IsFolder here as it's filtered by API
            
        ref_key = item.get("Ref_Key")
        name = item.get("Description")
        
        # Check if exists
        db_obj = await category_crud.get_by_ref_key(db, ref_key)
        if db_obj:
            # Update
            await category_crud.update(db, db_obj=db_obj, obj_in=CategoryUpdate(name=name))
        else:
            # Create
            await category_crud.create(db, obj_in=CategoryCreate(name=name, ref_key=ref_key))
        
        synced_count += 1
        
    return {"status": "success", "synced_count": synced_count}

@router.delete("/{id}")
async def delete_category(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Delete a category and recursively delete all its subcategories and associated products.
    """
    from app.models.product import Product, Category
    from app.crud.crud_product import product_crud
    
    # 1. Fetch target category
    category = await category_crud.get(db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # 2. Retrieve all categories to build the subcategory tree
    all_cats_result = await db.execute(select(Category))
    all_categories = all_cats_result.scalars().all()
    
    # Build map of parent_id -> list of child categories
    children_map = {}
    for c in all_categories:
        if c.parent_id:
            if c.parent_id not in children_map:
                children_map[c.parent_id] = []
            children_map[c.parent_id].append(c)
            
    # 3. Find all subcategories recursively
    ids_to_delete = [id]
    def collect_subcategory_ids(parent_id: int):
        children = children_map.get(parent_id, [])
        for child in children:
            ids_to_delete.append(child.id)
            collect_subcategory_ids(child.id)
            
    collect_subcategory_ids(id)
    
    # 4. Delete all products belonging to these categories
    products_to_delete_result = await db.execute(
        select(Product).filter(Product.category_id.in_(ids_to_delete))
    )
    products_to_delete = products_to_delete_result.scalars().all()
    for p in products_to_delete:
        await db.delete(p)
        
    # 5. Delete all subcategories and the category itself
    for cat_id in reversed(ids_to_delete):
        cat_obj_result = await db.execute(select(Category).filter(Category.id == cat_id))
        cat_obj = cat_obj_result.scalars().first()
        if cat_obj:
            await db.delete(cat_obj)
            
    await db.commit()
    
    return {
        "status": "success", 
        "deleted_category_ids": ids_to_delete, 
        "deleted_products_count": len(products_to_delete)
    }

@router.post("/{id}/archive")
async def archive_category(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Archive a category, its subcategories and all associated products.
    """
    from app.models.product import Product, Category
    
    # 1. Fetch target category
    category = await category_crud.get(db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # 2. Retrieve all categories to build the subcategory tree
    all_cats_result = await db.execute(select(Category))
    all_categories = all_cats_result.scalars().all()
    
    # Build map of parent_id -> list of child categories
    children_map = {}
    for c in all_categories:
        if c.parent_id:
            if c.parent_id not in children_map:
                children_map[c.parent_id] = []
            children_map[c.parent_id].append(c)
            
    # 3. Find all subcategories recursively
    ids_to_archive = [id]
    def collect_subcategory_ids(parent_id: int):
        children = children_map.get(parent_id, [])
        for child in children:
            ids_to_archive.append(child.id)
            collect_subcategory_ids(child.id)
            
    collect_subcategory_ids(id)
    
    # 4. Deactivate all products belonging to these categories
    products_to_deactivate_result = await db.execute(
        select(Product).filter(Product.category_id.in_(ids_to_archive))
    )
    products_to_deactivate = products_to_deactivate_result.scalars().all()
    for p in products_to_deactivate:
        p.is_active = False
        db.add(p)
        
    # 5. Deactivate all subcategories and the category itself
    for cat_id in ids_to_archive:
        cat_obj_result = await db.execute(select(Category).filter(Category.id == cat_id))
        cat_obj = cat_obj_result.scalars().first()
        if cat_obj:
            cat_obj.is_active = False
            db.add(cat_obj)
            
    await db.commit()
    
    return {
        "status": "success", 
        "archived_category_ids": ids_to_archive, 
        "archived_products_count": len(products_to_deactivate)
    }

@router.post("/{id}/restore")
async def restore_category(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Restore a category, its subcategories and all associated products.
    """
    from app.models.product import Product, Category
    
    # 1. Fetch target category
    category = await category_crud.get(db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # 2. Retrieve all categories to build the subcategory tree
    all_cats_result = await db.execute(select(Category))
    all_categories = all_cats_result.scalars().all()
    
    # Build map of parent_id -> list of child categories
    children_map = {}
    for c in all_categories:
        if c.parent_id:
            if c.parent_id not in children_map:
                children_map[c.parent_id] = []
            children_map[c.parent_id].append(c)
            
    # 3. Find all subcategories recursively
    ids_to_restore = [id]
    def collect_subcategory_ids(parent_id: int):
        children = children_map.get(parent_id, [])
        for child in children:
            ids_to_restore.append(child.id)
            collect_subcategory_ids(child.id)
            
    collect_subcategory_ids(id)
    
    # 4. Activate all products belonging to these categories
    products_to_activate_result = await db.execute(
        select(Product).filter(Product.category_id.in_(ids_to_restore))
    )
    products_to_activate = products_to_activate_result.scalars().all()
    for p in products_to_activate:
        p.is_active = True
        db.add(p)
        
    # 5. Activate all subcategories and the category itself
    for cat_id in ids_to_restore:
        cat_obj_result = await db.execute(select(Category).filter(Category.id == cat_id))
        cat_obj = cat_obj_result.scalars().first()
        if cat_obj:
            cat_obj.is_active = True
            db.add(cat_obj)
            
    await db.commit()
    
    return {
        "status": "success", 
        "restored_category_ids": ids_to_restore, 
        "restored_products_count": len(products_to_activate)
    }

@router.post("/{id}/merge")
async def merge_category(
    id: int,
    target_category_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Merge all products from this category into the target category.
    """
    from app.models.product import Product
    from sqlalchemy import update
    
    # 1. Verify both categories exist
    source_cat = await category_crud.get(db, id=id)
    if not source_cat:
        raise HTTPException(status_code=404, detail="Source category not found")
        
    target_cat = await category_crud.get(db, id=target_category_id)
    if not target_cat:
        raise HTTPException(status_code=404, detail="Target category not found")
        
    if id == target_category_id:
        raise HTTPException(status_code=400, detail="Cannot merge a category into itself")
        
    # 2. Update all products having category_id = id to target_category_id
    stmt = (
        update(Product)
        .where(Product.category_id == id)
        .values(category_id=target_category_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    
    return {
        "status": "success",
        "moved_products_count": result.rowcount,
        "source_category_id": id,
        "target_category_id": target_category_id
    }

@router.post("", response_model=Category)
async def create_category(
    obj_in: CategoryCreate,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Create a new category.
    """
    created = await category_crud.create(db, obj_in=obj_in)
    return Category(
        id=created.id,
        name=created.name,
        ref_key=created.ref_key,
        parent_id=created.parent_id,
        description=created.description,
        image_url=created.image_url,
        is_active=created.is_active if created.is_active is not None else True,
        is_order_only=created.is_order_only,
        is_preorder=created.is_preorder,
        price_prefix=created.price_prefix,
        order_link=created.order_link,
        sort_order=created.sort_order,
        recommended_accessories=created.recommended_accessories,
        attributes=created.attributes or [],
        product_count=0
    )

@router.post("/reorder")
async def reorder_categories(
    obj_in: CategoryReorder,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Bulk update sort_order for categories.
    """
    from app.models.product import Category as CategoryModel
    
    # Simple loop to update each category's sort_order
    for item in obj_in.items:
        db_obj = await category_crud.get(db, id=item.id)
        if db_obj:
            db_obj.sort_order = item.sort_order
            db.add(db_obj)
            
    await db.commit()
    return {"status": "success"}

@router.put("/{id}", response_model=Category)
async def update_category(
    id: int,
    obj_in: CategoryUpdate,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Update a category.
    """
    category = await category_crud.get(db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    updated = await category_crud.update(db, db_obj=category, obj_in=obj_in)
    return Category(
        id=updated.id,
        name=updated.name,
        ref_key=updated.ref_key,
        parent_id=updated.parent_id,
        description=updated.description,
        image_url=updated.image_url,
        is_active=updated.is_active if updated.is_active is not None else True,
        is_order_only=updated.is_order_only,
        is_preorder=updated.is_preorder,
        price_prefix=updated.price_prefix,
        order_link=updated.order_link,
        sort_order=updated.sort_order,
        recommended_accessories=updated.recommended_accessories,
        attributes=updated.attributes or [],
        product_count=0
    )
