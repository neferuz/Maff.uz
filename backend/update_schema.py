import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def upgrade_db():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@192.168.183.35/maff_db')
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE category ADD COLUMN is_order_only BOOLEAN DEFAULT FALSE;"))
        except Exception as e:
            print("is_order_only exists or error:", e)
        try:
            await conn.execute(text("ALTER TABLE category ADD COLUMN price_prefix VARCHAR;"))
        except Exception as e:
            print("price_prefix exists or error:", e)
        try:
            await conn.execute(text("ALTER TABLE category ADD COLUMN order_link VARCHAR;"))
        except Exception as e:
            print("order_link exists or error:", e)
    await engine.dispose()

asyncio.run(upgrade_db())
