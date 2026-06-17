# Comprehensive Refactoring Plan

This plan synthesizes findings from backend and frontend codebase analyses, focusing on structural complexity (R1) and performance bottlenecks (R2).

## 1. Backend Refactoring Plan

### 1.1 Structural Complexity

**God File / SRP Violation**
- **File:** `server.src.ts` (lines 120-280)
- **Issue:** The main server file acts as a monolithic entry point, containing Express setup, CORS configuration, raw business logic for fetching documents (inline Markdown parsing via `parseFrontmatter`), and a `/api/leetcode/calendar/:username` proxy.
- **Actionable Fix:** Extract document reading and Markdown parsing to a new `src/controllers/documentController.ts` and `src/routes/documentRoutes.ts`. Move the calendar proxy to `src/controllers/trackerController.ts`.

### 1.2 Performance Bottlenecks

**1. Synchronous File I/O**
- **File:** `server.src.ts` (lines 125-147, 150-192)
- **Issue:** Endpoints `/api/documents` and `/api/document` use synchronous file system operations (`fs.existsSync`, `fs.readdirSync`, `fs.statSync`, `fs.readFileSync`) inside route handlers, which blocks the Node.js event loop for all concurrent requests.
- **Actionable Fix:** Replace `fs.*Sync` methods with their asynchronous `fs.promises.*` counterparts.
- **Code Snippet:**
  ```typescript
  import { promises as fs } from 'fs';
  // Replace fs.readFileSync with:
  const content = await fs.readFile(filePath, "utf-8");
  ```

