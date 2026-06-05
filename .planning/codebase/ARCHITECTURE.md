# Architecture

**Analysis Date:** 2025-05-18

## Pattern Overview

**Overall:** Client-Server Monolithic API with Native JWT Authentication

**Key Characteristics:**
- Express backend serving both React SPA (via Vite in dev, static dist in prod) and REST API.
- Native authentication utilizing JSON Web Tokens (JWT) for stateless sessions.
- Multi-tenant data isolation handled at the application layer through specific query filtering based on verified token claims.

## Layers

**Frontend State Management:**
- Purpose: Maintain user session state and dispatch authenticated API calls
- Location: `src/context/AuthContext.tsx`
- Contains: React context managing JWT and User object, wrapped around `localStorage` interactions
- Depends on: LocalStorage API, `/api/auth/` backend endpoints
- Used by: All protected React components (e.g., `ProblemsTab`, `SettingsModal`)

**Authentication Middleware:**
- Purpose: Verify JWTs and extract user identity for downstream controllers
- Location: `src/middleware/authMiddleware.ts`
- Contains: Express middleware parsing `Authorization: Bearer <token>`
- Depends on: `jsonwebtoken`, `JWT_SECRET`
- Used by: Protected routes defined in `server.src.ts`

**Database Access (Models & Controllers):**
- Purpose: Scope queries strictly to the authenticated user ID
- Location: `src/controllers/problemController.ts`, `src/models/ProblemProgress.ts`
- Contains: Mongoose operations (`find`, `findOne`, `create`) utilizing the extracted `userId`
- Depends on: Mongoose, `req.user.id`

## Data Flow

**User Identity Request Flow:**

1. **Authentication:** User logs in/registers via frontend form. Frontend calls `POST /api/auth/login`.
2. **Token Generation:** Backend verifies credentials, creates JWT encoding the Mongoose `_id`, and returns the token and user metadata.
3. **Session Persistence:** Frontend (`AuthContext.tsx`) stores the JWT and user JSON in `localStorage`.
4. **Subsequent API Requests:** Frontend `fetch` calls inject `Authorization: Bearer <token>` into headers.
5. **Request Interception:** `requireAuth` middleware intercepts the request, verifies the JWT, and extracts `userId` from the decoded payload.
6. **User Context Assignment:** Middleware assigns `req.user = { id: decoded.userId }` and calls `next()`.

**Problem Isolation Flow:**

1. **List Problems:** Controller extracts `req.user.id`, initializes `filter = { userId: req.user.id }`, and performs `ProblemProgress.find(filter)`.
2. **Modify Problem (Revisit/Delete):** Controller extracts `req.user.id` and problem `id`. It uses compound querying: `ProblemProgress.findOne({ _id: id, userId: req.user.id })` to ensure the entity belongs to the user, acting as a safeguard against Insecure Direct Object Reference (IDOR).
3. **Add Problem:** Controller inserts `userId: req.user.id` into the new document, tying it to the user. Compound unique indexing on `{userId, titleSlug}` ensures idempotency per user.

## Key Abstractions

**Auth Context:**
- Purpose: Global frontend identity and token provider
- Examples: `src/context/AuthContext.tsx`
- Pattern: React Context API, LocalStorage persistence

**Protected API Routes:**
- Purpose: Enforce identity validation on backend groups
- Examples: `server.src.ts` (e.g., `app.use('/api/problems', requireAuth, ...);`)
- Pattern: Express Router Middleware chaining

## Entry Points

**API Auth Router:**
- Location: `src/routes/authRoutes.ts`
- Triggers: Frontend `fetch` to `/api/auth/login` and `/api/auth/register`
- Responsibilities: Validating credentials and issuing JWTs

**Protected Controllers:**
- Location: `src/controllers/problemController.ts`, `src/controllers/userController.ts`
- Triggers: Frontend `fetch` using tokens
- Responsibilities: Ensuring IDOR protection by tying operations directly to `req.user.id`

## Error Handling

**Strategy:** Explicit HTTP Status Codes and JSON Envelopes

**Patterns:**
- **401 Unauthorized:** Handled in `authMiddleware.ts` for missing or invalid tokens. Controllers also do a safety check `if (!userId) return res.status(401)`.
- **404 Not Found:** Returned when compound query `({_id: id, userId})` yields null (hides whether the problem ID exists for *another* user, mitigating enumeration attacks).
- **11000 Duplicate Key:** Handled in `addProblem` utilizing Mongoose's error code to return 409 Conflict.

## Cross-Cutting Concerns

**Logging:** Console.error used directly in catch blocks.
**Validation:** Mongoose Schema validation + explicit checks in controllers.
**Authentication:** Custom JWT-based stateless implementation.

---

*Architecture analysis: 2025-05-18*