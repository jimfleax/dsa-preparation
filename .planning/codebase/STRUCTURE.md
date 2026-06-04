# Codebase Structure

**Analysis Date:** 2024-05-24

## Directory Layout

```
[project-root]/
├── content/              # Markdown data sources
│   ├── problemsheets/    # Problem sheet markdown files
│   └── theory/           # Theory reference markdown files
├── src/                  # Frontend source code
│   ├── components/       # Reusable React components
│   ├── App.tsx           # Main application view and logic
│   ├── main.tsx          # Frontend entry point
│   ├── types.ts          # Shared TypeScript interfaces
│   └── index.css         # Global CSS and Tailwind directives
└── server.ts             # Backend Express server entry point
```

## Directory Purposes

**`content/`:**
- Purpose: Acts as the file-based database for the application.
- Contains: Markdown (`.md`) files formatted with YAML frontmatter.
- Key files: `content/theory/nested_loop_illusion_amortized_analysis.md`

**`src/components/`:**
- Purpose: Encapsulates isolated UI modules to keep the main app view clean.
- Contains: React Functional Components (`.tsx`).
- Key files: `DocumentCard.tsx`, `PreviewPanel.tsx`, `StatsGrid.tsx`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM rendering root.
- `server.ts`: Express API configuration and server startup.

**Configuration:**
- `vite.config.ts`: Vite bundler configuration and plugins.
- `package.json`: Project scripts and dependencies.
- `tsconfig.json`: TypeScript compiler settings.

**Core Logic:**
- `src/App.tsx`: Central state container handling fetching, filtering, and layout orchestration.

**Testing:**
- No test directories or files detected.

## Naming Conventions

**Files:**
- PascalCase for React components: `DocumentCard.tsx`
- camelCase for logic/types: `types.ts`, `server.ts`

**Directories:**
- camelCase or lowercase: `components`, `theory`, `problemsheets`

## Where to Add New Code

**New Feature (e.g. 'Problems' Tab):**
- Primary code: Extend state variables and conditional rendering in `src/App.tsx` (or refactor into a dedicated `ProblemsTab.tsx` component).
- Components: Build list view and modal within `src/components/` by replicating or reusing `DocumentCard.tsx` and `PreviewPanel.tsx`.

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx`

**Utilities:**
- Shared helpers: Can be placed in a new `src/utils/` directory or added to `src/types.ts` if type-related.

## Special Directories

**`content/`:**
- Purpose: Stores markdown content parsed by the backend.
- Generated: No (manually curated).
- Committed: Yes.

---

*Structure analysis: 2024-05-24*