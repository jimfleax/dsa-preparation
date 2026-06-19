# High-Level Architecture & Data Flow

## 1. Split-App Architecture
The frontend is split into two distinct applications at the `main.tsx` entry point:
- **Public/User App** (`App.tsx`): Focuses on the DSA tracker, problem lists, offline support, and markdown rendering.
- **Admin App** (`AdminApp.tsx`): A dashboard restricted to admins (loaded when path starts with `/admin`). Uses `BrowserRouter` mapped to `/admin`.

## 2. Local-First Offline Strategy
The frontend utilizes `vite-plugin-pwa` with Workbox to cache static assets and run offline. `RxDB`/`Dexie` are leveraged for tracking problem completions locally, which later synchronizes via background jobs to the MongoDB backend.

## 3. Backend MVC
The backend is a traditional Express REST API:
- `routes/`: Express routers isolating domains (auth, admin, tracker, sync).
- `controllers/`: Business logic, such as extracting logic from LeetCode.
- `models/`: Mongoose schemas.
- `middleware/`: JWT authentication and RBAC limits.

## 4. CI/CD & Deployment
The repository contains a `Dockerfile` specifically for building and running the Express backend. The frontend is built separately and hosted on a static CDN (Vercel/Netlify) relying on `_redirects`/`vercel.json` for SPA routing fallbacks.
