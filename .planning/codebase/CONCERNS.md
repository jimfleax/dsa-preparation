# Concerns & Technical Debt

## 1. PWA & Service Worker Conflicts
The Vite PWA plugin was previously missing a `navigateFallback` directive. This meant that the Service Worker, once installed, would intercept requests to dynamic routes (like `/admin`) and fail to fall back to `index.html`. Users had to forcefully clear their cache. Ensuring updates to the Service Worker propagate immediately without manual user intervention remains a risk.

## 2. Hardcoded Admin Path
The split between `App.tsx` and `AdminApp.tsx` in `main.tsx` relies strictly on `window.location.pathname.startsWith("/admin")`. This prevents the Admin dashboard from being easily integrated with the standard React Router `<Routes>` tree, meaning Context Providers (like Auth) are entirely duplicated or segregated unnecessarily. 

## 3. Rate Limiting Dependency
The backend scrapes LeetCode directly for calendars and problem titles. LeetCode does not provide an official API, and their GraphQL endpoints are subject to aggressive undocumented rate-limiting or schema changes. If LeetCode alters their DOM or payload, the system breaks.

## 4. Duplicate Build Configurations
There are multiple build tools (Vite for frontend, TSC for backend, separate `package.json` workspaces). This could be consolidated into a modern monorepo tool like Turborepo for better caching and simpler CI execution.
