from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

from app.api import deps
from app.models.address import Address as AddressModel
from app.models.user import User as UserModel
from app.schemas.address import Address, AddressCreate, AddressUpdate

router = APIRouter()

@router.get("/", response_model=List[Address])
async def read_addresses(
    db: AsyncSession = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve current user's addresses.
    """
    query = select(AddressModel).filter(AddressModel.user_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=Address)
async def create_address(
    *,
    db: AsyncSession = Depends(deps.get_db),
    address_in: AddressCreate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Create new address for current user.
    """
    address = AddressModel(**address_in.dict(), user_id=current_user.id)
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address

@router.put("/{address_id}", response_model=Address)
async def update_address(
    *,
    db: AsyncSession = Depends(deps.get_db),
    address_id: int,
    address_in: AddressUpdate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Update an address.
    """
    query = select(AddressModel).filter(AddressModel.id == address_id, AddressModel.user_id == current_user.id)
    result = await db.execute(query)
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    update_data = address_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(address, field, value)
    
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address

@router.delete("/{address_id}", response_model=Address)
async def delete_address(
    *,
    db: AsyncSession = Depends(deps.get_db),
    address_id: int,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """
    Delete an address.
    """
    query = select(AddressModel).filter(AddressModel.id == address_id, AddressModel.user_id == current_user.id)
    result = await db.execute(query)
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    await db.delete(address)
    await db.commit()
    return address
