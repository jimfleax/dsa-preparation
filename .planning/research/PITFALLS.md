# Domain Pitfalls

**Domain:** Native JWT Auth (Express + Mongoose + React)
**Researched:** 2024-05

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Double-Hashing Passwords
**What goes wrong:** User updates their profile (e.g., changes their name), and their password gets randomly re-hashed, locking them out of their account.
**Why it happens:** Implementing `userSchema.pre('save', ...)` without checking if the password field was actually modified.
**Consequences:** Valid passwords become invalid, permanently locking users out unless they reset it.
**Prevention:** Always wrap the hashing logic in `if (!this.isModified('password')) return next();`
**Detection:** Changing a user's display name causes their next login to fail.

### Pitfall 2: Infinite Auth Loops on Frontend
**What goes wrong:** App rapidly flickers or reloads infinitely when a token expires.
**Why it happens:** The `apiClient` catches a `401`, triggers a redirect to `/login`, but a `useEffect` on `/login` immediately attempts an authenticated request to `/api/me` which returns `401`, triggering another redirect, forever.
**Consequences:** Browser crash, broken UX.
**Prevention:** Ensure `/login` is an unprotected route. Decouple token verification logic from mount effects on public pages.
**Detection:** Check network tab for hundreds of `/api/me` calls upon loading `/login`.

## Moderate Pitfalls

### Pitfall 1: XSS leading to Token Theft
**What goes wrong:** Malicious script reads `localStorage.getItem('token')`.
**Prevention:** Sanitize all user inputs (e.g., using `DOMPurify` if rendering markdown/HTML). Use strong Content Security Policies (CSP). Accept the risk for non-financial MVPs, but be aware of it.

### Pitfall 2: Returning Password Hash to Client
**What goes wrong:** The `/api/auth/me` endpoint returns `res.json(user)`.
**Prevention:** Always sanitize the payload. E.g., `user.toJSON()` with a transform that deletes `password`, or manually destructing before sending.

## Minor Pitfalls

### Pitfall 1: Incorrect Token Expiration Formats
**What goes wrong:** `jwt.sign` receives `expiresIn: 3600` instead of `'1h'`.
**Prevention:** Read `jsonwebtoken` docs carefully. Numbers are seconds, strings can be ms/units. Use explicit strings like `'7d'` or `'24h'`.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Backend Setup | Native `bcrypt` install errors | Use `bcryptjs` instead. |
| React Setup | React Router protecting routes before state hydrates | Show a full-screen loading spinner while `AuthContext` initializes from `localStorage` to avoid flashing the login screen to a logged-in user. |

## Sources
- React Router Protected Route examples
- Mongoose documentation on `isModified()`