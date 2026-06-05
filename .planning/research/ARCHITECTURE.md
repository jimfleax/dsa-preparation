# Architecture Patterns

**Domain:** Authentication & Data Storage Strategy
**Researched:** 2024

## Recommended Architecture

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `<ClerkProvider>` | Global auth state management in React | Clerk APIs, Browser Storage |
| `@clerk/express` Middleware | Intercepts HTTP requests, parses/verifies session token | Express Routes, Clerk API (for JWKS) |
| MongoDB Collections | Stores domain data (e.g., `ProblemProgress`) | Express Route Handlers |

### Data Flow

1. **Client Auth:** User signs in via `<SignIn />`. Clerk sets an active session.
2. **API Request:** Frontend makes a fetch request. The session token is automatically attached (if using cookies on same domain) or fetched manually via `const token = await getToken()`.
3. **Backend Verification:** Express receives the request. The `clerkMiddleware()` extracts the token, verifies the signature against the Clerk public key, and populates `req.auth`.
4. **Data Access:** Route handler uses `const { userId } = getAuth(req)` to execute a MongoDB query: `ProblemProgress.find({ userId })`.

## Patterns to Follow

### Pattern 1: Hybrid Data Storage (User Settings)
**What:** Deciding where to store "LeetCode Username" vs "Problem Progress".
**Recommendation:** 
- **Clerk `publicMetadata`:** Store scalar, non-relational, frequently accessed user preferences (like `leetcode_username`, `theme`). This data is injected into the session token and available instantly on the frontend (`user.publicMetadata.leetcode_username`) without a database hit.
- **MongoDB:** Store relational data (`ProblemProgress`). You do **not** need a separate `User` MongoDB model unless you require cross-user queries (e.g., leaderboards). Just store `userId` directly on the `ProblemProgress` document.

**Example:**
```javascript
// Saving LeetCode username (Backend Express via Clerk Client)
import { clerkClient } from '@clerk/express';

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    leetcode_username: "user123"
  }
});
```

### Pattern 2: Tailored UI Customization
**What:** Using Tailwind to style Clerk components.
**When:** Theming the `<SignIn />` or `<UserButton />` to match a neutral/indigo palette.

**Example:**
```tsx
<ClerkProvider
  appearance={{
    variables: {
      colorPrimary: '#4f46e5', // Tailwind indigo-600
      colorText: '#171717',    // Tailwind neutral-900
      colorBackground: '#ffffff',
    },
    elements: {
      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
      card: 'border border-neutral-200 shadow-xl rounded-xl bg-white',
    }
  }}
>
  <App />
</ClerkProvider>
```

### Pattern 3: Backend Route Security
**What:** Securing Express API endpoints using `@clerk/express`.
**Example:**
```typescript
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import express from 'express';

const app = express();

// 1. Global Session Parser
app.use(clerkMiddleware());

// 2. Strict Route Guard
app.get('/api/progress', requireAuth(), async (req, res) => {
  // 3. Safe Extraction
  const { userId } = getAuth(req);
  
  const progress = await ProblemProgress.find({ userId });
  res.json(progress);
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Webhook Over-engineering
**What:** Immediately setting up Svix webhooks to duplicate every Clerk user into a MongoDB `users` collection.
**Why bad:** Introduces points of failure, synchronization lag, and infrastructure overhead.
**Instead:** Only build an internal `User` table if you need to perform relational joins across multiple users (e.g., matching users, global leaderboards). For personal dashboards, `userId` on the specific models is sufficient.

### Anti-Pattern 2: Storing Large Data in Metadata
**What:** Attempting to store an array of solved problems in Clerk's `publicMetadata`.
**Why bad:** Clerk enforces an 8KB hard limit, and putting it in the token can exceed cookie headers (>1.2KB).
**Instead:** Use MongoDB.

## Sources

- [Clerk Metadata Docs](https://clerk.com/docs/users/metadata)
- [Clerk Express SDK](https://clerk.com/docs/references/express/overview)