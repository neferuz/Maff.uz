import asyncio
import json
from app.db.session import AsyncSessionLocal
from app.models.page import PageContent
from sqlalchemy import select

async def seed_home():
    async with AsyncSessionLocal() as session:
        # Check if home page exists
        stmt = select(PageContent).where(PageContent.slug == "home")
        result = await session.execute(stmt)
        home_page = result.scalar_one_or_none()
        
        content = {
            "hero": {
                "badge": "Премиум покрытия для пола",
                "title": "Создайте уют в вашем доме с Maff",
                "highlightWord": "Maff",
                "subtitle": "Широкий выбор ламината, паркета и аксессуаров от лучших производителей.",
                "primaryButton": {"text": "В каталог", "link": "/catalog"},
                "secondaryButton": {"text": "О нас", "link": "/about"},
                "features": [
                    {"icon": "CheckCircle2", "text": "Гарантия качества"},
                    {"icon": "Truck", "text": "Быстрая доставка"}
                ],
                "images": [
                    { "url": "/spacejoy-9M66C_w_ToM-unsplash.jpg", "link": "/catalog" },
                    { "url": "/kam-idris-U39FPHKfDu0-unsplash.jpg", "link": "/catalog" }
                ]
            },
            "about": {
                "title": "О компании Maff.uz",
                "description": "Мы предлагаем только лучшие решения для вашего интерьера.",
                "stats": [
                    {"label": "Лет на рынке", "value": "10+"},
                    {"label": "Довольных клиентов", "value": "5000+"},
                    {"label": "Товаров в наличии", "value": "1000+"}
                ]
            },
            "brands": [
                {"name": "Maff", "link": "/catalog?brand=Maff"},
                {"name": "Kronopol", "link": "/catalog?brand=Kronopol"},
                {"name": "Tarkett", "link": "/catalog?brand=Tarkett"},
                {"name": "Classen", "link": "/catalog?brand=Classen"}
            ]
        }
        
        if home_page:
            home_page.content = content
        else:
            home_page = PageContent(slug="home", content=content)
            session.add(home_page)
        
        await session.commit()
    print("Home page seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_home())
