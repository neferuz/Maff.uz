import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def main():
    engine = create_async_engine(os.getenv('DATABASE_URL'))
    
    async with engine.begin() as conn:
        # 1. Unarchive Паркет Silkwood
        res1 = await conn.execute(text("UPDATE product SET is_active = True WHERE name ILIKE 'Паркет Silkwood%'"))
        print(f"Restored {res1.rowcount} Silkwood products.")
        
        # 2. Unarchive and update Lines
        res2 = await conn.execute(text("UPDATE product SET is_active = True WHERE name ILIKE '%Lines (битум плитка)%'"))
        print(f"Restored {res2.rowcount} Lines products.")
        
        # Now update their images based on the files
        lines_codes = ["3644", "4144", "5236", "5241", "5253", "5269", "5276", "5376", "6923", "6957"]
        for code in lines_codes:
            path = f"/static/uploads/sargo/{code}.png"
            res3 = await conn.execute(
                text("UPDATE product SET image_url = :path WHERE name ILIKE :name"), 
                {"path": path, "name": f"%Lines (битум плитка) {code}%"}
            )
            print(f"Updated image for Lines {code}: {res3.rowcount} products")

asyncio.run(main())
