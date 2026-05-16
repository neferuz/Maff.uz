# Maff.uz Backend

Professional FastAPI backend with PostgreSQL integration.

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**:
   Create a `.env` file based on the template (already created).

3. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **API Documentation**:
   Once running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for Swagger UI.

## Structure

- `app/api/v1/`: Endpoints versioned.
- `app/core/`: Settings and security.
- `app/db/`: Database session and engine.
- `app/models/`: SQLAlchemy models.
- `app/schemas/`: Pydantic schemas (DTOs).
- `app/crud/`: CRUD operations.
