# Testing Strategy: DSA Preparation

This document outlines the testing infrastructure, framework usage, and testing methodologies for the `dsa-preparation` codebase.

## 1. Testing Frameworks
*   **No Standard Frameworks**: The project currently **does not** utilize standard Javascript/Typescript testing frameworks like Jest, Mocha, Vitest, Cypress, or Playwright. None of these are present in the `devDependencies` of either the frontend or backend.
*   **Custom Test Scripts**: Testing is driven by ad-hoc, standalone Node.js scripts leveraging TypeScript execution (`tsx`) and the native `fetch` API.

## 2. Test Locations
All tests are located in the dedicated `_dev/tests/` directory at the root level of the project.
Key files include:
*   `_test_api_endpoints.ts`: A comprehensive integration test script that hits various API endpoints (e.g., health check, list problems, add problem, toggle solved status, delete problem).
*   `_test_db_connection.ts`: Utility test to ensure Mongoose can establish a connection with the configured MongoDB URI.
*   `_test_auth_middleware.ts`: Script verifying JWT authorization behaviors.
*   `_test_sync_endpoints.ts`: Script testing LeetCode synchronization APIs.
*   `test_lc_api.js`: Ad-hoc script testing the LeetCode scraping logic.

## 3. Testing Methodology
*   **Integration/E2E API Testing**: The tests strictly perform black-box API integration testing. They assume the backend development server is already running. The scripts make live HTTP requests to `localhost:3000` (or `process.env.API_URL`) and utilize basic `assert` functions to validate HTTP status codes and JSON response bodies.
*   **Execution**: Tests are executed manually via the terminal, e.g., `npx tsx _dev/tests/_test_api_endpoints.ts`.
*   **Pass/Fail Output**: The custom runner scripts output `✅ PASS` or `❌ FAIL` to standard out based on whether assertions throw exceptions.

## 4. Test Coverage
*   **No Coverage Tools**: There are no coverage tools (such as Istanbul/nyc) configured.
*   **Untracked**: The exact test coverage percentage of the codebase is unknown and untracked. Tests mostly cover the "happy paths" of the core CRUD and Auth APIs.

## 5. Future Recommendations
Given the findings, introducing a structured test runner (like **Vitest** or **Jest**) is highly recommended. This would bring benefits like:
1.  In-memory execution and mocking (avoiding the need for a manually running external server).
2.  Standardized assertions (`expect()`).
3.  Automated test coverage reporting.
4.  Easier integration into CI/CD pipelines.
