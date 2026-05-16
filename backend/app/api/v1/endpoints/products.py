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
) -> Any:
    """
    Retrieve products.
    """
    if q:
        products = await product_crud.search(db, query=q, skip=skip, limit=limit)
    elif category_id:
        products = await product_crud.get_multi_by_category(db, category_id=category_id, skip=skip, limit=limit)
    else:
        products = await product_crud.get_multi(db, skip=skip, limit=limit)
    return products

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
    one_c_stocks = await one_c_service.fetch_stock()
    
    # 2. Create maps
    price_map = {p["Номенклатура_Key"]: p["Цена"] for p in one_c_prices}
    stock_map = {s["Номенклатура_Key"]: s["ВНаличииBalance"] for s in one_c_stocks}
    
    # 3. Create category map (ref_key -> id)
    db_categories = await category_crud.get_multi(db, limit=1000)
    cat_map = {c.ref_key: c.id for c in db_categories}
    
    synced_count = 0
    for item in all_one_c_items:
        ref_key = item.get("Ref_Key")
        name = item.get("НаименованиеПолное") or item.get("Description")
        sku = item.get("Артикул")
        parent_key = item.get("Parent_Key")
        image_key = item.get("ФайлКартинки_Key")
        
        price = price_map.get(ref_key, 0)
        stock = stock_map.get(ref_key, 0)
        category_id = cat_map.get(parent_key)
        
        # Image placeholder logic (will be updated by CSV import)
        image_url = None
        if image_key and image_key != "00000000-0000-0000-0000-000000000000":
            image_url = f"https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200&auto=format&fit=crop"
        
        # Check if exists
        db_obj = await product_crud.get_by_ref_key(db, ref_key)
        if db_obj:
            # Update
            # Protect name and image if they were enriched by CSV (we assume enriched if description exists)
            update_data = ProductUpdate(
                name=name if not db_obj.description else db_obj.name, 
                sku=sku, 
                price=price, 
                stock=stock, 
                category_id=category_id, 
                image_url=image_url if not db_obj.image_url else db_obj.image_url
            )
            await product_crud.update(db, db_obj=db_obj, obj_in=update_data)
        else:
            # Create
            await product_crud.create(db, obj_in=ProductCreate(
                name=name, sku=sku, ref_key=ref_key, price=price, stock=stock,
                category_id=category_id, image_url=image_url
            ))
        
        synced_count += 1
    
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
