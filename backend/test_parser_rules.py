import asyncio
import re
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

def test_parse(name):
    # Detect opening
    opening = "Стандарт"
    if re.search(r'\bлевая\b|\bлевое\b|\bL\b|\bL\s+\d', name, re.IGNORECASE):
        opening = "Левая"
    elif re.search(r'\bправая\b|\bправое\b|\bR\b|\bR\s+\d', name, re.IGNORECASE):
        opening = "Правая"
    elif re.search(r'\bуниверсальное\b|\bуниверсальная\b|\bU\b|\bU\s+\d', name, re.IGNORECASE):
        opening = "Универсальная"

    # Detect routing
    routing = "Без врезки" # Default to Без врезки or Не указано? Let's check.
    if re.search(r'Без врезки|без\s+врез', name, re.IGNORECASE):
        routing = "Без врезки"
    elif re.search(r'с врезкой|с врез\.|врезка|\bврез\b|\bс\s+вр\b|под\s+\d+\s+пет|\b[LRU]\s+\d\b', name, re.IGNORECASE):
        routing = "С врезкой"
        
    return opening, routing

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(text(
            "SELECT id, name FROM product WHERE name ILIKE '%Filomuro%' OR name ILIKE '%Elen%' OR name ILIKE '%Planum%' OR name ILIKE '%Wall Door%'"
        ))
        rows = res.fetchall()
        
        combinations = {}
        for row in rows:
            pid, name = row
            op, rout = test_parse(name)
            key = (op, rout)
            combinations[key] = combinations.get(key, 0) + 1
            
            # Print specifically the ones that were previously "Не указано" or had "с вр."
            if "с вр." in name.lower() or "под покр" in name.lower():
                print(f"Name: '{name}'\n  -> Op: {op} | Rout: {rout}")
                print("-" * 50)
                
        print("\nDistribution of (Opening, Routing):")
        for key, count in combinations.items():
            print(f"  {key}: {count}")

if __name__ == "__main__":
    asyncio.run(main())
