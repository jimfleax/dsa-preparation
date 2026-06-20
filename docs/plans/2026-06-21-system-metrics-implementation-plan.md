# System Metrics Implementation Plan

**Goal:** Implement a programmatic, zero-dependency infrastructure metrics collection system on the backend and a beautiful, mobile-responsive "System" dashboard in the admin panel to visualize the data.

**Architecture:** We will use Approach A from the brainstorming design. The backend will have a singleton `MetricsCollector` and HTTP middleware to track request latency. A new protected route `/api/admin/metrics` will expose this data. The frontend will feature a new `SystemMetricsPage` in the admin panel, utilizing `Recharts` for graphs and the existing `Card` component for unified design.

**Tech Stack:** Node.js (built-in `os`, `perf_hooks`), Express, Mongoose, React, Tailwind CSS, Recharts.

---

## User Review Required

> [!IMPORTANT]
> - **Atlas Tier**: The implementation includes a safe fallback for `replSetGetStatus`. If you are on the Atlas Free Tier (M0), replication lag will gracefully report as unavailable.
> - **In-Memory Volatility**: The backend metrics (like HTTP throughput and event loop lag) are stored in memory and will reset if the Cloud Run instance restarts. Let me know if you need persistent tracking (via a database collection) instead.
> - **Disk I/O**: Only supported on Linux (works in Docker/Cloud Run, but may return null on macOS local dev).

## Open Questions

1. Do you want to use the same Recharts color scheme as the existing Analytics page, or introduce new semantic colors (like indigo/emerald) for CPU/Memory metrics?
2. Should we add a manual "Refresh" button on the UI, or should it auto-poll every 15 seconds?

---

## Proposed Changes

### Backend Components

#### [NEW] `backend/src/lib/metricsCollector.ts`
- Implement a singleton class to capture Event Loop Lag (`perf_hooks`), Memory (`process.memoryUsage`), CPU (`process.cpuUsage`), OS info (`os`), and MongoDB `serverStatus`.
- Add cgroup awareness for accurate Docker memory/cpu limits.

#### [NEW] `backend/src/middleware/httpMetrics.ts`
- Express middleware to intercept all requests, track duration using `process.hrtime.bigint()`, and keep a rolling histogram of latencies and status codes.

#### [NEW] `backend/src/controllers/admin/metricsController.ts`
- Admin endpoint handler (`GET /api/admin/metrics`) that aggregates data from `metricsCollector`, `httpMetrics`, and executes MongoDB `serverStatus` on demand.

#### [NEW] `backend/src/routes/admin/metricsRoutes.ts`
- Registers the route with `requireAdminAuth`.

#### [MODIFY] `backend/src/routes/admin/index.ts`
- Mount the new `metricsRoutes` under `/metrics`.

#### [MODIFY] `backend/server.src.ts`
- Mount the `httpMetrics` middleware globally early in the pipeline.
- Initialize the `MetricsCollector` on startup.

---

### Frontend Components

#### [MODIFY] `frontend/src/components/admin/AdminLayout.tsx`
- Add a new navigation item for "System" mapping to `/admin/system` using the `Server` or `Activity` lucide icon.

#### [MODIFY] `frontend/src/AdminApp.tsx`
- Add the new route `<Route path="system" element={<SystemMetricsPage />} />` wrapped in Suspense.

#### [NEW] `frontend/src/pages/admin/SystemMetricsPage.tsx`
- A comprehensive dashboard utilizing the `Card` component, `Recharts` for event loop / memory graphs, and `AnimatedNumber` for counters.
- Follows mobile-first principles: single column on mobile, CSS Grid on desktop.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in both `frontend` and `backend` to ensure no TypeScript errors.
- (If applicable) run backend unit tests if present.

### Manual Verification
1. Login to the Admin panel.
2. Navigate to the new "System" tab.
3. Verify that OS, Node.js, HTTP, and MongoDB metrics load successfully.
4. Verify graceful degradation if running on macOS or Atlas Free Tier.
5. Verify mobile responsiveness of the dashboard grid.
