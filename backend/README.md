# Backend (FastAPI)

## Run locally

From this folder (`backend/`):

```bash
uv sync
uv run uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Database (SQLite)

- The app uses SQLite at `sqlite:///./portfolio.db` (created as `backend/portfolio.db` when you run the server).
- Tables are created automatically on startup (`Base.metadata.create_all` in `main.py`).
- Delete `portfolio.db` to reset all local data, then restart the server.

## API docs

- Swagger UI: `http://127.0.0.1:8000/docs`
