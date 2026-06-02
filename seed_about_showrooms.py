import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@192.168.183.35/maff_db"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # About
        about_content = {
            "hero": {
                "title": "О компании Maff",
                "description": "Ведущий дистрибьютор напольных покрытий и дверей в Узбекистане. Мы создаем эстетику и комфорт в вашем доме.",
                "image": "https://maff.uz/static/uploads/1416908c-19ed-41d7-b077-0650f4f06369.png"
            },
            "stats": [
                {"label": "Опыт работы", "value": "10+ лет"},
                {"label": "Довольных клиентов", "value": "5000+"},
                {"label": "Международных брендов", "value": "17+"}
            ],
            "values": [
                {
                    "icon": "Shield",
                    "title": "Надежность",
                    "description": "Мы гарантируем качество всей поставляемой продукции и несем ответственность перед каждым клиентом."
                },
                {
                    "icon": "Award",
                    "title": "Профессионализм",
                    "description": "Наша команда состоит из экспертов, готовых помочь в решении самых сложных задач."
                },
                {
                    "icon": "HeartHandshake",
                    "title": "Забота о клиенте",
                    "description": "Мы ценим доверие наших клиентов и стремимся превзойти их ожидания."
                }
            ],
            "milestones": [
                {"year": "2014", "title": "Основание компании и открытие первого магазина"},
                {"year": "2018", "title": "Стали эксклюзивными дистрибьюторами ведущих брендов"},
                {"year": "2022", "title": "Открытие крупнейшего шоурума в Ташкенте"},
                {"year": "2024", "title": "Запуск нового цифрового портала Maff.uz"}
            ],
            "mission": {
                "title": "Наша миссия",
                "description": "Сделать процесс выбора и покупки отделочных материалов максимально удобным, прозрачным и приятным для каждого клиента в Узбекистане.",
                "values": [
                    {"icon": "Target", "title": "Лидерство", "desc": "Быть номером один на рынке отделочных материалов."},
                    {"icon": "Globe", "title": "Доступность", "desc": "Делать мировые бренды доступными для всех."}
                ]
            },
            "team": [
                {"name": "Команда Maff", "role": "Эксперты по интерьеру", "image": "https://maff.uz/static/uploads/1416908c-19ed-41d7-b077-0650f4f06369.png"}
            ]
        }
        
        # Showrooms
        showrooms_content = [
            {
                "id": 1,
                "name": "Maff Уста Ширин (Главный шоурум)",
                "address": "г. Ташкент, ул. Уста Ширин, стройрынок Джами",
                "phone": "+998 71 205 54 54",
                "hours": "Ежедневно: 09:00 - 18:00",
                "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!1s0x38aef53856a4220b%3A0xda03d09210c4314c!2zNDHCsDIxJzMwLjAiTiA2OcKwMTInMDguMCJF!5e0!3m2!1sru!2s!4v1716301234567!5m2!1sru!2s"
            },
            {
                "id": 2,
                "name": "Maff Самарканд",
                "address": "г. Самарканд, ул. Мирзо Улугбека, 50",
                "phone": "+998 90 123 45 67",
                "hours": "Пн-Сб: 09:00 - 18:00",
                "mapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m1!1s0x3f4d191960077df7%3A0x487636d9d13f2f57!2zU2FtYXJrYW5k!5e0!3m2!1sru!2s!4v1716301234568!5m2!1sru!2s"
            }
        ]
        
        await session.execute(text("UPDATE pagecontent SET content = :content WHERE slug = 'about'"), {"content": json.dumps(about_content)})
        await session.execute(text("UPDATE pagecontent SET content = :content WHERE slug = 'showrooms'"), {"content": json.dumps(showrooms_content)})
        
        await session.commit()
        print("Successfully updated about and showrooms!")
    
    await engine.dispose()

asyncio.run(main())
