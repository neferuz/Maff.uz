import sqlite3

def upgrade():
    conn = sqlite3.connect('maff.db')
    cursor = conn.cursor()
    
    # Check if bot_user table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bot_user'")
    if not cursor.fetchone():
        cursor.execute("""
        CREATE TABLE bot_user (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            telegram_id BIGINT NOT NULL UNIQUE,
            username VARCHAR,
            first_name VARCHAR,
            last_name VARCHAR,
            phone VARCHAR,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)
        cursor.execute("CREATE INDEX ix_bot_user_telegram_id ON bot_user(telegram_id)")
        print("Created bot_user table")
    else:
        print("bot_user table already exists")
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    upgrade()
