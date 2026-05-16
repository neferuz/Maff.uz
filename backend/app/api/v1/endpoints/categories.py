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
) -> Any:
    """
    Retrieve categories with product counts.
    """
    from sqlalchemy import func
    from app.models.product import Product
    
    # 1. Fetch categories
    categories = await category_crud.get_multi(db, skip=skip, limit=limit)
    
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
            "product_count": get_total_count(c.id)
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
