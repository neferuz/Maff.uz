import asyncio
from app.db.session import engine
from app.crud.crud_order import get_orders_by_user, get_all_orders

async def main():
    async with engine.begin() as conn:
        print("Fetching orders for user 1...")
        orders = await get_orders_by_user(conn, 1)
        for o in orders:
            print(f"Order: {o.id}, Total: {o.total_amount}, Items: {[i.product_name for i in o.items]}")
            
        print("Fetching all orders...")
        all_orders = await get_all_orders(conn)
        for o in all_orders:
             print(f"Order: {o.id}, User: {o.user_id}, Total: {o.total_amount}, Items: {[i.product_name for i in o.items]}")

asyncio.run(main())
