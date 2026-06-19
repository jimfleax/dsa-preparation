# Testing Strategy & Frameworks

This document describes the testing approach, frameworks, and tools used to ensure the reliability of the `dsa-preparation` project.

## 1. Frontend Testing

### 1.1 Framework & Tools
- **Test Runner:** `Vitest` configured via `vitest.config.ts`.
- **Environment:** `jsdom` is used to simulate a browser environment in Node.js.
- **Testing Library:** `@testing-library/react` and `@testing-library/user-event` are the primary libraries for rendering components and simulating user interactions.

### 1.2 Structure & Placement
- Tests are not collocated with components. Instead, they are centralized in the `src/tests/` directory (e.g., `AdminApp.test.tsx`, `userAuth.test.tsx`, `adminLogin.test.tsx`).
- `setup.ts` and ad-hoc runner scripts (`runner.tsx`) configure the global JSDOM and mock common browser APIs before tests execute.

### 1.3 Mocks & Strategies
- **Global Objects:** High-level browser objects such as `window.localStorage`, `window.location`, and `window.matchMedia` are mocked comprehensively in `setup.ts` to allow isolated integration tests.
- **Routing & State:** `MemoryRouter` is used to assert route transitions and guarded components (e.g., verifying that a user is redirected to `/login` when unauthorized).
- **Context Providers:** Tests wrap tested components in required context providers (e.g., `AdminAuthProvider`, `GoogleOAuthProvider`) to simulate actual runtime conditions.

## 2. Backend Testing

### 2.1 Framework & Environment
- **Approach:** Ad-hoc custom integration test scripts located at the root of the `backend/` directory (e.g., `test-admin.ts`, `test-auth.ts`, `test-user-creation.js`).
- **Test Runner:** Tests are typically executed directly using `tsx` or `node` via terminal commands, though `Jest` (`jest`, `ts-jest`) is installed and available in `devDependencies`.
- **Database Simulation:** Tests rely heavily on `mongodb-memory-server` to spin up an isolated, ephemeral in-memory MongoDB instance. This prevents data collision, avoids the need for a live test database, and speeds up test execution.

### 2.2 Controller Integration Testing
- Backend tests bypass Express routing and invoke controller functions directly (e.g., `adminLogin(mockReq, mockRes)`).
- **Mocks:**
  - Standard Express `Request` and `Response` objects are stubbed inline.
  - Third-party authentication (e.g., Google's `OAuth2Client.verifyIdToken`) is mocked to return deterministic payload data.
- **Assertions:** Tests use basic `if (!condition) throw new Error(...)` checks to validate outputs and logic (such as middleware ID extraction or Analytics metric calculations), terminating with `process.exit(1)` upon failure.

## 3. Test Coverage & Philosophy
- **Integration over Unit:** Both frontend and backend lean heavily into integration tests. The frontend verifies end-to-end component rendering and logic flows. The backend verifies complete request-response lifecycles, database writes, and middleware transitions.
- **Test Tracks Data:** As specified by `.agent/skills/generating-dsa-roadmaps/SKILL.md` and `AGENTS.md`, any mock tracks inserted into the database for testing or verification MUST use the `[TEST]` prefix in the track title to identify them easily for garbage collection.
