import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import select
from app.models.user import User
from app.core.security import get_password_hash

async def main():
    async with AsyncSessionLocal() as db:
        phone = "998935653801"
        password = "12345678"
        
        result = await db.execute(select(User).filter(User.phone == phone))
        user = result.scalar_one_or_none()
        
        if user:
            print("User exists, updating password.")
            user.hashed_password = get_password_hash(password)
        else:
            print("Creating new user.")
            user = User(
                phone=phone,
                email=f"{phone}@maff.uz",
                full_name="Admin",
                hashed_password=get_password_hash(password),
                is_active=True,
                is_superuser=True
            )
            db.add(user)
        
        await db.commit()
        print("Success!")

if __name__ == "__main__":
    asyncio.run(main())
