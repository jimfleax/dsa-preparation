# Native JWT Authentication Architecture Plan

## 1. Comprehensive User Model Schema
We are replacing the lightweight Clerk-linked user profile with a full authentication model using MongoDB/Mongoose.

### Schema Fields
- `email`: `String` (Required, Unique, Trimmed, Lowercase)
- `username`: `String` (Required, Unique, Trimmed) - App display name
- `passwordHash`: `String` (Required) - Bcrypt hashed password
- `leetcodeUsername`: `String` (Optional, Trimmed) - Specific to this app's logic
- `createdAt` & `updatedAt`: Auto-managed via Mongoose timestamps

### Indexes
- `email` (Unique index for fast login/registration checks)
- `username` (Unique index)

## 2. Auth Controller Logic
The controller logic will handle user registration and login, including password hashing.

### Dependencies
- `bcryptjs`: For password hashing and comparison.
- `jsonwebtoken` (`jwt`): For generating access tokens.

### Flow: Register
1. **Validate Input:** Check for `email`, `username`, `password`.
2. **Check Existence:** Query DB to ensure `email` and `username` don't already exist.
3. **Hash Password:** Use `bcryptjs.hash()` with a salt round of 10-12 to hash the plain-text password.
4. **Create User:** Save user to MongoDB with `passwordHash` (do not save plain-text).
5. **Generate JWT:** Create token containing `{ userId: user._id }` signed with a secret.
6. **Return Response:** Return `201 Created` with the JWT (either in HTTP-only cookie or response body) and user details (excluding `passwordHash`).

### Flow: Login
1. **Validate Input:** Check for `email`/`username` and `password`.
2. **Retrieve User:** Find user by `email`. If not found, return `401 Unauthorized`.
3. **Compare Password:** Use `bcryptjs.compare()` against stored `passwordHash`.
4. **Generate JWT:** If valid, generate a new access token.
5. **Return Response:** Return `200 OK` with JWT and user details.

## 3. Auth Middleware
To secure protected routes (like Problem progress operations) and isolate user data:

### Flow: Verification
1. **Extract Token:** Read JWT from `Authorization: Bearer <token>` header (or HTTP-only cookie).
2. **Verify Token:** Use `jwt.verify(token, process.env.JWT_SECRET)`.
3. **Handle Errors:** If invalid/expired, return `401 Unauthorized` or `403 Forbidden`.
4. **Inject User ID:** Attach the verified `userId` to the request object (`req.user = { id: decoded.userId }`).
5. **Proceed:** Call `next()` to pass control to the route controller.

*In controllers, queries will now be scoped like: `ProblemProgress.find({ userId: req.user.id })`.*

## 4. UI/UX Flow
We will replace Clerk's pre-built modals with custom UI components using Tailwind CSS.

### Login / Register Pages
- **Routes:** Create `/login` and `/register` routes in React.
- **Form UI:** Simple card layouts with input fields, validation error messages, and a submit button with a loading state.
- **State Management:** Upon success, store the JWT (e.g., in `localStorage` or memory, or rely on HTTP-only cookie). Update global React Context (`AuthContext`) to reflect the logged-in state.

### Settings Modal (LeetCode Username)
- **Trigger:** Accessible from a user dropdown or settings gear icon.
- **Form:** A modal displaying the current `leetcodeUsername`. Allows the user to update it via a `PUT /api/user/settings` endpoint.
- **Experience:** Real-time feedback ("Saved successfully"), utilizing the isolated `req.user.id` on the backend to guarantee the correct record is updated.

## 5. Security Evaluation & Mitigations
Since we are moving from a managed solution (Clerk) to Native JWT, we must handle token security ourselves.

### Weaknesses & Limitations of Standard JWT
1. **Token Invalidation (Revocation):** Stateless JWTs cannot be easily revoked before they expire (e.g., if a user logs out or is compromised).
2. **XSS & CSRF Risks:** Storing JWT in `localStorage` makes it vulnerable to Cross-Site Scripting (XSS).

### Proposed Mitigations (Scaled for Project Size)
1. **Short-Lived Access Tokens:** Keep the JWT expiration short (e.g., `1h` or `2h`). For a small project, this provides a decent balance without needing complex refresh-token infrastructure immediately.
2. **Storage Strategy:**
   - *Good (Simpler):* `localStorage` with aggressive XSS prevention (React escapes by default, avoid `dangerouslySetInnerHTML`).
   - *Better (Recommended):* Store JWT in an **HTTP-only cookie** set by the server. This nullifies XSS token theft, but requires configuring CORS properly between the Vite dev server and Express, and using standard CSRF protections (or relying on SameSite=Strict cookies).
3. **Logout Handling:** If using `localStorage`, clear it on logout. If using cookies, the backend clears the cookie. No server-side blocklist is strictly necessary for this size if the token is short-lived.
