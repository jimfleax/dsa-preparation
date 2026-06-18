# Original User Request

## Initial Request — 2026-06-18T10:12:49Z

# Teamwork Project Prompt

Build an admin dashboard for the DSA preparation website to manage users, roadmap tracks, markdown learning content, and view analytics.

Working directory: /home/reetabratabhandari/Projects/dsa-preparation
Integrity mode: development

## Requirements

### R1. Admin Authentication & Schema
Create a separate MongoDB schema for Admins. Create auth middlewares to secure all `/admin` API endpoints and frontend routes. Use a script to manually seed the first admin.

### R2. Users Management Page
Build a frontend page at `/admin/users` to view all users, displaying their information and individual metrics.

### R3. Tracks Management Page
Build a frontend page at `/admin/tracks` to view, create, modify, and delete learning tracks, integrating with the existing backend track schema and controllers.

### R4. Learning Docs Management
Create a new MongoDB schema for Markdown documents. Build a UI at `/admin/docs` with a file picker/dropper to upload `.md` files, preview them, and save them to the database (replacing the current file-system based approach).

### R5. Analytics & Metrics Dashboard
Build an analytics page at `/admin/analytics` displaying aggregated data and graphs related to user activity and platform usage. Use Recharts for charting.

## Acceptance Criteria

### Security & Auth
- [ ] Unauthenticated users cannot access `/admin` API routes.
- [ ] Unauthenticated users attempting to view frontend `/admin` routes are redirected to login.

### Data Management
- [ ] Admin can view a list of all registered users.
- [ ] Admin can perform full CRUD operations on tracks.
- [ ] Admin can upload a `.md` file, preview it, and successfully save its content to MongoDB.
- [ ] Analytics page successfully displays at least two different data visualizations (e.g., active users, top tracks).

## Follow-up — 2026-06-18T10:38:12Z

User provided feedback on the requirements:
1. Initial Admin Setup: Do not build an endpoint/script for creating the first admin. The user will create it later manually in the database. Just ensure the Admin schema exists and the login route works.
2. Frontend Architecture: The admin dashboard should be integrated into the existing React frontend as a different route (e.g. `/admin`).
3. Analytics Data: Based on the available models (`User`, `Track`, `TrackedProblem`), the analytics page should display:
   - Total registered users & new users (last 30 days)
   - Total tracks and problems available
   - Total problems solved globally
   - Most active tracks (based on `TrackedProblem` entries)
   - Problem completion rate (Solved vs Revising/Unsolved)

Please incorporate these updates into your ongoing development.
