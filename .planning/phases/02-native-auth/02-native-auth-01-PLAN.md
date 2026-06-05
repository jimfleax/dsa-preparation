---
phase: 02-native-auth
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "src/models/User.ts"
  - "src/controllers/authController.ts"
  - "src/routes/authRoutes.ts"
  - "src/middleware/authMiddleware.ts"
  - "server.ts"
autonomous: true
requirements:
  - AUTH-01
  - AUTH-02
must_haves:
  truths:
    - "User can register with email, username, and password"
    - "User can login and receive a valid JWT"
    - "Protected routes reject requests without a valid JWT"
  artifacts:
    - path: "src/models/User.ts"
      provides: "Mongoose schema with email, username, passwordHash"
    - path: "src/controllers/authController.ts"
      provides: "Register and login logic with bcrypt"
    - path: "src/middleware/authMiddleware.ts"
      provides: "JWT extraction and verification logic"
  key_links:
    - from: "src/middleware/authMiddleware.ts"
      to: "req.user"
      via: "token verification"
---

<objective>
Implement the backend architecture for native JWT authentication.
Purpose: Replace Clerk with a self-managed auth system to fully control user data and privacy.
Output: User model, Auth controllers, Auth middleware, and API routes.
</objective>

<execution_context>
@/home/jimfleax/.gemini/get-shit-done/workflows/execute-plan.md
@/home/jimfleax/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@Docs/AuthFeature/07_NATIVE_JWT_ARCHITECTURE.md
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update User Model & Install Dependencies</name>
  <files>src/models/User.ts, package.json</files>
  <action>
    - Install `bcryptjs` and `jsonwebtoken`, plus their types `@types/bcryptjs` and `@types/jsonwebtoken`.
    - Modify `src/models/User.ts` to include `email`, `username`, `passwordHash` (all required) and keep `leetcodeUsername` (optional).
    - Remove `clerkUserId` from the schema.
    - Add unique indexes to `email` and `username`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>User.ts exports updated Mongoose model and types compile.</done>
</task>

<task type="auto">
  <name>Task 2: Create Auth Middleware</name>
  <files>src/middleware/authMiddleware.ts, src/types.ts</files>
  <action>
    - Extend Express `Request` type in `src/types.ts` (or equivalent) to include `user?: { id: string }`.
    - Create `src/middleware/authMiddleware.ts` that extracts the token from the `Authorization: Bearer` header.
    - Verify token using `jsonwebtoken` and `process.env.JWT_SECRET`.
    - On success, attach decoded `userId` to `req.user.id` and call `next()`.
    - On failure, return `401 Unauthorized`.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Middleware correctly verifies JWT and handles auth errors.</done>
</task>

<task type="auto">
  <name>Task 3: Create Auth Controllers & Routes</name>
  <files>src/controllers/authController.ts, src/routes/authRoutes.ts, server.ts</files>
  <action>
    - Create `register` and `login` handlers in `authController.ts`.
    - In `register`, validate input, check for existing user, hash password using `bcryptjs`, save user, generate JWT.
    - In `login`, find user, compare hash, generate JWT.
    - Create `authRoutes.ts` exposing `POST /register` and `POST /login`.
    - Mount `authRoutes` in `server.ts` under `/api/auth`.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Auth endpoints are created and wired into the Express app.</done>
</task>

</tasks>

<verification>
Ensure the backend compiles without errors, dependencies are added, and the server can start without crashing.
</verification>

<success_criteria>
- User model has native auth fields.
- Bcrypt and JWT logic implemented correctly.
- Middleware handles token extraction.
</success_criteria>

<output>
After completion, create `.planning/phases/02-native-auth/02-native-auth-01-SUMMARY.md`
</output>