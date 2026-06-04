# Technology Stack

**Analysis Date:** 2024-05-24

## Languages

**Primary:**
- TypeScript 5.8 - Used across frontend components, backend server, and configurations.

**Secondary:**
- CSS - Custom styling in `src/index.css` supplementing Tailwind CSS.

## Runtime

**Environment:**
- Node.js (Types indicate v22 compatibility)

**Package Manager:**
- npm (based on `package-lock.json` and `package.json`)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- React 19.0 - Frontend UI library.
- Express 4.21 - Backend API server serving markdown content.

**Testing:**
- None detected

**Build/Dev:**
- Vite 6.2.3 - Frontend dev server and bundler.
- ESBuild 0.25 - Bundles the Node backend for production.
- TSX 4.21 - Executes the TypeScript backend server during development.
- Tailwind CSS 4.1.14 - Utility-first CSS framework via Vite plugin.

## Key Dependencies

**Critical:**
- `lucide-react` 0.546 - Vector icon library used extensively in UI.
- `react-markdown` 10.1 & `remark-gfm` 4.0 - Renders Markdown content in the preview panel.
- `github-markdown-css` 5.9 - Styles the rendered Markdown.
- `motion` 12.23 - Animation library (installed, potentially used for framer-motion transitions).

**Infrastructure:**
- `dotenv` 17.2 - Environment variable management for backend.

## Configuration

**Environment:**
- Configured via `.env` files (e.g., `VITE_API_URL` for frontend, `PORT` for backend).
- `VITE_API_URL` connects frontend to a remote or local Express instance.

**Build:**
- `vite.config.ts`: Configures React, Tailwind plugins, and disabled HMR for AI Studio.
- `tsconfig.json`: TypeScript compiler configuration.

## Platform Requirements

**Development:**
- Node.js installed, Vite for frontend, TSX for backend.

**Production:**
- Express server serves static bundled Vite assets from `dist` alongside API endpoints.

---

*Stack analysis: 2024-05-24*