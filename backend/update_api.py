import re

api_file = "app/api/v1/api.py"
with open(api_file, "r") as f:
    content = f.read()

if "from app.api.v1.endpoints import auth" not in content:
    content = content.replace(
        "from app.api.v1.endpoints import login, users, categories",
        "from app.api.v1.endpoints import login, users, categories, auth"
    )
    content += '\napi_router.include_router(auth.router, prefix="/auth", tags=["auth"])\n'
    
    with open(api_file, "w") as f:
        f.write(content)
print("Updated api router")
