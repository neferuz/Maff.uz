from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import crud_order
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.models.user import User

router = APIRouter()

@router.post("", response_model=OrderResponse)
async def create_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    order_in: OrderCreate,
    current_user: Optional[User] = Depends(deps.get_current_user_optional),
) -> Any:
    user_id = current_user.id if current_user else None
    order = await crud_order.create_order(db=db, order_in=order_in, user_id=user_id)
    return order

@router.get("/me", response_model=List[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return await crud_order.get_orders_by_user(db=db, user_id=current_user.id, user_phone=current_user.phone)

@router.get("", response_model=List[OrderResponse])
async def get_orders(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    orders = await crud_order.get_all_orders(db=db, skip=skip, limit=limit)
    return orders

@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    order_id: int,
    order_in: OrderUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    order = await crud_order.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = await crud_order.update_order_status(db=db, order_id=order_id, status=order_in.status)
    return order
