# Directory Structure

The `dsa-preparation` codebase is organized as a monorepo containing both the frontend and backend applications, along with shared utility scripts and deployment configurations.

## Root Directory

The root level contains configuration files for deployment and project management.

- `.agent/`, `.github/`, `.planning/`: IDE configuration, GitHub Actions, and Agent/Planning context.
- `frontend/`: The Vite + React single-page application.
- `backend/`: The Node.js + Express API server and static content host.
- `scripts/`: Shared data scripts (e.g., seeding data into the database).
- `Dockerfile`, `Procfile`, `project.toml`: Configuration for various deployment platforms (Docker, Heroku-style buildpacks, Google Cloud).
- `README.md`, `CODEBASE_AUDIT.md`: Project documentation and audit logs.

---

## `/frontend`
The client-side application built with React, Vite, and TypeScript.

- **`src/`**: The core source code.
  - **`components/`**: React functional components. Contains shared UI components (`Tooltip`, `BaseModal`), view tabs (`HomeTab`, `TrackerTab`, `TracksTab`), and specific modals for interaction (`AddProblemModal`, `LoginModal`).
  - **`context/`**: React Context providers for global state management (`AuthContext.tsx` for user sessions, `NetworkStatusContext.tsx` for online/offline detection).
  - **`hooks/`**: Custom React hooks (`useCommandPalette.ts`, `useInfiniteScroll.ts`) encapsulating complex component logic.
  - **`lib/`**: Utility functions and networking tools. Includes `apiFetch.ts` for unified API requests, and caching implementations.
  - **`App.tsx`**: Main application router and shell layout. Handles tab switching and global modals.
  - **`main.tsx`**: React entry point and Service Worker registration.
  - **`types.ts`**: TypeScript interfaces defining frontend data models.

- **`public/`**: Static assets that are served directly by Vite without compilation.

---

## `/backend`
The server-side application built with Node.js, Express, and Mongoose.

- **`server.src.ts`**: The main Express server entry point. Configures middleware, connects routes, serves markdown content, and handles global error processing.
- **`content/theory/`**: A directory storing markdown files (`*.md`). These files contain DSA theory content with YAML frontmatter, dynamically served by the backend to the frontend.

- **`src/`**: The main backend logic.
  - **`controllers/`**: Request handlers grouped by business domains.
    - `authController.ts`: Registration and JWT login.
    - `syncController.ts`: LeetCode synchronization logic.
    - `trackerController.ts`: Problem tracking CRUD logic.
    - `trackController.ts`: Fetching and serving organized tracks.
    - `userController.ts`: User settings and profile handling.
  - **`models/`**: Mongoose schemas enforcing MongoDB structure.
    - `User.ts`: User credentials and preferences.
    - `Track.ts`: Curated problem lists/tracks.
    - `TrackedProblem.ts`: Individual user progress on specific problems.
  - **`routes/`**: Express Router definitions, mapping HTTP endpoints to their respective controllers.
  - **`middleware/`**: Request interceptors. Contains `authMiddleware.ts` for validating JWT Bearer tokens.
  - **`lib/`**: Backend utility modules.
    - `db.ts`: MongoDB connection logic and graceful shutdown handling.
    - `leetcodeScraperUtil.ts`: Helper utilities for scraping the LeetCode GraphQL API.

---

## `/scripts`
Utility scripts primarily used for administrative tasks, database migrations, and data seeding.

- **`data/`**: Raw JSON data files representing curated DSA tracks (e.g., `striver_track.json`).
- **`seedTracks.ts`**: Script to ingest track JSON files and push them into the MongoDB Atlas database.
