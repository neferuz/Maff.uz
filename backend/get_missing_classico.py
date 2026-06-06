import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
import re
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT name
            FROM product 
            WHERE category_id = 426 AND is_active = false;
        """))
        
        products = result.fetchall()
        
        missing_models = set()
        
        for (name,) in products:
            if 'Образец' in name or 'Карниз' in name or 'Добор' in name or 'Наличник' in name or 'Плинтус' in name:
                continue
                
            base_name = re.sub(r'\s*2000\*\d+', '', name).strip()
            base_name = base_name.rstrip(',')
            missing_models.add(base_name)
            
        print("=== MISSING MODELS ===")
        for m in sorted(missing_models):
            print(m)

asyncio.run(main())
