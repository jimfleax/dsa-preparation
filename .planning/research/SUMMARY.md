# Research Summary: React + Express Authentication with Clerk

**Domain:** Authentication & Identity Management
**Researched:** 2024
**Overall confidence:** HIGH

## Executive Summary

Integrating Clerk into a React (frontend) and Express (backend) architecture offers a robust, modern authentication solution. The current recommended approach utilizes two distinct SDKs: `@clerk/clerk-react` for the frontend UI and session management, and the newly updated `@clerk/express` for backend route protection and JWT verification. 

This research focused on four main objectives: wrapping the React application and utilizing core UI components, applying Tailwind-compatible customizations via the `appearance` prop, securing Express routes, and evaluating the architectural tradeoffs of storing user metadata (like a LeetCode username) in Clerk vs. a custom MongoDB setup.

## Key Findings

**Stack:** `@clerk/clerk-react` for the frontend and `@clerk/express` for the backend, moving away from the deprecated Node.js SDK.
**Architecture:** A **Hybrid Storage Pattern** is recommended. Use Clerk as the source of truth for identity and simple settings (`publicMetadata`), while using MongoDB for relational domain data (`ProblemProgress`) keyed by the Clerk `userId`.
**Critical pitfall:** Failing to account for Tailwind v4 specificity layers or exceeding Clerk's metadata size limits (8KB total, <1.2KB in session tokens).

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 1: Foundation Auth Setup** - Simplest integration to lock down the app.
   - Addresses: React `<ClerkProvider>` wrapper, basic login/logout via `<SignInButton>` and `<UserButton>`.
   - Avoids: Custom UI overhead initially.

2. **Phase 2: Backend Security Integration** - Securing data endpoints.
   - Addresses: Adding `clerkMiddleware()` globally and `requireAuth()` to specific routes in Express. Extracting `userId` for MongoDB queries.
   - Avoids: Exposing API keys and rolling custom JWT verification logic.

3. **Phase 3: UI Customization & Metadata** - Theming and user preferences.
   - Addresses: Styling Clerk components with the `appearance` prop to match the neutral/indigo Tailwind theme. Adding `leetcode_username` to `publicMetadata`.

**Phase ordering rationale:**
- Implementing standard components first ensures the JWT handshakes work end-to-end before introducing custom styling or database webhooks. The backend must be secured before saving user-specific data to MongoDB.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with latest Clerk Express/React Quickstarts (2024 versions). |
| Features | HIGH | Standard use case for Clerk's feature set. |
| Architecture | HIGH | Metadata vs. DB tradeoffs are well-documented by Clerk's official guides. |
| Pitfalls | HIGH | Common issues like Tailwind specificity and SDK versioning are prominent in community discussions. |

## Gaps to Address

- Need to determine if the application requires a global user leaderboard. If YES, Webhooks must be implemented to sync Clerk users to a MongoDB `User` collection. If NO, storing the `userId` directly on the `ProblemProgress` model is sufficient.