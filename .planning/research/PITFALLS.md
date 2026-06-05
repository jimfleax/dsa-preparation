# Domain Pitfalls

**Domain:** Authentication & Identity Management
**Researched:** 2024

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Using the Deprecated Node SDK
**What goes wrong:** Following older tutorials that suggest installing `@clerk/clerk-sdk-nodejs`.
**Why it happens:** AI models or blog posts from 2023 or earlier.
**Consequences:** Lack of support for newer features, difficult middleware implementation, and potential security deprecations.
**Prevention:** Strictly use `@clerk/express` for Express applications.

### Pitfall 2: Overloading Metadata Limits
**What goes wrong:** The application crashes when updating user preferences, or the session token fails to attach to network requests.
**Why it happens:** Developers store large arrays (like list of completed problems) inside `publicMetadata`.
**Consequences:** Clerk API rejects updates > 8KB. HTTP Headers reject tokens > 1.2KB, effectively logging the user out or breaking APIs.
**Prevention:** Only store simple key-value settings (e.g., `leetcode_username`, `is_pro_member`) in metadata. Store all arrays, historical data, and progress metrics in MongoDB.

## Moderate Pitfalls

### Pitfall 1: Tailwind CSS v4 Specificity Wars
**What goes wrong:** Your custom `appearance={{ elements: {...} }}` Tailwind classes are ignored, and Clerk's default styles stubbornly persist.
**Why it happens:** If using Tailwind v4, Clerk's injected stylesheets might have higher specificity than standard utility classes.
**Prevention:** Wrap Clerk's styles in a CSS layer. 
```tsx
<ClerkProvider appearance={{ cssLayerName: 'clerk' }}>
```
```css
/* index.css */
@layer theme, base, clerk, components, utilities;
```

### Pitfall 2: `clerkMiddleware` vs `requireAuth` Ordering
**What goes wrong:** `requireAuth()` throws errors or fails to block unauthorized requests.
**Why it happens:** Not initializing the parser.
**Prevention:** `app.use(clerkMiddleware())` **must** be executed before `requireAuth()` is called on any specific route.

## Minor Pitfalls

### Pitfall 1: Frontend Token Retrieval
**What goes wrong:** API calls from the React app to the Express backend return 401 Unauthorized.
**Why it happens:** Assuming `clerkMiddleware` handles cross-origin requests automatically without attaching the token.
**Prevention:** Use the `useAuth()` hook to explicitly retrieve and attach the token.
```javascript
const { getToken } = useAuth();
const token = await getToken();
fetch('/api/data', { headers: { Authorization: `Bearer ${token}` } });
```

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Backend Setup | Missing `.env` keys | Ensure both `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are present in backend `.env`. |
| UI Theming | Unstyled components | Use the `variables` key for global colors (primary/background) before micro-managing `elements`. |

## Sources

- [Clerk Metadata Limits](https://clerk.com/docs/users/metadata)
- [Clerk Express Guide](https://clerk.com/docs/quickstarts/express)