from sqlalchemy.ext.asyncio import AsyncSession
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
