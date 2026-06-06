import httpx
import os
from app.core.config import settings
from typing import Optional

BASE_URL = "https://notify.eskiz.uz/api"
_ESKIZ_TOKEN = None

async def get_token() -> Optional[str]:
    global _ESKIZ_TOKEN
    # Check if cached token is still valid? (For simplicity, just fetch or cache it in a basic way)
    if _ESKIZ_TOKEN:
        return _ESKIZ_TOKEN
        
    email = settings.ESKIZ_EMAIL
    password = settings.ESKIZ_PASSWORD
    
    if not email or not password:
        print("Eskiz credentials missing in .env")
        return None

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BASE_URL}/auth/login",
                data={"email": email, "password": password}
            )
            if resp.status_code == 200:
                data = resp.json()
                _ESKIZ_TOKEN = data["data"]["token"]
                return _ESKIZ_TOKEN
    except Exception as e:
        print(f"Failed to get Eskiz token: {e}")
    return None

async def send_otp(phone: str, code: str) -> bool:
    token = await get_token()
    if not token:
        print("Warning: Skipping SMS sending because Eskiz is not configured or auth failed.")
        return True # Return true so flow doesn't block in dev

    message = f"Код подтверждения для регистрации на сайте Maff.uz: {code}"
    # Remove '+' or spaces from phone for Eskiz API
    clean_phone = "".join(filter(str.isdigit, phone))
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BASE_URL}/message/sms/send",
                headers={"Authorization": f"Bearer {token}"},
                data={
                    "mobile_phone": clean_phone,
                    "message": message,
                    "from": "4546"
                }
            )
            if resp.status_code == 200:
                return True
            else:
                print(f"Eskiz error: {resp.text}")
                # Try token refresh if unauthorized
                if resp.status_code == 401:
                    global _ESKIZ_TOKEN
                    _ESKIZ_TOKEN = None
                    # Optionally retry here once
                return False
    except Exception as e:
        print(f"Eskiz exception: {e}")
        return False

async def get_sms_status(sms_id: str) -> Optional[dict]:
    """
    Get SMS delivery status by ID (INT or UUID).
    """
    token = await get_token()
    if not token:
        return None
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/message/sms/status_by_id/{sms_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Failed to get SMS status: {e}")
    return None

async def get_eskiz_prices() -> Optional[dict]:
    """
    Get prices for SMS.
    """
    token = await get_token()
    if not token:
        return None
        
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BASE_URL}/user/prices",
                headers={"Authorization": f"Bearer {token}"}
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Failed to get Eskiz prices: {e}")
    return None
