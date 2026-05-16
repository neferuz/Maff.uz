from sqlalchemy import Column, Integer, String, JSON
from app.models.base import Base

class PageContent(Base):
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)  # e.g., "home"
    content = Column(JSON, nullable=False)  # stores the hero section, categories data, etc.
