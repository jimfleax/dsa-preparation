# Architecture Patterns

**Domain:** Native JWT Auth (Express + Mongoose + React)
**Researched:** 2024-05

## Recommended Architecture

The architecture relies on a stateless, token-based authentication loop between the client and server. 

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| React UI | Login/Register Forms | Auth Provider (`AuthContext`) |
| `AuthContext` | Global State (User, Token), `login()`, `logout()` | `apiClient` / `localStorage` |
| `apiClient` | Wrapper for `fetch` that attaches `Authorization` header and catches `401` | Express API (`/api/*`) |
| Express Auth Routes | Handle `/login`, `/register`, validate credentials, sign JWT | MongoDB User Model |
| Express Middleware | (`verifyToken`) Parse JWT, reject invalid, attach `req.user` | MongoDB / Next middleware |
| Mongoose User Model | Store schema, hash passwords before save | MongoDB Database |

### Data Flow

1. **Registration:** React Form -> POST `/api/auth/register` (Plain text pw) -> Mongoose `pre('save')` hashes pw -> Saved to DB.
2. **Login:** React Form -> POST `/api/auth/login` -> Express compares `bcryptjs.compare(input, hash)` -> If match, `jwt.sign({ userId }, SECRET)` -> Returns `{ token, user }`.
3. **Session Establishment:** `AuthContext` receives `{ token }`, calls `localStorage.setItem('token', token)`, updates React state to `isAuthenticated: true`.
4. **Authenticated Requests:** Client calls `apiClient('/api/protected')`. `apiClient` reads `token` from `localStorage`, adds `Authorization: Bearer <token>`.
5. **Backend Verification:** `verifyToken` middleware calls `jwt.verify()`. If valid, passes to controller. If expired, returns HTTP 401.
6. **Token Expiry Flow:** `apiClient` receives 401 -> triggers `AuthContext.logout()` -> removes `localStorage` -> Redirects to `/login`.

## Patterns to Follow

### Pattern 1: Mongoose Pre-Save Hook
**What:** Automatically hashing passwords before storing.
**When:** Always, on User schema.
**Example:**
```typescript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});
```

### Pattern 2: Global Fetch Wrapper / Interceptor
**What:** Centralizing token injection and 401 handling so you don't repeat it in every component.
**When:** For all authenticated API calls.
**Example:**
```typescript
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Trigger global logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return response;
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Leaking Passwords to the Client
**What:** Returning the entire User object (including the password hash) in API responses.
**Why bad:** Security vulnerability.
**Instead:** Return a sanitized DTO. E.g., `const { password, ...userWithoutPassword } = user.toObject(); return res.json(userWithoutPassword);`

### Anti-Pattern 2: LocalStorage for highly sensitive apps
**What:** Storing JWT in `localStorage` in domains like banking.
**Why bad:** Vulnerable to XSS.
**Instead:** For standard MVP/indie apps, `localStorage` is fine. For enterprise/finance, use `HttpOnly` Secure Cookies.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Token Validation | CPU bound `jwt.verify` is fast enough. | Still fast enough. | Might need to split Auth server from main API server (Microservice). |
| Token Revocation | Not supported with stateless JWTs. | If needed, introduce a Redis blacklist. | Redis blacklist for revoked tokens. |