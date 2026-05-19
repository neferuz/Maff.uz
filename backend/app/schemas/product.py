from typing import List, Optional, Any
from pydantic import BaseModel, model_validator
import json

class CategoryBase(BaseModel):
    name: str
    ref_key: Optional[str] = None
    parent_id: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    product_count: Optional[int] = 0
    is_active: bool = True

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    price_rub: Optional[float] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    stock: float = 0
    ref_key: Optional[str] = None
    is_active: bool = True
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    country: Optional[str] = None
    grade: Optional[str] = None
    thickness: Optional[str] = None
    pack_size: Optional[float] = 1.0
    images: Optional[List[str]] = None

    @model_validator(mode='before')
    @classmethod
    def parse_images(cls, data: Any) -> Any:
        if isinstance(data, dict):
            images = data.get('images')
            if isinstance(images, str):
                try:
                    data['images'] = json.loads(images)
                except:
                    data['images'] = []
        elif hasattr(data, 'images'):
            images = getattr(data, 'images')
            if isinstance(images, str):
                try:
                    setattr(data, 'images', json.loads(images))
                except:
                    setattr(data, 'images', [])
        return data

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_rub: Optional[float] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[float] = None
    ref_key: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None
    brand: Optional[str] = None
    country: Optional[str] = None
    grade: Optional[str] = None
    thickness: Optional[str] = None
    pack_size: Optional[float] = None
    images: Optional[List[str]] = None

class Product(ProductBase):
    id: int

    @model_validator(mode='after')
    def sanitize_fields(self) -> 'Product':
        from app.utils.sanitizer import sanitize_brand, sanitize_country
        self.brand = sanitize_brand(self.brand)
        self.country = sanitize_country(self.country)
        return self

    class Config:
        from_attributes = True
