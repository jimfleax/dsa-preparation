# Architecture Overview

The `dsa-preparation` project is a modern, full-stack application built for tracking and practicing Data Structures and Algorithms. The architecture is broadly divided into a React-based frontend and an Express/Node.js backend, coupled with a MongoDB database for persistence.

## 1. High-Level System Architecture

- **Frontend:** Single Page Application (SPA) built with React and Vite. It serves as the main UI, rendering dashboards, tracking interfaces, and markdown-based theory documents.
- **Backend:** Node.js server powered by Express. It acts as an API layer serving static content (Markdown documents) and dynamic content (user data, tracks, progress tracking).
- **Database:** MongoDB, managed via Mongoose ODM. It persists multi-tenant user data, tracks, and problem attempts.
- **External API Integrations:** 
  - **LeetCode GraphQL API:** The backend proxies requests to LeetCode to scrape metadata (problem titles, difficulties) and user profile data (calendars, submissions) to facilitate syncing.

## 2. Separation of Concerns

### Frontend
The frontend follows a component-driven architecture:
- **Presentation Layer:** React components (`frontend/src/components/`) handle rendering and user interactions. TailwindCSS is used for styling.
- **State Management & Logic:** React Context API (`AuthContext`, `NetworkStatusContext`) is used for global state. Custom hooks (`useCommandPalette`, `useInfiniteScroll`) encapsulate reusable logic.
- **Data Fetching Layer:** A custom wrapper (`apiFetch`) is used for interacting with the backend API, abstracting away the fetch API complexities and handling token injections natively.

### Backend
The backend follows an MVC-like (Model-View-Controller) pattern, adapted for a pure JSON API:
- **Routing:** Express routes (`backend/src/routes/`) define endpoints and map them to specific controller functions.
- **Controllers:** Business logic and external API communication live here (`backend/src/controllers/`). They handle the core application operations like authentication, syncing with LeetCode, and CRUD for problem tracking.
- **Models:** Mongoose schemas (`backend/src/models/`) define the shape of database documents and handle validation and pre-save hooks (e.g., password hashing).
- **Static Content Handling:** A portion of the backend (`server.src.ts`) directly reads from the local file system (`backend/content/theory/`) to parse markdown files with frontmatter and serve them via REST endpoints.

## 3. Data Flow

### 3.1 Static Markdown Content Flow
1. **Authoring:** Theory documents are written as `.md` files in `backend/content/theory/` with YAML frontmatter containing metadata (title, tags).
2. **Serving:** The backend parses these files at runtime. The `/api/documents` endpoint serves just the metadata, while `/api/document?filename=...` serves both the metadata and the markdown content.
3. **Rendering:** The frontend fetches this data and renders it natively.

### 3.2 Dynamic Data (Tracking & Tracks) Flow
1. **User Action:** A user completes a problem or updates settings on the UI.
2. **API Call:** The frontend sends a request to a protected endpoint (e.g., `/api/tracker`). The request includes a JWT Bearer token.
3. **Middleware:** `authMiddleware.ts` intercepts the request, validates the JWT, and attaches the user identity to the request.
4. **Controller & DB:** The controller uses Mongoose to perform operations on the `TrackedProblem` or `Track` collections. Multi-tenancy is enforced by querying against the `userId`.
5. **Response:** The updated state is sent back to the client as JSON.

### 3.3 LeetCode Integration & Sync Flow
To sync progress without requiring manual entry:
1. The user provides their LeetCode username.
2. The frontend triggers a sync request via `/api/sync/check`.
3. The backend makes requests to LeetCode's GraphQL endpoints, fetching recent submissions and parsing the data.
4. The backend compares fetched submissions against the database to find new or revisited problems and returns a diff to the frontend.
5. The frontend prompts the user to track these problems.

## 4. Security & Authentication

- **Authentication:** Custom JWT-based authentication. Passwords are encrypted using `bcryptjs` via Mongoose pre-save hooks before landing in the database.
- **Authorization:** `requireAuth` middleware secures sensitive endpoints.
- **CORS & Rate Limiting:** The backend uses `cors` strictly configured for the frontend origin and `express-rate-limit` for scraping endpoints to prevent abuse.
- **Data Isolation:** All database collections tied to a user (`TrackedProblem`) utilize a `userId` field, and compound indexes (`{ userId: 1, titleSlug: 1 }`) guarantee unique tracking per user.
