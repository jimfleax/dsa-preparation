# Feature Landscape

**Domain:** Authentication & User Settings Management
**Researched:** 2024

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Secure Login/Logout | Core necessity for personal progress tracking | Low | Provided out-of-the-box by `<SignInButton>` and `<UserButton>`. |
| Protected API Routes | Prevents unauthorized modifications to progress | Low | Implemented via `requireAuth()` Express middleware. |
| Contextual UI | Shows content only when logged in | Low | Achieved wrapping content in `<SignedIn>` and `<SignedOut>`. |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Seamless Theming | Auth components don't look like an iframe/3rd party embed | Medium | Uses the `appearance={{ elements: {...} }}` prop to map Clerk styles to the project's Tailwind neutral/indigo theme. |
| Instant Settings Load | LeetCode username or preferences load instantly without DB lookup | Low | Utilizing Clerk's `publicMetadata` includes settings directly in the session JWT. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom JWT Issuance | High risk of security vulnerabilities, complex refresh token logic. | Rely on Clerk's session tokens and `@clerk/express` to verify them automatically. |
| Custom Password Reset UI | Unnecessary development overhead. | Use Clerk's built-in, highly optimized `<SignIn>` component flows. |

## Feature Dependencies

```
<ClerkProvider> Wrapper → `<SignedIn>` State → Express API Requests (with auth header)
```

## MVP Recommendation

Prioritize:
1. Wrap `<App>` in `<ClerkProvider>`.
2. Add `<SignedIn><UserButton /></SignedIn>` and `<SignedOut><SignInButton /></SignedOut>` to the main navigation.
3. Secure the `/api/progress` Express route with `requireAuth()`.

Defer: Complex webhook synchronization to mirror the Clerk user base into MongoDB until a specific feature (like a social leaderboard) demands it.

## Sources

- [Clerk Component Customization](https://clerk.com/docs/components/customization/overview)