# Directory Structure & Modules

```
.
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── lib/              # DB connection & utilities
│   │   ├── middleware/       # Auth guards
│   │   ├── models/           # Mongoose schemas
│   │   └── routes/           # Express router configurations
│   ├── package.json
│   └── server.src.ts         # Main Express entry point
│
├── frontend/                 # React SPA
│   ├── public/               # Static assets & SPA rewrites (_redirects)
│   ├── src/
│   │   ├── components/       # Reusable UI (Admin vs Public separated)
│   │   ├── context/          # Global State (Auth, AdminAuth, Network)
│   │   ├── pages/            # View components
│   │   ├── tests/            # Vitest integration suites
│   │   ├── AdminApp.tsx      # Entry for /admin routes
│   │   ├── App.tsx           # Entry for / routes
│   │   └── main.tsx          # Root DOM renderer
│   ├── vite.config.ts
│   └── vercel.json           # Vercel SPA routing
│
├── scripts/                  # Utility and management scripts
├── Dockerfile                # Production container for backend
└── Procfile                  # Runner for HuggingFace/Heroku
```
