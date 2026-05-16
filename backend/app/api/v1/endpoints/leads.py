from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.api import deps
from app.models.lead import Lead as LeadModel
from app.schemas.lead import Lead, LeadCreate, LeadUpdate

router = APIRouter()

@router.post("/", response_model=Lead)
async def create_lead(
    *,
    db: AsyncSession = Depends(deps.get_db),
    lead_in: LeadCreate
) -> Any:
    """
    Create a new lead (public).
    """
    lead = LeadModel(**lead_in.dict())
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

@router.get("/", response_model=List[Lead])
async def read_leads(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve leads (admin only).
    """
    query = select(LeadModel).order_by(LeadModel.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    leads = result.scalars().all()
    return leads

@router.patch("/{id}", response_model=Lead)
async def update_lead(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    lead_in: LeadUpdate,
) -> Any:
    """
    Update lead status (admin only).
    """
    query = select(LeadModel).filter(LeadModel.id == id)
    result = await db.execute(query)
    lead = result.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.status = lead_in.status
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

@router.delete("/{id}", response_model=Lead)
async def delete_lead(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete a lead (admin only).
    """
    query = select(LeadModel).filter(LeadModel.id == id)
    result = await db.execute(query)
    lead = result.scalar_one_or_none()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    await db.delete(lead)
    await db.commit()
    return lead
