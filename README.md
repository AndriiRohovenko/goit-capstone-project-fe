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

The frontend talks to FastAPI through a shared axios client without credentialed requests. Auth is handled with bearer tokens returned by the API and stored locally.

### Backend CORS

Since cookies are not used, FastAPI does not need credentialed CORS. Use an explicit frontend origin instead of `*`:

- `allow_origins=["http://localhost:3000"]` (or your deployed origin)
- `allow_credentials=False`
- Login / register / refresh should return access + refresh tokens in JSON
- Protected requests should use the `Authorization: Bearer ...` header

## Architecture (brief)

- **TanStack Query** — server/API state only (projects, etc.): fetch, cache, loading, mutations, invalidation
- **Auth layer** — `lib/api-client.ts` + `features/auth`: bearer-token auth, 401 → refresh → retry; AuthProvider holds `user` / `isAuthenticated` only (never JWTs)
- **No Redux** for server state or tokens

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
