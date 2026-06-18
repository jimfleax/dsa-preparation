# Codebase Testing Strategy: DSA Preparation

This document outlines how tests are written, organized, and executed within the `dsa-preparation` codebase.

## 1. Frontend Testing

### Framework & Organization
*   **Framework**: The frontend uses standard industry tools: **Vitest** along with **React Testing Library** (`@testing-library/react`).
*   **Location**: Test files are housed in `frontend/src/tests/`.
*   **Naming Convention**: Files adhere to the `*.test.tsx` naming convention (e.g., `AdminApp.test.tsx`, `userAuth.test.tsx`).
*   **Configuration**: Configured via `vitest.config.ts`. (Note: Execution scripts are not currently bound to `package.json`'s `"test"` command, requiring manual execution via `npx vitest`).

### How Tests are Written
*   **Structure**: Frontend tests leverage standard BDD syntax with `describe`, `it`/`test`, `beforeEach`, and `expect` imported directly from `vitest`.
*   **Behavior**: They render React components in a JSDOM environment, mock browser primitives like `window.localStorage` and `matchMedia`, and simulate user routing/interactions using React Testing Library's `render` and `waitFor`.

## 2. Backend Testing

### Framework & Organization
*   **Framework**: While `jest`, `ts-jest`, and `supertest` are present in `devDependencies`, they are **not actively used** by the existing test files. There is no `jest.config.js` or `npm test` script.
*   **Approach**: Testing relies entirely on custom, ad-hoc execution scripts written in TypeScript. 
*   **Location**: Backend tests are scattered at the root of the backend directory (e.g., `backend/test-admin.ts`, `backend/test-analytics-integrity.ts`) or in the root-level `_dev/tests/` folder (e.g., `_dev/tests/_test_api_endpoints.ts`).
*   **Naming Convention**: Files usually use the `test-*.ts` or `_test_*.ts` prefix.

### How Tests are Written
*   **Execution**: Scripts are manually executed via `npx tsx <filename>`.
*   **Mocking & Database**: Scripts utilizing the database spin up an in-memory MongoDB instance using `mongodb-memory-server` and connect Mongoose directly to it.
*   **Controller Invocation**: Instead of hitting an active Express server via `supertest`, tests often manually construct mocked Express Request (`req`) and Response (`res`) objects (e.g., intercepting `.json()` or `.status()`), and invoke controller functions directly.
*   **Assertions**: Assertions are manual. They rely on standard `if (!condition) throw new Error("message")` logic or custom `assert()` wrapper functions.
*   **Output**: Tests log success or failure directly to standard output (e.g., printing `✅ PASS` or `❌ FAIL`).

## 3. Coverage
*   **Tracking**: There are no code coverage configurations (e.g., Istanbul/NYC or Vitest coverage) in place for either the frontend or backend.
*   **Scope**: Existing tests primarily focus on "happy paths", ensuring the database hooks up properly, user authentication workflows complete successfully, and basic controller integrations remain intact.
