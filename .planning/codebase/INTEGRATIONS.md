# External Integrations

**Analysis Date:** 2024-05-24

## APIs & External Services

**Backend API (Internal/External):**
- Express Server - Provides endpoints (`/api/documents`, `/api/document`, `/api/health`) to list and fetch markdown content.
  - SDK/Client: Built-in browser `fetch`.
  - Auth: None.
  - Env Var: `VITE_API_URL` (defaults to `https://dsa-preparation-788547842951.asia-south1.run.app` if not set).

## Data Storage

**Databases:**
- Local filesystem only
  - Connection: Parsed dynamically from `content/theory/` and `content/problemsheets/` using Node's `fs` module.
  - Client: Native `fs` and `path`.

**File Storage:**
- Local filesystem only

**Caching:**
- None explicitly defined beyond standard HTTP fetch cache policies.

## Authentication & Identity

**Auth Provider:**
- None

## Monitoring & Observability

**Error Tracking:**
- console.error for backend API failures and frontend fetch errors.

**Logs:**
- Basic console logging.

## CI/CD & Deployment

**Hosting:**
- Container/Server-based (e.g., Cloud Run or Vercel, given the default `VITE_API_URL` and CORS configuration).

**CI Pipeline:**
- None detected in immediate workspace, but built with a full-stack node setup (`npm run build`).

## Environment Configuration

**Required env vars:**
- `VITE_API_URL` (optional, overrides default remote backend).
- `PORT` (optional, for backend express server port).

**Secrets location:**
- Standard `.env` handling via `dotenv`.

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2024-05-24*