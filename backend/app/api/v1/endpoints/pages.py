from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=list[schemas.PageContent])
async def get_pages(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all pages.
    """
    pages = await crud.page.get_multi(db, skip=skip, limit=limit)
    return pages

@router.get("/{slug}", response_model=schemas.PageContent)
async def get_page_content(
    slug: str,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get page content by slug.
    """
    page = await crud.page.get_by_slug(db, slug=slug)
    if not page:
        raise HTTPException(status_code=404, detail="Page content not found")
    return page

@router.post("/", response_model=schemas.PageContent)
async def create_or_update_page_content(
    *,
    db: AsyncSession = Depends(deps.get_db),
    obj_in: schemas.PageContentCreate,
) -> Any:
    """
    Create or update page content.
    """
    page = await crud.page.create_or_update(db, obj_in=obj_in)
    return page
