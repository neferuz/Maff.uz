import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@192.168.183.35/maff_db')
    
    # Check if table exists
    exists = await conn.fetchval(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_user')"
    )
    
    if not exists:
        await conn.execute("""
            CREATE TABLE bot_user (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT UNIQUE NOT NULL,
                username VARCHAR,
                first_name VARCHAR,
                last_name VARCHAR,
                phone VARCHAR,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await conn.execute("CREATE INDEX ix_bot_user_telegram_id ON bot_user(telegram_id)")
        print("Created bot_user table in PostgreSQL")
    else:
        print("bot_user table already exists in PostgreSQL")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
