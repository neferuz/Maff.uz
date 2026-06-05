from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User as UserModel
from app.schemas.token import Token
from app.schemas.user import User

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    username = form_data.username
    clean_phone = "".join(filter(str.isdigit, username))
    if clean_phone.startswith("998"):
        # Login by phone
        query = select(UserModel).filter(UserModel.phone == clean_phone)
    else:
        # Login by email
        query = select(UserModel).filter(UserModel.email == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # Simple password check for now (in production use passlib/bcrypt)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/login/test-token", response_model=User)
async def test_token(current_user: UserModel = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
