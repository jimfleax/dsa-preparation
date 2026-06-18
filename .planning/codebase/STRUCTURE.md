# Folder Structure

The repository is organized into two primary workspaces: `backend` and `frontend`, with top-level configurations and scripts handling full-stack tasks.

## Root Directory

```text
/home/reetabratabhandari/Projects/dsa-preparation/
├── backend/          # Node.js + Express API server
├── frontend/         # React + Vite Client Application
├── scripts/          # Node.js scripts for DB management, batch fetching, validation
├── _dev/             # Development notes, mock files
├── backups/          # Database backups and bulk exports
├── docs/             # Project documentation
├── feature_plans/    # Planning documents for future features
├── .planning/        # AI Agent context and generated codebase maps
├── README.md         # Main project documentation
├── Dockerfile        # Containerization configuration
└── Procfile          # Production execution commands
```

## Key Modules Breakdown

### 1. Backend (`/backend`)

The backend follows an MVC-inspired structured layout.

```text
backend/
├── server.src.ts           # Main Express application entry point, mounts routes & middleware
├── package.json            # Backend dependencies
├── content/
│   └── theory/             # Markdown files representing learning resources
└── src/
    ├── controllers/        # Request handlers (Business Logic)
    │   ├── authController.ts      # Handles Google OAuth & JWT generation
    │   ├── syncController.ts      # LeetCode synchronization logic
    │   ├── trackerController.ts   # Problem tracking and revisit algorithms
    │   ├── documentController.ts  # Parses and serves local markdown theory files
    │   ├── trackController.ts     # Manages predefined DSA learning tracks
    │   └── userController.ts      # User preferences and settings
    ├── models/             # Mongoose Schemas (Data Access Layer)
    │   ├── User.ts                # User profiles and LeetCode usernames
    │   ├── TrackedProblem.ts      # Instances of problems solved by users
    │   ├── Track.ts               # Track metadata and sub-problems
    │   └── LearningDoc.ts         # Optional model for indexed learning resources
    ├── routes/             # Express Route Definitions mapping to controllers
    │   ├── admin/                 # Protected admin-level endpoints
    │   └── ...                    # auth, tracker, sync, user, etc.
    ├── middleware/         # Express Middlewares
    │   └── authMiddleware.ts      # JWT Validation
    └── lib/                # Utility functions and Core configurations
        ├── db.ts                  # MongoDB connection logic
        └── leetcodeScraperUtil.ts # Functions to scrape LeetCode GraphQL APIs
```

### 2. Frontend (`/frontend`)

The frontend is a classic React application initialized with Vite.

```text
frontend/
├── index.html              # HTML Entry Point
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite bundler configuration
├── public/                 # Static assets (icons, manifest)
└── src/
    ├── App.tsx             # Main Application Component and Route/Tab layout
    ├── main.tsx            # React DOM mounting
    ├── components/         # Reusable UI Components
    │   ├── Admin/                 # Admin specific components
    │   ├── CommandPalette.tsx     # Global Ctrl+K search and quick-actions
    │   ├── TrackerTab.tsx         # Problem tracking view
    │   ├── TracksTab.tsx          # Predefined tracks view
    │   └── ...                    # Modals, tooltips, cards, alerts
    ├── pages/              # Top level views
    │   └── admin/                 # Admin Dashboard pages
    ├── context/            # React Context Providers
    │   ├── AuthContext.tsx        # Provides user state across the app
    │   └── NetworkStatusContext.ts# Tracks online/offline status
    ├── hooks/              # Custom React Hooks
    │   ├── useCommandPalette.ts   # Logic for the command palette
    │   ├── useDocuments.ts        # Data fetching logic for markdown docs
    │   └── ...
    └── lib/                # Frontend utilities
        ├── apiFetch.ts            # Custom fetch wrapper handling RxDB caching
        └── apiCache.ts            # RxDB configuration for offline support
```

### 3. Scripts (`/scripts`)

Top-level management scripts primarily intended for automated and CLI usage.

```text
scripts/
├── manage_tracks.js     # Imports/Upserts JSON tracks into the DB
├── fetch_problem.js     # Fetches title/difficulty from LeetCode for a single problem
├── fetch_batch.js       # Batch fetches LeetCode metadata from a markdown list
├── validate_track.js    # Validates track JSON files against the strict schema
├── db_audit.js          # MongoDB health and duplicate tracking
├── db_deduplicate.js    # Removes duplicated problem entries
└── db_bulk_export.js    # Backs up the entire database to JSON
```
