import asyncio
import json
from app.db.session import AsyncSessionLocal
from app.models.page import PageContent
from sqlalchemy import select

async def seed_pages():
    async with AsyncSessionLocal() as session:
        pages = [
            {
                "slug": "faq",
                "content": {
                    "title": "Часто задаваемые вопросы",
                    "faqs": [
                        {"question": "Как сделать заказ?", "answer": "Выберите товар и добавьте его в корзину."},
                        {"question": "Есть ли доставка?", "answer": "Да, мы доставляем по всему Узбекистану."}
                    ]
                }
            },
            {
                "slug": "about",
                "content": {
                    "title": "О компании Maff",
                    "description": "Мы - лидеры рынка напольных покрытий.",
                    "stats": [
                        {"label": "Опыт", "value": "10 лет"}
                    ]
                }
            },
            {
                "slug": "contact",
                "content": {
                    "title": "Контакты",
                    "address": "г. Ташкент, ул. Примерная, 1",
                    "phone": "+998 71 123 45 67",
                    "email": "info@maff.uz"
                }
            },
            {
                "slug": "partners-main",
                "content": {
                    "title": "Развивайте бизнес вместе с MAFF",
                    "subtitle": "Сотрудничество",
                    "description": "Мы создаем экосистему для профессионалов рынка отделочных материалов. Выберите свою категорию, чтобы узнать о преимуществах работы с нами.",
                    "partnerTypes": [
                        { "slug": "masters", "title": "Мастерам", "description": "Специальные условия для профессиональных монтажников и укладчиков." },
                        { "slug": "developers", "title": "Застройщикам", "description": "Комплексные решения для строительных компаний и девелоперов." },
                        { "slug": "designers", "title": "Дизайнерам", "description": "Эксклюзивные каталоги и гибкие условия для дизайн-студий и архитекторов." },
                        { "slug": "foremen", "title": "Прорабам", "description": "Надежные поставки и техническая поддержка для руководителей объектов." },
                        { "slug": "dealers", "title": "Дилерам", "description": "Возможность стать официальным представителем ведущих брендов в вашем регионе." }
                    ]
                }
            },
            {
                "slug": "delivery",
                "content": {
                    "title": "Доставка и оплата",
                    "description": "Условия доставки по Узбекистану."
                }
            },
            {
                "slug": "showrooms",
                "content": [
                    {
                        "id": 1,
                        "name": "Главный Шоурум Ташкент",
                        "address": "г. Ташкент, ул. Фурката, 15",
                        "phone": "+998 71 200 00 01",
                        "hours": "Пн-Сб: 09:00 - 19:00",
                        "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!1s0x3eb33f63ed39486d:0x960c917d23d853e5!2zVGFzaGtlbnQsIFV6YmVraXN0YW4!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f63ed39486d%3A0x960c917d23d853e5!2zVGFzaGtlbnQsIFV6YmVraXN0YW4!5e0!3m2!1sen!2s!4v1715785555555"
                    },
                    {
                        "id": 2,
                        "name": "Maff Самарканд",
                        "address": "г. Самарканд, ул. Дагбитская, 10",
                        "phone": "+998 66 233 44 55",
                        "hours": "Пн-Сб: 10:00 - 18:00",
                        "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!1s0x3f4d193962635933:0x415b3c847e0915f0!2zU2FtYXJrYW5kLCBVemJla2lzdGFu!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f4d193962635933%3A0x415b3c847e0915f0!2zU2FtYXJrYW5kLCBVemJla2lzdGFu!5e0!3m2!1sen!2s!4v1715785555556"
                    }
                ]
            },
            {
                "slug": "certificates",
                "content": {
                    "title": "Сертификаты",
                    "description": "Наши сертификаты качества."
                }
            },
            {
                "slug": "footer",
                "content": {
                    "description": "Ведущий дистрибьютор напольных покрытий и дверей в Узбекистане. 20 лет опыта, 17 международных брендов и безупречный сервис.",
                    "phone": "+998 71 205 54 54",
                    "address": "г. Ташкент, ул. Уста Ширин",
                    "telegram": "https://t.me/maffuzbekistan",
                    "instagram": "https://www.instagram.com/maff.uz?igsh=MTJ5b2VwbHl1eTBodQ%3D%3D&utm_source=qr",
                    "facebook": "https://www.facebook.com/maff.uzb/?locale=ru_RU"
                }
            }
        ]
        
        for p in pages:
            stmt = select(PageContent).where(PageContent.slug == p["slug"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                existing.content = p["content"]
            else:
                session.add(PageContent(slug=p["slug"], content=p["content"]))
        
        await session.commit()
    print("Additional pages seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_pages())
