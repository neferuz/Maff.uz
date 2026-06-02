import asyncio
from app.db.session import AsyncSessionLocal
from app.models.page import PageContent
from sqlalchemy import select

async def seed_warranty():
    async with AsyncSessionLocal() as session:
        stmt = select(PageContent).where(PageContent.slug == "warranty")
        result = await session.execute(stmt)
        page = result.scalar_one_or_none()
        
        content = {
            "title": "Гарантия и Возврат",
            "description": "Мы берем на себя полную ответственность за продукцию. Каждый клиент MAFF защищен официальными обязательствами производителей.",
            "features": [
                {
                    "icon": "ShieldPlus",
                    "title": "Заводская гарантия",
                    "description": "Официальная поддержка от производителя до 30 лет. Мы дистрибьюторы всех брендов.",
                    "meta": "Гарантийный талон"
                },
                {
                    "icon": "RotateCcw",
                    "title": "Легкий возврат",
                    "description": "Обмен или возврат неиспользованного товара в течение 14 дней без лишних вопросов.",
                    "meta": "Закон РУз"
                },
                {
                    "icon": "BadgeCheck",
                    "title": "Оригинал 100%",
                    "description": "Двойной контроль качества на соответствие геометрии перед каждой отгрузкой.",
                    "meta": "Контроль MAFF"
                }
            ],
            "steps": [
                { "t": "Заявление", "d": "Бланк возврата в любом из шоу-румов." },
                { "t": "Осмотр", "d": "Проверка сохранности упаковки товара." },
                { "t": "Возврат", "d": "Выплата средств тем же способом оплаты." }
            ]
        }
        
        if not page:
            print("Seeding warranty page...")
            page = PageContent(slug="warranty", content=content)
            session.add(page)
        else:
            print("Skipping warranty page, already exists.")
        
        await session.commit()
    print("Warranty page content seeded successfully in DB!")

if __name__ == "__main__":
    asyncio.run(seed_warranty())
