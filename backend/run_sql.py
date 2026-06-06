import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')

async def main():
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        with open("fix_classico.sql", "r") as f:
            queries = f.read().split(";")
            for q in queries:
                q = q.strip()
                if q:
                    result = await conn.execute(text(q))
                    print(f"Executed: {q[:50]}... -> Rows updated: {result.rowcount}")

asyncio.run(main())
