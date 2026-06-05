from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    price: float
    size: Optional[str] = None
    color: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        orm_mode = True
        from_attributes = True

class OrderBase(BaseModel):
    full_name: str
    phone: str
    address: str
    comments: Optional[str] = None
    total_amount: float
    payment_method: str = "cod"

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    user_id: Optional[int] = None
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True
        from_attributes = True
