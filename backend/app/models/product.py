from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base

class Category(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    ref_key = Column(String, unique=True, index=True, nullable=True)  # 1C UUID
    parent_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0)
    
    is_order_only = Column(Boolean, default=False)
    is_preorder = Column(Boolean, default=False)
    price_prefix = Column(String, nullable=True)
    order_link = Column(String, nullable=True)
    recommended_accessories = Column(JSON, nullable=True)
    attributes = Column(JSON, nullable=True, default=list)  # [{"name": "Класс износостойкости", "type": "text"}]
    
    products = relationship("Product", back_populates="category")
    children = relationship("Category", backref="parent", remote_side=[id])

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    price_rub = Column(Float, nullable=True)
    price_outlet = Column(Float, nullable=True)
    price_outlet_usd = Column(Float, nullable=True)
    price_outlet_wholesale = Column(Float, nullable=True)
    sku = Column(String, index=True)
    unit = Column(String, nullable=True)
    stock = Column(Float, default=0)
    ref_key = Column(String, unique=True, index=True, nullable=True)  # 1C UUID
    is_active = Column(Boolean, default=True)
    image_url = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), index=True)
    
    brand = Column(String, nullable=True)
    country = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    thickness = Column(String, nullable=True)
    pack_size = Column(Float, default=1.0)
    images = Column(JSON, nullable=True) # List of URLs
    specifications = Column(JSON, nullable=True, default=dict)  # {"Класс износостойкости": "Premium"}

    category = relationship("Category", back_populates="products")
