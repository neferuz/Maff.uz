import re

# 1. Update deps.py to add optional user and superuser
deps_path = "/Users/apple/Desktop/Maff.uz-main/backend/app/api/deps.py"
with open(deps_path, "r", encoding="utf-8") as f:
    deps_content = f.read()

if "get_current_user_optional" not in deps_content:
    deps_content += """
async def get_current_user_optional(
    db: AsyncSession = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token", auto_error=False))
) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = TokenPayload(**payload)
        query = select(User).filter(User.id == int(token_data.sub))
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if user and user.is_active:
            return user
    except:
        pass
    return None

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=400, detail="The user doesn't have enough privileges")
    return current_user
"""
    with open(deps_path, "w", encoding="utf-8") as f:
        f.write(deps_content)

# 2. Rewrite crud_order.py to be async
crud_path = "/Users/apple/Desktop/Maff.uz-main/backend/app/crud/crud_order.py"
crud_content = """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
from typing import List, Optional

async def create_order(db: AsyncSession, order_in: OrderCreate, user_id: Optional[int] = None) -> Order:
    db_order = Order(
        user_id=user_id,
        full_name=order_in.full_name,
        phone=order_in.phone,
        address=order_in.address,
        comments=order_in.comments,
        total_amount=order_in.total_amount,
        payment_method=order_in.payment_method,
        status="pending"
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    for item_in in order_in.items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item_in.product_id,
            product_name=item_in.product_name,
            product_image=item_in.product_image,
            quantity=item_in.quantity,
            price=item_in.price,
            size=item_in.size,
            color=item_in.color
        )
        db.add(db_item)
    
    await db.commit()
    await db.refresh(db_order)
    
    # Reload with items
    query = select(Order).options(selectinload(Order.items)).filter(Order.id == db_order.id)
    result = await db.execute(query)
    return result.scalar_one()

async def get_order(db: AsyncSession, order_id: int) -> Optional[Order]:
    query = select(Order).options(selectinload(Order.items)).filter(Order.id == order_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_orders_by_user(db: AsyncSession, user_id: int) -> List[Order]:
    query = select(Order).options(selectinload(Order.items)).filter(Order.user_id == user_id).order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def get_all_orders(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Order]:
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def update_order_status(db: AsyncSession, order_id: int, status: str) -> Optional[Order]:
    order = await get_order(db, order_id)
    if not order:
        return None
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order
"""
with open(crud_path, "w", encoding="utf-8") as f:
    f.write(crud_content)

# 3. Rewrite endpoints/orders.py to be async
api_path = "/Users/apple/Desktop/Maff.uz-main/backend/app/api/v1/endpoints/orders.py"
api_content = """from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud import crud_order
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    order_in: OrderCreate,
    current_user: User | None = Depends(deps.get_current_user_optional),
) -> Any:
    user_id = current_user.id if current_user else None
    order = await crud_order.create_order(db=db, order_in=order_in, user_id=user_id)
    return order

@router.get("/me", response_model=List[OrderResponse])
async def get_my_orders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return await crud_order.get_orders_by_user(db=db, user_id=current_user.id)

@router.get("/", response_model=List[OrderResponse])
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
"""
with open(api_path, "w", encoding="utf-8") as f:
    f.write(api_content)

print("Updated backend to async")
