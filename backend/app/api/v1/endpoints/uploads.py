import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

# Get the backend directory (root of the backend project)
# Current file is at: backend/app/api/v1/endpoints/uploads.py
# 1: endpoints/, 2: v1/, 3: api/, 4: app/, 5: backend/
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../../../../"))
UPLOAD_DIR = os.path.join(BACKEND_ROOT, "static", "uploads")

# Ensure directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate content type
        content_type = file.content_type or ""
        if not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Safe filename extraction
        original_filename = file.filename or "image.png"
        file_extension = os.path.splitext(original_filename)[1]
        if not file_extension:
            file_extension = ".png"
            
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL for the frontend
        # Using absolute URL for local development to bypass Next.js rewrite issues
        url = f"http://localhost:8000/static/uploads/{unique_filename}"
        print(f"UPLOAD SUCCESS: Saved to {file_path}")
        print(f"UPLOAD SUCCESS: Created URL {url}")
        return {"url": url}
        
    except Exception as e:
        print(f"UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
