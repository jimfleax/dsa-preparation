# Tech Stack Documentation

## Frontend
- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, `github-markdown-css`
- **UI Components:** `lucide-react` (icons), `react-loading-skeleton`
- **Animations:** `motion` (Framer Motion)
- **Data Visualization:** `recharts`
- **Data Management & Offline Support:** 
  - `dexie` (IndexedDB wrapper)
  - `rxdb` & `rxjs` (Reactive database handling)
- **Markdown Rendering:** `react-markdown` with `remark-gfm`
- **PWA Capabilities:** `vite-plugin-pwa`, `workbox-core`, `workbox-window`

## Backend
- **Environment:** Node.js (v20 target)
- **Framework:** Express.js
- **Language:** TypeScript (built with `esbuild` for production, `tsx` for dev)
- **Database ODM:** Mongoose (for MongoDB)
- **Security & Validation:**
  - `zod` for robust input and schema validation
  - `bcryptjs` for password hashing
  - `cors` and `express-rate-limit` for secure cross-origin requests and rate limiting
- **Authentication:** `jsonwebtoken` for stateless JWT-based session management

## Infrastructure & Deployment
- **Containerization:** Docker (multi-stage `Dockerfile` using `node:20-alpine`)
- **Cloud & Hosting:** Google Cloud Buildpacks configured via `project.toml` and `.gcloudignore`, targeting Google Cloud Run or App Engine.
- **Database Hosting:** MongoDB Atlas cluster (identified via `mongodb+srv://` connection strings in utility scripts).
- **Process Management:** Procfile defined for production web processes.
