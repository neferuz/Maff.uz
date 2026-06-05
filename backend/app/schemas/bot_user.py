from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BotUserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class BotUserCreate(BotUserBase):
    pass

class BotUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None

class BotUserResponse(BotUserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
