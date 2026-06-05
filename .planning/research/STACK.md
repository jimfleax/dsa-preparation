# Technology Stack

**Project:** React + Express Authentication
**Researched:** 2024

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18+ | Frontend UI | Component-based structure, perfect for Clerk's pre-built UI components. |
| Express.js | 4.x | Backend API | Lightweight, robust ecosystem, supported directly by Clerk's Express SDK. |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MongoDB | 6+ | Application Data | Flexible schema for storing `ProblemProgress` and relational user data indexed by Clerk `userId`. |

### Infrastructure / Authentication
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Clerk | Latest | Auth & Identity | Out-of-the-box UI components, secure session management, and simplified JWT verification. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@clerk/clerk-react` | Latest | React Client SDK | Wrap the app and render UI components (`<SignIn>`, `<UserButton>`). |
| `@clerk/express` | Latest | Express Server SDK | Verify session JWTs, protect routes, and extract `userId` on the backend. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Backend Auth SDK | `@clerk/express` | `@clerk/clerk-sdk-nodejs` | Deprecated. `@clerk/express` is the new standard tailored specifically for Express middleware. |
| DB Sync | Direct Querying (No DB User Model) | Svix Webhooks | Unless a leaderboard is needed, syncing all user data to MongoDB via webhooks adds unnecessary infrastructure overhead. |

## Installation

```bash
# Frontend setup (React)
npm install @clerk/clerk-react

# Backend setup (Express)
npm install @clerk/express
```

## Setup & Configuration

**Frontend (`.env.local`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Backend (`.env`):**
```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Sources

- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Express Quickstart](https://clerk.com/docs/quickstarts/express)