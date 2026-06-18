# Scope: Frontend Admin Dashboard (Milestones 3, 4 & 5)

## Architecture
- React + Vite + Tailwind CSS.
- The admin dashboard should be integrated into the existing React frontend as a different route (e.g. `/admin`).
- Use Recharts for the Analytics page.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 3 | Frontend Admin Shell & Auth | Login page, Admin layout (sidebar), Protected route logic, Auth context. | M1 | PLANNED |
| 4 | Frontend Users & Tracks | `/admin/users` list page, `/admin/tracks` CRUD pages. | M1, M3 | PLANNED |
| 5 | Frontend Docs & Analytics | `/admin/docs` file upload/preview, `/admin/analytics` charts (Recharts). | M1, M2, M3 | PLANNED |

## Interface Contracts
- See global `/home/reetabratabhandari/Projects/dsa-preparation/.agents/orchestrator/PROJECT.md` for API details.
- Analytics Data to display: Total registered users & new users (last 30 days), Total tracks and problems available, Total problems solved globally, Most active tracks (based on TrackedProblem entries), Problem completion rate (Solved vs Revising/Unsolved).

## Instructions
- Run the `Explorer -> Worker -> Reviewer` loop for M3, then M4, then M5.
- Ensure Recharts is installed in the frontend.
- Do not modify backend code. The backend sub-orchestrator is handling M1 and M2 in parallel. Assume the backend endpoints will match the interface contracts.
