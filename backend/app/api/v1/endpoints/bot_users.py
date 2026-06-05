from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.bot_user import BotUser
from app.schemas.bot_user import BotUserCreate, BotUserUpdate, BotUserResponse

router = APIRouter()

@router.post("/", response_model=BotUserResponse)
async def create_or_update_bot_user(user_in: BotUserCreate, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(BotUser).filter(BotUser.telegram_id == user_in.telegram_id))
    user = result.scalars().first()
    
    if not user:
        user = BotUser(**user_in.dict())
        db.add(user)
    else:
        update_data = user_in.dict(exclude_unset=True)
        for field in update_data:
            if update_data[field] is not None:
                setattr(user, field, update_data[field])
                
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/", response_model=List[BotUserResponse])
async def get_bot_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(BotUser).order_by(BotUser.created_at.desc()).offset(skip).limit(limit))
    users = result.scalars().all()
    return users
