# Research Summary: Native JWT Authentication

**Domain:** User Authentication (Express + MongoDB + React)
**Researched:** 2024-05
**Overall confidence:** HIGH

## Executive Summary

Implementing native JWT authentication in the MERN stack requires a clear separation of responsibilities between the React client, Express API, and MongoDB database. This architecture centers on stateless authentication, where the server issues a signed JSON Web Token (JWT) upon successful login, and the client stores and presents this token for subsequent requests.

For SPA (Single Page Application) simplicity, storing the JWT in `localStorage` is recommended, though it introduces Cross-Site Scripting (XSS) risks compared to `HttpOnly` cookies. The backend requires careful handling of password hashing at the database level (Mongoose pre-save hooks) to ensure raw passwords are never stored. The frontend must implement an `AuthContext` to manage global authentication state and a network layer capable of catching `401 Unauthorized` responses to seamlessly log users out when their session expires.

## Key Findings

**Stack:** Replace third-party auth (like Clerk) with `jsonwebtoken` and `bcryptjs` on the backend, using native `fetch` and React Context on the frontend.
**Architecture:** Stateless JWT flow utilizing `AuthContext` for client-side state and a central `fetch` wrapper/interceptor for injecting tokens and handling `401`s.
**Critical pitfall:** Re-hashing already hashed passwords in Mongoose `pre('save')` hooks and failing to mitigate XSS when using `localStorage` for token storage.

## Implications for Roadmap

Based on research, suggested phase structure for implementation:

1. **Backend Foundation** - Data modeling and Security
   - Addresses: User Mongoose schema with `pre('save')` hook for `bcryptjs` hashing.
   - Avoids: Exposing plaintext passwords or re-hashing hashes (using `isModified`).

2. **API Authentication Endpoints** - Issuance & Validation
   - Addresses: `/api/auth/register`, `/api/auth/login`, and JWT issuance.
   - Includes creating an auth middleware (`verifyToken`) to protect other routes.

3. **Frontend Integration** - State & Storage
   - Addresses: `AuthContext` creation, `localStorage` integration for SPA simplicity.
   - Avoids: Unsynchronized UI states.

4. **Network & Error Handling** - Resilience
   - Addresses: Fetch wrappers to automatically append `Authorization: Bearer <token>` and globally intercept `401` responses to trigger a logout.

**Research flags for phases:**
- Phase 1: Standard patterns, unlikely to need deep research beyond checking `this.isModified`.
- Phase 3: Requires careful UX planning to ensure the app doesn't "flicker" between logged in/out states on initial load while reading from `localStorage`.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | `bcryptjs` and `jsonwebtoken` are the industry standard for this stack. |
| Features | HIGH | Table stakes (login/register/logout) are universally understood. |
| Architecture | HIGH | AuthContext + Fetch 401 interception is the standard React pattern. |
| Pitfalls | HIGH | XSS vulnerability in `localStorage` is a well-documented tradeoff. |

## Gaps to Address

- **Refresh Tokens:** The current scope focuses on a single access token in `localStorage`. If session duration needs to be extended securely, a refresh token strategy (stored in an `HttpOnly` cookie) will need to be researched in a future phase.
- **Rate Limiting:** Login routes are susceptible to brute force attacks. Future phases should research `express-rate-limit`.