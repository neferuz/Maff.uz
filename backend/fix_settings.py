import re

file_path = "app/core/config.py"
with open(file_path, "r") as f:
    content = f.read()

if "ESKIZ_EMAIL: str | None = None" not in content:
    # Add to settings
    # Search for something inside Settings class
    content = content.replace(
        "    class Config:",
        "    ESKIZ_EMAIL: str | None = None\n    ESKIZ_PASSWORD: str | None = None\n\n    class Config:"
    )
    # If using Pydantic v2 it might not use class Config, maybe model_config
    if "class Config:" not in content and "model_config" in content:
         content = content.replace(
             "    model_config",
             "    ESKIZ_EMAIL: str | None = None\n    ESKIZ_PASSWORD: str | None = None\n\n    model_config"
         )

with open(file_path, "w") as f:
    f.write(content)
print("Updated config")
