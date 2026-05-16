from typing import Optional
from pydantic import BaseModel

# Shared properties
class AddressBase(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    is_default: bool = False

# Properties to receive on creation
class AddressCreate(AddressBase):
    address: str

# Properties to receive on update
class AddressUpdate(AddressBase):
    pass

# Properties to return via API
class Address(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
