# Technology Stack

This document outlines the major frameworks, libraries, APIs, and databases used in the project.

## Frontend
- **Framework**: React 19.0
- **Routing**: React Router DOM (`react-router-dom`)
- **Build Tool / Bundler**: Vite
- **PWA Capabilities**: Vite PWA plugin (`vite-plugin-pwa`), Workbox (`workbox-core`, `workbox-window`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`), Github Markdown CSS (`github-markdown-css`)
- **Animations / UI**: Framer Motion (`motion`), Lucide React (`lucide-react`)
- **Charts / Visualization**: Recharts (`recharts`)
- **Markdown Rendering**: React Markdown (`react-markdown`), Remark GFM (`remark-gfm`)
- **State Management & Local DB**: Dexie (IndexedDB), RxDB, RxJS
- **Authentication**: React OAuth Google (`@react-oauth/google`)
- **Testing**: Vitest, React Testing Library (`@testing-library/react`), JSDOM

## Backend
- **Framework**: Express (Node.js)
- **Language**: TypeScript
- **Build Tool / Runner**: ESBuild, TSX
- **Database ORM**: Mongoose (`mongoose`)
- **Authentication & Security**: 
  - JWT (`jsonwebtoken`)
  - Password Hashing (`bcryptjs`)
  - Rate Limiting (`express-rate-limit`)
  - CORS (`cors`)
- **Validation**: Zod
- **External Integration Libraries**: 
  - Google GenAI (`@google/genai`)
  - Google Auth Library (`google-auth-library`)
- **Testing**: Jest, Supertest, MongoDB Memory Server (`mongodb-memory-server`)

## Infrastructure / Deployment
- **Containerization**: Docker (Multi-stage build)
- **Hosting Strategy**: Configured via `project.toml` and `Procfile` for Google Cloud PaaS (e.g. Google Cloud Run or App Engine). Serves both API and (potentially) static assets via Express.