**2. N+1 Queries and Sequential Network Calls**
- **File:** `src/controllers/syncController.ts` (lines 119-162)
- **Issue:** The `trackSubmissions` endpoint iterates over a `submissions` array using a `for...of` loop. Inside the loop, it sequentially executes `TrackedProblem.findOne()`, makes an external network call `getLeetCodeProblemInfo()`, and calls `progress.save()`. This scales poorly (O(N) latency).
- **Actionable Fix:** Use `insertMany` and `Promise.all` for batching requests to the database and external API.
- **Code Snippet:**
  ```typescript
  const slugs = submissions.map(s => s.titleSlug);
  const existing = await TrackedProblem.find({ userId, titleSlug: { $in: slugs } });
  const existingSet = new Set(existing.map(e => e.titleSlug));
  
  const newSubmissions = submissions.filter(s => !existingSet.has(s.titleSlug));
  // Use Promise.all to fetch difficulty concurrently (consider a concurrency limiter for LeetCode)
  const newRecords = await Promise.all(newSubmissions.map(async sub => {
     const url = `https://leetcode.com/problems/${sub.titleSlug}/`;
     const info = await getLeetCodeProblemInfo(url).catch(() => null);
     return { userId, titleSlug: sub.titleSlug, title: sub.title, url, difficulty: info?.difficulty, attemptCount: 1, notrack: !!notrack, lastAttemptedDate: new Date(Number(sub.timestamp) * 1000) };
  }));
  await TrackedProblem.insertMany(newRecords);
  ```

**3. Inefficient DB Fetch**
- **File:** `src/controllers/syncController.ts` (lines 51-53)
- **Issue:** In `checkSync`, the query `TrackedProblem.find({ userId }).select(...)` fetches the user's entire history into memory rather than filtering by the newly fetched submission slugs.
- **Actionable Fix:** Filter existing records dynamically using a `$in` MongoDB operator.
- **Code Snippet:**
  ```typescript
  const slugs = dedupedSubmissions.map(s => s.titleSlug);
  const existingRecords = await TrackedProblem.find({ userId, titleSlug: { $in: slugs } }).select("titleSlug lastAttemptedDate _id").lean();
  ```

**4. Missing and Suboptimal Indexes**
- **Files:** `src/models/TrackedProblem.ts` (line 83) and `src/models/Track.ts` (line 35); `src/controllers/trackController.ts` (line 9)
- **Issue:** The index on `TrackedProblem` is `{ lastAttemptedDate: -1 }`, but queries filter on `userId` and `notrack` before sorting. Text search uses `$regex` without a text index (causing full collection scans). `Track` lacks an index on `order` despite being sorted by it.
- **Actionable Fix:** Add compound indexes covering equality fields first, text indexes for searches, and an index on `order`.
- **Code Snippet:**
  ```typescript
  // src/models/TrackedProblem.ts:
  TrackedProblemSchema.index({ userId: 1, notrack: 1, lastAttemptedDate: -1 });
  TrackedProblemSchema.index({ title: "text" }); // for $regex search optimization

  // src/models/Track.ts:
  TrackSchema.index({ order: 1 });
  ```

## 2. Frontend Refactoring Plan

### 2.1 Structural Complexity

**1. God Component & SRP Violation**
- **File:** `src/App.tsx` (lines 42-1184)
- **Issue:** The `App` component acts as a monolithic 1100+ line "God Component", managing routing, global keyboard shortcuts, offline state, data fetching (`fetchDocumentsList`), filtering logic, and UI rendering of all views and modals.
- **Actionable Fix:** Extract document fetching and filtering into a custom hook and layout concerns into a wrapper component.
- **Code Snippet:**
  ```tsx
  // src/hooks/useDocuments.ts
  export function useDocuments(apiBase: string) {
    // Move documents, searchQuery, selectedTags, filteredDocuments logic here
    // Return { documents, filteredDocuments, searchQuery, setSearchQuery, loading, ... }
  }

  // src/App.tsx
  import { useDocuments } from "./hooks/useDocuments";
  // Inside App:
  const { filteredDocuments, searchQuery, setSearchQuery } = useDocuments(apiBase);
  ```

**2. DRY Violation in Tracker Views**
- **Files:** `src/components/TrackerTab.tsx` (lines 474-604, 632-781) and `src/components/SmartRevisitModal.tsx` (line 149)
- **Issue:** Mapping loops, action buttons, difficulty badges, and date logic are completely duplicated between "Mobile Cards View" and "Desktop Table View" within `TrackerTab.tsx`. The `timeAgo` function is also defined locally on line 53 and again in `SmartRevisitModal.tsx` on line 149.
- **Actionable Fix:** Extract common card/row templates to separate components, and shift the duplicated utility logic to a centralized utils file.
- **Code Snippet:**
  ```tsx
  // src/lib/dateUtils.ts
  // Move timeAgo function here

  // Extract mobile card to a new component:
  const ProblemMobileCard = ({ problem, onRevisit, onDelete, onEdit }) => (
    <div className="p-4 bg-white...">
       {/* Mobile card content */}
    </div>
  );

  // In TrackerTab.tsx:
  <div className="md:hidden flex flex-col">
    {filteredProblems.map(p => <ProblemMobileCard key={p._id} problem={p} onRevisit={handleRevisit} ... />)}
  </div>
  ```

### 2.2 Performance Bottlenecks

**1. Lack of Code Splitting for Heavy Views**
- **File:** `src/App.tsx` (lines 25-38)
- **Issue:** Heavy components like `TrackerTab` (which imports `recharts`) and `PreviewPanel` (which imports `react-markdown` and `remark-gfm`) are eagerly imported, causing massive initial bundle sizes and worsening initial load times.
- **Actionable Fix:** Implement route/tab-level code splitting using `React.lazy` and `Suspense`.
- **Code Snippet:**
  ```tsx
  // src/App.tsx
  import { lazy, Suspense } from "react";

  const TrackerTab = lazy(() => import("./components/TrackerTab"));
  const PreviewPanel = lazy(() => import("./components/PreviewPanel"));

  // Inside rendering:
  <Suspense fallback={<div className="p-4"><Loader2 className="animate-spin"/></div>}>
    {activeMainTab === "tracker" && <TrackerTab onOpenAddModal={...} />}
  </Suspense>
  ```

**2. Excessive Re-renders from Global State & Mounted Modals**
- **File:** `src/App.tsx` (line 47, lines 1105-1175)
- **Issue:** The component holds high-frequency state like `searchQuery`, which triggers full tree re-renders per keystroke. Additionally, modal components (`AddProblemModal`, `SettingsModal`, etc.) are perpetually mounted in the DOM using `isOpen={false}`, forcing their hooks to execute.
- **Actionable Fix:** Conditionally mount modals to prevent lifecycle executions, and wrap heavy components in `React.memo`.
- **Code Snippet:**
  ```tsx
  // 1. Conditionally render modals:
  // src/App.tsx
  {showAddModal && (
    <AddProblemModal
      isOpen={showAddModal}
      onClose={() => setShowAddModal(false)}
      onAdded={() => setProblemsRefreshKey((k) => k + 1)}
    />
  )}

  // 2. Wrap tabs in React.memo:
  // src/components/TrackerTab.tsx
  export default React.memo(function ProblemsTab({ onOpenAddModal, refreshKey }: ProblemsTabProps) { ... });
  ```

**3. Unoptimized Context Values**
- **Files:** `src/context/AuthContext.tsx` (line 78) and `src/context/NetworkStatusContext.tsx` (line 104)
- **Issue:** Object literals are passed directly into the `<Provider value={{...}}>` prop. Consequently, any render of the parent component builds a new object reference, causing unintentional re-renders of all downstream consumers.
- **Actionable Fix:** Memoize context values and associated functions using `useMemo` and `useCallback`.
- **Code Snippet:**
  ```tsx
  // src/context/AuthContext.tsx
  const login = useCallback((newToken: string, newUser: User) => { /*...*/ }, []);
  const logout = useCallback(() => { /*...*/ }, []);
  const getToken = useCallback(async () => token, [token]);

  const authValue = useMemo(() => ({
    user,
    token,
    isSignedIn: !!token,
    login,
    logout,
    getToken
  }), [user, token, login, logout, getToken]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
  ```
