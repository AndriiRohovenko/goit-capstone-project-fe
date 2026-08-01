This is a [Next.js](https://nextjs.org) app for the AI Test Design Workspace.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `ai-assistant-app/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The frontend talks to FastAPI through a shared axios client (`withCredentials: true`) so HttpOnly auth cookies are sent automatically.

### Backend CORS (required for cookie auth)

FastAPI must allow credentials and an **explicit** frontend origin (not `*`):

- `allow_origins=["http://localhost:3000"]` (or your deployed origin)
- `allow_credentials=True`
- Login / register / refresh should set HttpOnly cookies for access + refresh tokens
- `SameSite` appropriately for your deploy setup; use `Secure` in production

## Architecture (brief)

- **TanStack Query** — server/API state only (projects, etc.): fetch, cache, loading, mutations, invalidation
- **Auth layer** — `lib/api-client.ts` + `features/auth`: cookie credentials, 401 → refresh → retry; AuthProvider holds `user` / `isAuthenticated` only (never JWTs)
- **No Redux** for server state or tokens

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
