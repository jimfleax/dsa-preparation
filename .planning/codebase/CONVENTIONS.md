# Codebase Conventions: DSA Preparation

This document outlines the coding styles, naming conventions, linting rules, formatting guidelines, and architectural patterns for the `dsa-preparation` codebase.

## 1. Directory Structure
The repository is structured as a monorepo separated by environment:
*   **`frontend/`**: A React application bootstrapped with Vite and styled with Tailwind CSS.
*   **`backend/`**: A Node.js application built with Express and Mongoose, using TypeScript.

## 2. Naming Conventions

### Frontend
*   **Components & Pages**: Use `PascalCase` with a `.tsx` extension (e.g., `App.tsx`, `LoginModal.tsx`, `PreviewPanel.tsx`). Maintained in `frontend/src/components/`.
*   **Hooks, Contexts & Utilities**: Custom hooks and generic utilities use `camelCase` (e.g., `useCommandPalette.ts`, `apiFetch.ts`). Contexts may use `PascalCase` matching their exported provider (e.g., `AuthContext.tsx`).
*   **Tests**: Test files follow the `.test.tsx` or `.test.ts` naming convention and reside in `frontend/src/tests/` (e.g., `AdminApp.test.tsx`).

### Backend
*   **Controllers**: Suffix with `Controller` and use `camelCase` (e.g., `authController.ts`, `trackerController.ts`). Stored in `backend/src/controllers/`.
*   **Routes**: Suffix with `Routes` and use `camelCase` (e.g., `authRoutes.ts`, `trackerRoutes.ts`). Stored in `backend/src/routes/`.
*   **Models**: Mongoose models use `PascalCase` to reflect the database model name (e.g., `User.ts`, `TrackedProblem.ts`, `Track.ts`). Stored in `backend/src/models/`.
*   **Tests**: Ad-hoc backend test scripts are typically prefixed with `test-` or `test_` and placed in the root of the backend directory or in `_dev/tests/` (e.g., `test-admin.ts`, `_test_api_endpoints.ts`).

## 3. Linting Rules
*   **TypeScript-Driven Linting**: The codebase does **not** use an explicit ESLint configuration. Linting and type-checking are enforced purely via the TypeScript Compiler (`tsc`). 
*   **Scripts**: Both `frontend` and `backend` directories contain a `"lint": "tsc --noEmit"` script in their `package.json`.
*   **Type Safety**: There are scattered uses of type `any` (e.g., in `catch (err: any)`); it is recommended to type errors as `unknown` or utilize `instanceof Error` moving forward.

## 4. Formatting
*   **No Automated Formatting**: The project does not currently employ an automated code formatter like Prettier or standard JS formatting pipelines. Formatting conventions (like indentation and quote usage) are maintained manually. Most code naturally converges on 2-space indentation.

## 5. Coding Styles & Patterns
*   **Modules**: The project strictly enforces ES Modules. Both `frontend` and `backend` contain `"type": "module"` in their `package.json`.
*   **Validation**: The backend relies heavily on `zod` schemas for input validation. The pattern involves calling `.safeParse(req.body)` and returning early `400 Bad Request` responses on failures.
*   **Global Error Handling**: Express controllers do not crash the app on failure; errors are funneled to a unified error-handling middleware that sanitizes stack traces in production environments.
