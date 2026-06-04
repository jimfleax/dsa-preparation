# Architecture

**Analysis Date:** 2024-05-24

## Pattern Overview

**Overall:** Client-Server Monolithic SPA

**Key Characteristics:**
- React Single Page Application (SPA) consuming a lightweight Express API.
- File-based Content Management System (CMS) leveraging Markdown and YAML frontmatter.
- No explicit client-side router; navigation and views are state-driven within a single component.

## Layers

**Frontend (React/Vite):**
- Purpose: Renders UI, filters content, and displays markdown previews.
- Location: `src/`
- Contains: React components, custom hooks (inlined in components), global CSS.
- Depends on: Backend API endpoints for data payload.
- Used by: End users.

**Backend (Express):**
- Purpose: Reads local markdown files, parses frontmatter, and serves content to the frontend.
- Location: `server.ts`
- Contains: Express server logic, File System (`fs`) reading utilities.
- Depends on: `content/` directory.
- Used by: Frontend application.

## Data Flow

**Document Fetch Flow:**

1. `App.tsx` mounts and calls `fetchDocumentsList()`.
2. HTTP GET request to `/api/documents`.
3. Express backend reads `content/theory/` and `content/problemsheets/`, parses YAML frontmatter of `.md` files.
4. Backend returns an array of `DocumentMetadata`.
5. Frontend stores this in `documents` state and distributes to `StatsGrid` and `DocumentCard`s.

**Document Preview Flow:**

1. User clicks a `DocumentCard` setting `activeDoc` state.
2. `PreviewPanel.tsx` detects `activeDoc` change and fetches `/api/document?type=...&filename=...`.
3. Backend verifies file, strips frontmatter, and returns pure markdown content.
4. `PreviewPanel.tsx` renders content using `react-markdown`.

**State Management:**
- Local component state via React hooks (`useState`, `useEffect`, `useMemo`) in `App.tsx` and `PreviewPanel.tsx`.
- Filtering is handled via derived state (`useMemo` for `filteredDocuments`).

## Key Abstractions

**DocumentMetadata:**
- Purpose: Standardizes the representation of a markdown file's frontmatter.
- Examples: `src/types.ts`, `server.ts`
- Pattern: TypeScript Interface matching backend schema.

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser load
- Responsibilities: Bootstraps the React application and imports global styles.

**Backend Entry:**
- Location: `server.ts`
- Triggers: `npm run dev` or `npm run start`
- Responsibilities: Initializes Express, sets up CORS, defines API routes, and serves Vite middleware in dev or static files in production.

## Error Handling

**Strategy:** Try-Catch with API fallback.

**Patterns:**
- Backend: Uses `try...catch` blocks to wrap file reading operations and returns 500 status with JSON error payload.
- Frontend: `try...catch` in fetch calls, setting `error` state variables in components (e.g., `PreviewPanel.tsx`) and rendering fallback UI.

## Cross-Cutting Concerns

**Logging:** Basic `console.error` and `console.log`.
**Validation:** Basic query parameter validation in backend `/api/document` route (prevents directory traversal).
**Authentication:** None.

---

*Architecture analysis: 2024-05-24*