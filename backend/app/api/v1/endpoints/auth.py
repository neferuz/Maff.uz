from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import random

from app.api import deps
from app.models.otp import OTP
from app.services.eskiz import send_otp
from pydantic import BaseModel

router = APIRouter()

class SendOtpRequest(BaseModel):
    phone: str

class VerifyOtpRequest(BaseModel):
    phone: str
    code: str

@router.post("/send-otp")
async def send_otp_endpoint(
    req: SendOtpRequest,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Send OTP code to the provided phone number.
    """
    # Generate 4-digit code
    code = str(random.randint(1000, 9999))
    
    # Clean phone (remove spaces, etc)
    clean_phone = "".join(filter(str.isdigit, req.phone))
    if not clean_phone.startswith("998"):
        clean_phone = "998" + clean_phone[-9:]
    
    expires = datetime.utcnow() + timedelta(minutes=5)
    
    otp_record = OTP(phone=clean_phone, code=code, expires_at=expires, is_used=False)
    db.add(otp_record)
    await db.commit()
    
    # Attempt to send via Eskiz
    success = await send_otp(clean_phone, code)
    if not success:
        # We don't fail the request completely to allow testing without real Eskiz credentials,
        # but in production you might want to raise an HTTPException here.
        pass
        
    # For testing, we can print the code
    print(f"DEBUG: OTP for {clean_phone} is {code}")
    
    return {"status": "ok", "message": "OTP sent successfully"}

@router.post("/verify-otp")
async def verify_otp_endpoint(
    req: VerifyOtpRequest,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Verify OTP code for the phone number.
    """
    clean_phone = "".join(filter(str.isdigit, req.phone))
    if not clean_phone.startswith("998"):
        clean_phone = "998" + clean_phone[-9:]
        
    query = select(OTP).filter(
        OTP.phone == clean_phone,
        OTP.code == req.code,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).order_by(OTP.id.desc())
    
    result = await db.execute(query)
    otp_record = result.scalars().first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    # Mark as used
    otp_record.is_used = True
    db.add(otp_record)
    await db.commit()
    
    return {"status": "ok", "message": "OTP verified successfully"}
