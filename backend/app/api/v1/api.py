from fastapi import APIRouter
from app.api.v1.endpoints import pages, uploads, products, categories, leads, login, users, addresses

api_router = APIRouter()

api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(addresses.router, prefix="/addresses", tags=["addresses"])
api_router.include_router(pages.router, prefix="/pages", tags=["pages"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
