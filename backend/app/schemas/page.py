from typing import Dict, Any
from pydantic import BaseModel

class PageContentBase(BaseModel):
    slug: str
    content: Any

class PageContentCreate(PageContentBase):
    pass

class PageContentUpdate(BaseModel):
    content: Any

class PageContent(PageContentBase):
    id: int

    class Config:
        from_attributes = True
