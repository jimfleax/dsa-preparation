# Codebase Conventions & Standards

This document outlines the coding standards, style guidelines, and best practices observed within the `dsa-preparation` project.

## 1. General & Architecture
- **Language:** TypeScript across the entire stack (Frontend and Backend), targeting `ES2022`.
- **Architecture:** Client-server separation with a dedicated `frontend` (React/Vite) and `backend` (Express/Node) directory structure.
- **Module System:** Both environments utilize modern ES Modules (`type: "module"` in `package.json`).
- **Typing:** Strict typing is encouraged. A concerted effort exists to migrate away from `any` towards `unknown`, specific interfaces, and standard type narrowing (e.g. `if (error instanceof Error)`).

## 2. Backend Conventions (Node.js/Express)
### 2.1 File Structure
- Adheres to the standard MVC-like pattern without views:
  - `src/controllers/`: Core business logic and HTTP response formatting.
  - `src/routes/`: Express routers that map HTTP methods and paths to controllers.
  - `src/models/`: Mongoose schemas defining database collections.
  - `src/middleware/`: Reusable request interception (e.g., `authMiddleware.ts`, `adminAuthMiddleware.ts`).
  - `src/lib/`: Shared utilities (`db.ts`, `slugUtils.ts`).

### 2.2 Data Validation & Security
- **Input Validation:** Incoming requests are strictly validated using `Zod` schemas before touching business logic.
- **Security Middleware:** 
  - Uses `express-rate-limit` on external and sensitive endpoints to prevent API abuse.
  - Implements CORS with restrictive `ALLOWED_ORIGINS`.
- **Authentication:** Passwords are automatically hashed via Mongoose pre-save hooks using `bcryptjs`. JWTs are used for stateful sessions.
- **Error Handling:** Global error handling is configured to avoid leaking internal stack traces into production environments.

### 2.3 Performance & Database Operations
- **Asynchronous Code:** Prefer `async/await` and `fs.promises` instead of synchronous functions like `fs.readFileSync`.
- **Batching & Scale:**
  - Avoid O(N) database calls (N+1 query problem). Use Mongoose operators like `$in` to filter and fetch datasets effectively.
  - Utilize `insertMany` for bulk database writes.
  - Use `Promise.all` to batch concurrent network operations (e.g., external API calls to LeetCode).
- **Indexing:** Mongoose schemas must explicitly define necessary compound indexes (e.g. `{ userId: 1, titleSlug: 1 }` for IDOR protection and tenancy) and text indexes for search operations.

## 3. Frontend Conventions (React/Vite)
### 3.1 File Structure
- Components are categorized and placed in `src/components/`, while pages reside in `src/pages/`.
- Logic separation is heavily encouraged through custom hooks (`src/hooks/`) and utility functions (`src/lib/`).
- Shared global state is handled via React Context API (`src/context/`).

### 3.2 Performance Optimization
- **Code Splitting:** Route-level and component-level code splitting using `React.lazy` and `Suspense` is mandated for heavy components (e.g., `react-markdown` in `PreviewPanel`, `recharts` in analytics views) to reduce initial bundle sizes.
- **Memoization:** High-frequency rendering areas should utilize `React.memo` for static components. Context provider values must be wrapped in `useMemo` and functions in `useCallback` to prevent cascading re-renders.
- **Component Lifecycle:** Heavy modals and dialogs should be conditionally mounted in the DOM rather than perpetually rendered with a hidden/false state.

### 3.3 DRY & Maintainability
- Avoid "God components". Decompose large UI shells by extracting state logic to custom hooks (e.g. `useDocuments`, `useInfiniteScroll`).
- Duplicate UI patterns (like mobile and desktop table rows) should be unified into shared sub-components (e.g. `ProblemMobileCard`).
- UI styling utilizes Utility-first CSS via `TailwindCSS` (`@tailwindcss/vite`).
