# Codebase Conventions: DSA Preparation

This document outlines the coding styles, naming conventions, and repeated architectural patterns observed across the `dsa-preparation` codebase.

## 1. Directory Structure & Architecture
The project is split into two primary environments:
*   **`frontend/`**: A React application built with Vite and Tailwind CSS.
*   **`backend/`**: A Node.js application using Express and Mongoose, written in TypeScript.

## 2. Naming Conventions

### Frontend
*   **Components**: Use `PascalCase` with a `.tsx` extension (e.g., `App.tsx`, `LoginModal.tsx`, `PreviewPanel.tsx`). Stored primarily in `frontend/src/components/`.
*   **Hooks & Libs**: Utility files and custom hooks use `camelCase` (e.g., `useCommandPalette.ts`, `apiFetch.ts`).
*   **Context**: Context providers are named with `PascalCase` (e.g., `AuthContext.tsx`, `NetworkStatusContext.tsx`).

### Backend
*   **Controllers**: Suffix with `Controller` and use `camelCase` (e.g., `authController.ts`, `trackerController.ts`). Stored in `backend/src/controllers/`.
*   **Routes**: Suffix with `Routes` and use `camelCase` (e.g., `authRoutes.ts`, `trackerRoutes.ts`). Stored in `backend/src/routes/`.
*   **Models**: Mongoose models use `PascalCase` for the filename and match the model name (e.g., `User.ts`, `TrackedProblem.ts`, `Track.ts`). Stored in `backend/src/models/`.

## 3. Coding Styles and Practices

### TypeScript & Linting
*   The project relies on native TypeScript compiler checks for linting (`tsc --noEmit` script exists in both `frontend` and `backend`).
*   Currently, there is no explicit ESLint or Prettier setup.
*   Some occurrences of type `any` exist (especially in error catching `catch (err: any)` and API mappings) which are flagged in `CODEBASE_AUDIT.md` for future refactoring toward stricter types (`unknown` or `Error`).

### Validation (Backend)
*   The backend heavily leverages `zod` for strong schema-based payload validation. 
*   **Pattern**: Define a `zod` schema (e.g., `registerSchema`, `loginSchema`), call `.safeParse(req.body)`, and immediately handle `!parseResult.success` by returning a `400` status with structured error messages.

### Error Handling
*   **Global Catch**: The Express backend uses a unified global error handler at the end of the middleware chain (`server.src.ts`).
*   It ensures that API endpoints (paths starting with `/api/`) always return standardized JSON payloads formatted as `{ success: false, error: ..., message: ... }`.
*   In production, internal server errors are sanitized to prevent leaking stack traces.

### Modules
*   The application strongly adopts ES Modules (`"type": "module"` in `package.json` for both environments).
*   Backend scripts are bundled and executed using `tsx` in development and `esbuild` for production compilation.

### Security Patterns
*   **CORS**: Dynamically configured in `server.src.ts` using `cors()` to restrict origins to localhost, `dsa.jimfleax.in`, or `process.env.FRONTEND_URL`.
*   **Rate Limiting**: Used defensively via `express-rate-limit` on public or scrape endpoints to mitigate abuse.
*   **Authentication**: Implemented using JWT tokens sent via the `Authorization: Bearer <token>` header, with Mongoose pre-save hooks handling `bcryptjs` password hashing.
