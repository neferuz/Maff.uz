from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LeadBase(BaseModel):
    name: str
    phone: str
    subject: Optional[str] = None
    message: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    status: str

class Lead(LeadBase):
    id: int
    created_at: datetime
    status: str

    class Config:
        from_attributes = True
