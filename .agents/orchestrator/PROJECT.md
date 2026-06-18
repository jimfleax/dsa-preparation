# Project: Admin Dashboard
# Scope: Global

## Architecture
- The Admin Dashboard will be integrated into the existing `dsa-preparation` website.
- **Backend**: Express.js + MongoDB. Needs new Admin schema, Markdown documents schema, and specific `/api/admin/*` endpoints.
- **Frontend**: React + Vite + Tailwind CSS. Needs new `/admin/*` routes secured by an Admin auth context/provider. Recharts will be used for analytics.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend Admin Setup | Admin schema, auth middleware, user list endpoint, track CRUD endpoints, analytics endpoints | none | PLANNED |
| 2 | Backend Docs Setup | Markdown documents schema, upload/save endpoint, retrieve endpoint | none | PLANNED |
| 3 | Frontend Admin Shell & Auth | Login page, Admin layout, Protected route logic, Auth context | M1 | PLANNED |
| 4 | Frontend Users & Tracks | `/admin/users` list page, `/admin/tracks` CRUD pages | M1, M3 | PLANNED |
| 5 | Frontend Docs & Analytics | `/admin/docs` file upload/preview, `/admin/analytics` charts (Recharts) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Admin Auth Middleware
- Extracts JWT. Verifies if the token belongs to a valid Admin in the Admin collection.
### Analytics API
- Returns aggregated metrics (Total registered users & new users, total tracks and problems available, total problems solved globally, most active tracks, problem completion rate).
### Markdown Docs API
- POST `/api/admin/docs` accepts file content (or multipart/form-data) and saves it to MongoDB. Returns saved doc metadata.

## Code Layout
- **Backend Models**: `backend/src/models/` (Admin.ts, MarkdownDoc.ts)
- **Backend Routes**: `backend/src/routes/admin/`
- **Backend Controllers**: `backend/src/controllers/admin/`
- **Frontend Pages**: `frontend/src/components/admin/` or `frontend/src/pages/admin/`
- **Frontend Services**: `frontend/src/lib/` or `frontend/src/hooks/`
