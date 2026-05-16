import asyncio
from app.db.session import AsyncSessionLocal
from app.models.product import Product, Category
from sqlalchemy import select

async def seed_products():
    async with AsyncSessionLocal() as session:
        # Add categories
        categories = [
            {"name": "Ламинат", "description": "Качественный ламинат"},
            {"name": "Паркет", "description": "Натуральный паркет"},
            {"name": "Плинтус", "description": "Аксессуары для пола"}
        ]
        
        for cat_data in categories:
            stmt = select(Category).where(Category.name == cat_data["name"])
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                session.add(Category(**cat_data))
        
        await session.commit()
        
        # Get category IDs
        stmt = select(Category)
        result = await session.execute(stmt)
        all_cats = result.scalars().all()
        cat_map = {c.name: c.id for c in all_cats}
        
        # Add products
        products = [
            {
                "name": "Ламинат Kronopol Platinium",
                "price": 150000.0,
                "category_id": cat_map["Ламинат"],
                "stock": 100.0,
                "image_url": "/spacejoy-9M66C_w_ToM-unsplash.jpg",
                "brand": "Kronopol",
                "country": "Польша",
                "grade": "33 класс",
                "thickness": "8мм"
            },
            {
                "name": "Паркетная доска Tarkett",
                "price": 450000.0,
                "category_id": cat_map["Паркет"],
                "stock": 50.0,
                "image_url": "/kam-idris-U39FPHKfDu0-unsplash.jpg",
                "brand": "Tarkett",
                "country": "Сербия",
                "grade": "Премиум",
                "thickness": "14мм"
            }
        ]
        
        for p_data in products:
            stmt = select(Product).where(Product.name == p_data["name"])
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                session.add(Product(**p_data))
        
        await session.commit()
    print("Products and Categories seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_products())
