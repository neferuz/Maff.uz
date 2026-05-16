import json
from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product, Category
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate, CategoryUpdate

class CRUDProduct:
    async def get(self, db: AsyncSession, id: int) -> Optional[Product]:
        result = await db.execute(select(Product).filter(Product.id == id))
        return result.scalars().first()

    async def get_by_ref_key(self, db: AsyncSession, ref_key: str) -> Optional[Product]:
        result = await db.execute(select(Product).filter(Product.ref_key == ref_key))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Product]:
        result = await db.execute(select(Product).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_multi_by_category(self, db: AsyncSession, *, category_id: int, skip: int = 0, limit: int = 100) -> List[Product]:
        result = await db.execute(select(Product).filter(Product.category_id == category_id).offset(skip).limit(limit))
        return result.scalars().all()

    async def search(self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100) -> List[Product]:
        result = await db.execute(
            select(Product)
            .filter(
                (Product.name.ilike(f"%{query}%")) | 
                (Product.brand.ilike(f"%{query}%"))
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: ProductCreate) -> Product:
        db_obj = Product(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: Product, obj_in: ProductUpdate) -> Product:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

class CRUDCategory:
    async def get(self, db: AsyncSession, id: int) -> Optional[Category]:
        result = await db.execute(select(Category).filter(Category.id == id))
        return result.scalars().first()

    async def get_by_ref_key(self, db: AsyncSession, ref_key: str) -> Optional[Category]:
        result = await db.execute(select(Category).filter(Category.ref_key == ref_key))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Category]:
        result = await db.execute(select(Category).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CategoryCreate) -> Category:
        db_obj = Category(**obj_in.model_dump())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: Category, obj_in: CategoryUpdate) -> Category:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

product_crud = CRUDProduct()
category_crud = CRUDCategory()
