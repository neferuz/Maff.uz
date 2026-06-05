from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True) # null for guest orders
    
    # Contact & Delivery info
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    comments = Column(Text, nullable=True)
    
    # Payment and Status
    total_amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String, nullable=False, default="cod") # default cod
    status = Column(String, nullable=False, default="pending") # pending, processed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Item details
    product_id = Column(Integer, nullable=True)
    product_name = Column(String, nullable=False)
    product_image = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)
    
    # Variations
    size = Column(String, nullable=True)
    color = Column(String, nullable=True)
    
    # Relationships
    order = relationship("Order", back_populates="items")
