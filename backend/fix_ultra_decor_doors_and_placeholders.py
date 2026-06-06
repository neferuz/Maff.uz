import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

# Laminate products under category 316 with door placeholder images to archive
laminate_ids_to_archive = [
    261, 262, 263, 264, 265, 266, 267, 268, # MAJESTIC
    276, 277, 278, 279, 280, 281, 282       # Art (laminate models)
]

# Actual door products to move to category 176 (Двери ZADOOR)
door_ids_to_move = [1170, 1171, 1172]

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        # 1. Archive the laminates with door placeholders
        print("Archiving laminates with door placeholder images under category 316...")
        archive_query = f"UPDATE product SET is_active = False WHERE id IN ({','.join(map(str, laminate_ids_to_archive))})"
        res_arch = await conn.execute(text(archive_query))
        print(f"Successfully archived {res_arch.rowcount} laminate products.")
        
        # 2. Move actual door products to Category 176 (Двери ZADOOR)
        print("\nMoving actual door products (Art-Lite Elen ПГ) to doors category (176)...")
        move_query = f"UPDATE product SET category_id = 176 WHERE id IN ({','.join(map(str, door_ids_to_move))})"
        res_move = await conn.execute(text(move_query))
        print(f"Successfully moved {res_move.rowcount} door products to Category 176.")

if __name__ == "__main__":
    asyncio.run(main())
