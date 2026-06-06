import asyncio
import os
import json
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    async with engine.begin() as conn:
        # 1. Archive the 3 Lines products without photos
        res1 = await conn.execute(text("UPDATE product SET is_active = False WHERE name ILIKE '%3869%' OR name ILIKE '%3844%' OR name ILIKE '%3857%'"))
        print(f"Archived {res1.rowcount} missing-photo Lines products.")
        
        # 2. Update Gravity Info
        gravity_desc = "<p><strong>Битумная ковровая плитка SAG Gravity</strong> — износостойкое модульное покрытие для коммерческих помещений с высокой нагрузкой. Прочная битумная основа обеспечивает стабильность размеров, долговечность и хорошую шумоизоляцию, а петлевой нейлоновый ворс устойчив к истиранию и сохраняет аккуратный внешний вид даже при интенсивной эксплуатации. Отличное решение для офисов, шоурумов и других коммерческих пространств.</p>"
        
        gravity_specs = json.dumps({
            "Плотность": "208000 г/м2",
            "Основа": "Битумная",
            "Высота ворса": "3 мм",
            "Материал нити": "Нейлон",
            "Страна производителя": "Узбекистан",
            "Бренд": "SAG"
        }, ensure_ascii=False)
        
        res2 = await conn.execute(
            text("UPDATE product SET description = :desc, specifications = :specs, brand = 'SAG', country = 'Узбекистан' WHERE name ILIKE '%Gravity (битум плитка)%'"),
            {"desc": gravity_desc, "specs": gravity_specs}
        )
        print(f"Updated info for {res2.rowcount} Gravity products.")
        
        # 3. Update Lines Info
        lines_desc = "<p><strong>Битумная ковровая плитка SAG Lines</strong> — износостойкое модульное покрытие для коммерческих помещений с высокой нагрузкой. Прочная битумная основа обеспечивает стабильность размеров, долговечность и хорошую шумоизоляцию, а петлевой нейлоновый ворс устойчив к истиранию и сохраняет аккуратный внешний вид даже при интенсивной эксплуатации. Отличное решение для офисов, шоурумов и других коммерческих пространств.</p>"
        
        res3 = await conn.execute(
            text("UPDATE product SET description = :desc, specifications = :specs, brand = 'SAG', country = 'Узбекистан' WHERE name ILIKE '%Lines (битум плитка)%'"),
            {"desc": lines_desc, "specs": gravity_specs}
        )
        print(f"Updated info for {res3.rowcount} Lines products.")

asyncio.run(main())
