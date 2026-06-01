from sqlalchemy import Column, Integer, String, Text
from app.models.base import Base

class AutoTranslation(Base):
    __tablename__ = "autotranslation"
    
    id = Column(Integer, primary_key=True, index=True)
    locale = Column(String(10), index=True, nullable=False)
    entity_type = Column(String(50), index=True, nullable=False)
    entity_id = Column(String(255), index=True, nullable=False)
    field_name = Column(String(100), index=True, nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
