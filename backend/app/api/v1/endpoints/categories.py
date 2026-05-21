from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_product import category_crud
from app.schemas.product import Category, CategoryCreate, CategoryUpdate
from app.services.one_c import one_c_service

router = APIRouter()

@router.get("", response_model=List[Category])
async def read_categories(
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
    categories_result = await db.execute(query.offset(skip).limit(limit))
    categories = categories_result.scalars().all()
    
    # 2. Fetch product counts per category
    product_counts_result = await db.execute(
        select(Product.category_id, func.count(Product.id))
        .group_by(Product.category_id)
    )
    direct_counts = {row[0]: row[1] for row in product_counts_result.all() if row[0] is not None}
    
    # 3. Build a map of category_id -> children_ids
    category_map = {c.id: c for c in categories}
    children_map = {}
    for c in categories:
        if c.parent_id:
            if c.parent_id not in children_map:
                children_map[c.parent_id] = []
            children_map[c.parent_id].append(c.id)
            
    # 4. Recursive function to get total count
    def get_total_count(cat_id):
        count = direct_counts.get(cat_id, 0)
        children = children_map.get(cat_id, [])
        for child_id in children:
            count += get_total_count(child_id)
        return count
        
    # 5. Populate product_count for each category
    result = []
    for c in categories:
        # We need to convert from SQLAlchemy model to Pydantic-compatible dict or object
        c_dict = {
            "id": c.id,
            "name": c.name,
            "ref_key": c.ref_key,
            "parent_id": c.parent_id,
            "description": c.description,
            "image_url": c.image_url,
            "product_count": get_total_count(c.id),
            "is_active": c.is_active,
            "is_order_only": c.is_order_only,
            "is_preorder": c.is_preorder,
            "price_prefix": c.price_prefix,
            "order_link": c.order_link,
        }
        result.append(c_dict)
        
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
        product_count=0
    )

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
        product_count=0
    )
