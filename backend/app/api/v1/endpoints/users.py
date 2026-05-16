from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    """
    Create new user.
    """
    query = select(UserModel).filter(UserModel.email == user_in.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_data = user_in.dict()
    password = user_data.pop("password")
    hashed_password = get_password_hash(password)
    
    user = UserModel(**user_data, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
