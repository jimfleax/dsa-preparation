# Feature Landscape

**Domain:** User Authentication
**Researched:** 2024-05

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Registration (`/register`) | To create an account | Low | Must validate email uniqueness and hash password before saving. |
| Login (`/login`) | To access the app | Low | Must compare input password against DB hash. Returns signed JWT. |
| Logout | To end session | Low | Handled client-side by clearing `localStorage` and resetting `AuthContext`. |
| Protected Routes | Security/Privacy | Low | React Router `ProtectedRoute` component that checks for token existence. API middleware to block unauthenticated requests. |
| Persistent Session | Avoid re-login on refresh | Low | `AuthContext` initializes by checking `localStorage` for the token. |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Password Reset Flow | Recover lost accounts | High | Requires email service (SendGrid/Nodemailer) and short-lived reset tokens. |
| Refresh Tokens | Enhanced security | Medium | Short-lived access tokens + long-lived refresh tokens in `HttpOnly` cookies. Prevents XSS from completely compromising long-term access. |
| "Remember Me" Checkbox | User convenience | Low | Toggles between `localStorage` (persistent) and `sessionStorage` (cleared on tab close). |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Stateful Server Sessions | Breaks REST principles and scaling | Use stateless JWTs where the token contains the payload (e.g., `userId`). |
| Client-Side Password Hashing | Meaningless security theater; attacker can just steal the hash | Send password over HTTPS, hash on the server using `bcryptjs`. |

## Feature Dependencies

```
Registration → Login (requires created user)
Login → Protected Routes (requires JWT)
Protected Routes → Logout (session management)
```

## MVP Recommendation

Prioritize:
1. Registration (`/api/auth/register`)
2. Login (`/api/auth/login`)
3. Protected API Middleware (`verifyToken`)
4. React `AuthContext` and Protected UI Routes

Defer: Password Reset, Email Verification, Refresh Tokens. Keep it strictly to the core MVP flow for now.

## Sources
- General SaaS Auth requirements.