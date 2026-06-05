# Codebase Concerns

**Analysis Date:** 2025-05-18

## Tech Debt

**Mongoose Relational Mapping:**
- Issue: `ProblemProgress.ts` defines `userId` as `type: String` instead of using `Schema.Types.ObjectId` with `ref: 'User'`. Furthermore, the file contains stale comments referencing "Clerk ID" despite the application having been migrated to native authentication using Mongoose.
- Files: `src/models/ProblemProgress.ts`
- Impact: Loses native Mongoose capabilities like `.populate()` and referential integrity (e.g., cascading deletes). 
- Fix approach: Update the schema to use `Schema.Types.ObjectId`, add a `ref: 'User'`, and implement a user-deletion cascade script to clean up orphaned `ProblemProgress` records when/if a user is deleted.

## Known Bugs

**Frontend Token Expiration Handling:**
- Symptoms: App displays the user as "signed in" because the token exists in `localStorage`, but API calls silently fail or return `401 Unauthorized`.
- Files: `src/context/AuthContext.tsx`
- Trigger: Closing the app, waiting until the JWT token expires (30 days), and reopening the app. The frontend does not verify token expiration before considering the user authenticated.
- Workaround: The user must manually log out to clear `localStorage`, or clear the browser cache.
- Fix approach: Decode the token in the frontend on mount to check the expiration time (`exp` claim) before applying `isSignedIn: true`. Additionally, implement a global `fetch` wrapper or interceptor to automatically trigger a logout when a `401 Unauthorized` response is received.

## Security Considerations

**Token Storage in LocalStorage:**
- Risk: The JWT token is currently stored in `localStorage`, making it accessible to client-side JavaScript. This opens the application to severe Cross-Site Scripting (XSS) risks where attackers could exfiltrate active session tokens.
- Files: `src/context/AuthContext.tsx`
- Current mitigation: React escapes HTML natively which reduces the XSS surface area, but third-party dependencies remain a vector.
- Recommendations: Migrate JWT storage to an `HttpOnly`, `Secure`, `SameSite=Strict` cookie handled by the backend, significantly reducing client-side extraction risks.

## Performance Bottlenecks

**Not detected**

## Fragile Areas

**Not detected**

## Scaling Limits

**Not detected**

## Dependencies at Risk

**Not detected**

## Missing Critical Features

**Data Lifecycle Management (Orphaned Data):**
- Problem: If a user account is ever deleted, their associated `ProblemProgress` entities will remain in the database indefinitely. There is currently no `userController.ts` method to delete users, but if one is added in the future without addressing this, it will cause data bloat.
- Blocks: Strict data privacy compliance (such as GDPR right to erasure) where deleting a user should reliably cascade to all associated records.

## Test Coverage Gaps

**Integration Testing for Data Isolation / IDOR:**
- What's not tested: Cross-user authorization boundaries and IDOR protections.
- Files: `src/controllers/problemController.ts`
- Risk: Future modifications to compound queries (`{ _id: id, userId }`) could accidentally expose one user's data to another without immediate detection.
- Priority: High

---

*Concerns audit: 2025-05-18*