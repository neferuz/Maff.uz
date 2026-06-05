import sqlite3

def update():
    conn = sqlite3.connect('maff.db')
    cursor = conn.cursor()
    
    # Check if phone column exists in user table
    cursor.execute("PRAGMA table_info(user)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "phone" not in columns:
        cursor.execute("ALTER TABLE user ADD COLUMN phone VARCHAR")
        print("Added phone column to user table")
    else:
        print("phone column already exists in user table")
        
    # Check if otp table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='otp'")
    if not cursor.fetchone():
        cursor.execute("""
        CREATE TABLE otp (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            phone VARCHAR NOT NULL,
            code VARCHAR NOT NULL,
            expires_at DATETIME NOT NULL,
            is_used BOOLEAN DEFAULT 0
        )
        """)
        cursor.execute("CREATE INDEX ix_otp_phone ON otp(phone)")
        print("Created otp table")
    else:
        print("otp table already exists")
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    update()
