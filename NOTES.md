# FinSight-A — Project Notes

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, Alembic, Python-Jose (JWT), bcrypt |
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, react-router v7, Tailwind v4 |
| Auth | Auth0 (frontend) + httpOnly JWT cookie (backend) |
| DB | SQLite (dev) / PostgreSQL (prod via `DATABASE_URL`) |

---

## Backend layout (`backend/app/`)

```
core/
  config.py       # Pydantic Settings — reads .env
  database.py     # SQLAlchemy engine + Base + get_db
  security.py     # JWT encode/decode, password hashing
models/           # SQLAlchemy ORM models
schemas/          # Pydantic request/response schemas
services/         # Business logic (no DB sessions leaked into routes)
api/
  deps.py         # get_current_user dependency
  v1/
    router.py     # Wires all sub-routers under /api/v1
    auth.py
    portfolios.py
    dashboard.py
main.py           # App factory, CORS, lifespan, router registration
```

### Adding a new domain

1. Create `models/your_model.py`
2. Import it in `main.py` with `# noqa: F401` so `Base.metadata.create_all` picks it up
3. Create `schemas/`, `services/`, `api/v1/` files
4. Register the router in `api/v1/router.py`

### `.env` keys (place in `backend/.env`)

```
DATABASE_URL=sqlite:///./finsight.db
JWT_SECRET_KEY=...
ALPHA_VANTAGE_API_KEY=...
GROQ_API_KEY=...
FRONTEND_ORIGIN=http://localhost:5173
```

---

## Auth

- Backend issues a JWT stored in an **httpOnly cookie** (`access_token`).
- Every protected route uses `Depends(get_current_user)` from `api/deps.py`.
- CORS is configured with `allow_credentials=True` for `frontend_origin`.
- **Frontend rule:** always call the API with `fetch(url, { credentials: "include" })` so the cookie is sent.

---

## Frontend layout (`frontend/src/`)

```
app/
  store.ts        # Redux store — register every slice reducer here
  hooks.ts        # useAppDispatch / useAppSelector typed helpers
features/         # One folder per domain (slice + thunks)
pages/            # Route-level components
components/       # Shared UI components
routes/
  AppRoutes.tsx   # React Router route definitions
context/
  AuthContext.tsx # Auth0 context wrapper
```

### Data layer rule

Use **Redux Toolkit slices + `createAsyncThunk`** for all server state. Do not use react-query (not installed). Register every slice reducer in `store.ts`.

### API base rule

```ts
const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;
```

Place `VITE_API_URL=http://localhost:8000` in `frontend/.env` for local dev.

---

## How to run

```bash
# Backend
cd backend
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger)

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Git conventions

- Branch off fresh `main` for every feature: `git checkout main && git pull origin main`
- One feature per branch, one PR per branch — keep diffs small
- Branch naming: `feat/<feature>`, `chore/<task>`, `fix/<bug>`
