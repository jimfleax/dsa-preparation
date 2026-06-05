# Technology Stack

**Project:** Native JWT Auth Implementation
**Researched:** 2024-05

## Recommended Stack

### Core Framework (Backend)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `express` | Current | API Routing | Existing framework in project. |
| `mongoose` | Current | Database ODM | Easily handle User schema and pre-save hooks for password hashing. |

### Security & Authentication
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `bcryptjs` | ^2.4.3 | Password Hashing | Use instead of `bcrypt`. `bcryptjs` is pure JS, avoiding OS-level native build dependency issues (like `node-gyp` errors) while maintaining the exact same security algorithm. |
| `jsonwebtoken` | ^9.0.2 | Token signing/verifying | The industry standard for creating and decoding JWTs in Node.js. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | Current | Environment Variables | To securely store the `JWT_SECRET`. |
| `cors` | Current | Cross-Origin | Ensure frontend can communicate with backend if domains/ports differ. |

### Core Framework (Frontend)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react` | Current | UI & State | Use Context API (`createContext`, `useContext`) to build `AuthContext`. |
| `react-router-dom` | Current | Routing | To implement protected routes that redirect to `/login` if unauthenticated. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Hashing | `bcryptjs` | `argon2` / `bcrypt` | `bcrypt` requires native bindings. `argon2` is arguably more secure but often overkill for standard apps and also requires native bindings. `bcryptjs` hits the sweet spot for ease of use and security. |
| Token Storage | `localStorage` | `HttpOnly` Cookies | `HttpOnly` cookies are immune to XSS but susceptible to CSRF and can complicate SPA setups (CORS, credentials, different domains). `localStorage` is chosen for simplicity, prioritizing speed of implementation while accepting the XSS tradeoff. |
| HTTP Client | Native `fetch` | `axios` | `fetch` is native and lightweight. Axios provides automatic interceptors which are nice, but `fetch` can be easily wrapped in a custom utility to achieve the exact same 401 interception without an extra dependency. |

## Installation

```bash
# Core Backend Dependencies
npm install bcryptjs jsonwebtoken

# Dev dependencies (Types)
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## Sources
- Express Security Best Practices
- Mongoose Middleware Documentation
- React Context API Docs