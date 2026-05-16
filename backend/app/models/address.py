from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class Address(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    name = Column(String, index=True) # e.g. "Home", "Work"
    address = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="addresses")
