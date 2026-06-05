# Native Authentication & Multi-Tenancy Blueprint

## 1. Goal
Remove Clerk and implement a custom, native JWT-based authentication system to ensure strict user data isolation. Every user will have an isolated problem tracking environment.

## 2. Core Requirements
- **Authentication**: Custom JWT (JSON Web Tokens) using `jsonwebtoken`. Passwords hashed with `bcryptjs`.
- **Data Isolation**: All Mongoose queries must be filtered by the authenticated `userId`.
- **Dynamic Configuration**: The `LEETCODE_USERNAME` must be stored per-user in MongoDB.
- **UI Replacements**: Create custom Login and Register pages in React to replace Clerk's pre-built components, maintaining the existing Tailwind theme.

## 3. Risk Assessment & Mitigations
- **JWT Storage (XSS Risk)**: Storing tokens in `localStorage` exposes them to Cross-Site Scripting. Mitigated by strict React escaping (default) and keeping dependencies secure.
- **Token Expiration**: Implementing short-lived tokens (e.g., 24h or 7d) to limit exposure if a token is compromised.
- **Double Hashing**: Using Mongoose `pre('save')` hooks correctly with `if (!this.isModified('password')) return next();` to prevent corrupting passwords on generic updates.
