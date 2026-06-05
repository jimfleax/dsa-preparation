# Authentication & Multi-Tenancy Blueprint

## 1. Goal
Introduce strict user authentication and data isolation to the DSA Preparation application. Every user must have their own private tracking of problems. No data should leak between users. 

## 2. Core Requirements
- **Authentication Provider**: Clerk (using `@clerk/clerk-react` for frontend and `@clerk/express` for backend).
- **Data Isolation (Multi-Tenancy)**: All user data must be strictly isolated. A user can only see, modify, or sync their own problem attempts.
- **Dynamic Configuration**: The `LEETCODE_USERNAME` configuration, currently global in `.env`, must be transitioned to a per-user setting stored in the database.
- **Strict Role Separation**: Controllers must inherently filter data using the authenticated `userId`. IDOR (Insecure Direct Object Reference) vulnerabilities must be structurally prevented.
- **UI Consistency**: Clerk's drop-in UI components (`<SignIn>`, `<UserButton>`, etc.) must be customized via the `appearance` prop to match the app's existing neutral/indigo Tailwind aesthetic.

## 3. Risk Assessment & Mitigations
- **Broken Object Level Authorization (IDOR)**: Mitigated by ensuring every MongoDB query includes `{ userId: req.auth.userId }`.
- **Middleware Gaps**: Mitigated by applying the `clerkMiddleware()` globally or at the root `/api/protected` router level, establishing a "fail-closed" environment.
- **Duplicate Data**: Instead of duplicating problem metadata (Title, URL) millions of times, we will implement a compound index in `ProblemProgress` tying a global `titleSlug` to a specific `userId`.
