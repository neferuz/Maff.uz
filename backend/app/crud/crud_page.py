from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.page import PageContent
from app.schemas.page import PageContentCreate, PageContentUpdate

class CRUDPage:
    async def get_by_slug(self, db: AsyncSession, slug: str) -> Optional[PageContent]:
        result = await db.execute(select(PageContent).where(PageContent.slug == slug))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> list[PageContent]:
        result = await db.execute(select(PageContent).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create_or_update(self, db: AsyncSession, *, obj_in: PageContentCreate) -> PageContent:
        db_obj = await self.get_by_slug(db, slug=obj_in.slug)
        if db_obj:
            db_obj.content = obj_in.content
        else:
            db_obj = PageContent(slug=obj_in.slug, content=obj_in.content)
            db.add(db_obj)
        
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

page = CRUDPage()
