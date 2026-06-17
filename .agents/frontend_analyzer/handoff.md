# Frontend Analysis Report: Structural Complexity & Performance

This report details structural complexity (R1) and performance bottlenecks (R2) identified in the `frontend` directory of the `dsa-preparation` project, providing concrete fixes for each issue.

## 1. Structural Complexity: God Component & SRP Violation
**Observation:**
In `src/App.tsx` (Lines 42-1184), the `App` component is a monolithic 1100+ line "God Component". It manages routing (via `activeMainTab`), global keyboard shortcuts, offline state, data fetching (`fetchDocumentsList`), filtering logic, and rendering of all views and modals.

**Logic Chain:**
Housing all state and UI logic in a single file violates the Single Responsibility Principle (SRP). It makes testing isolated pieces of logic difficult, leads to tight coupling between navigation state and layout logic, and guarantees large merge conflicts during concurrent development.

**Caveats:**
The logic works, but its current organization severely limits maintainability. I did not evaluate the backend API integrations called by these functions.

**Conclusion:**
`App.tsx` should be decomposed into smaller, purpose-driven components and hooks.

**Verification Method:**
Check the line count and state declarations in `src/App.tsx`. After refactoring, `App.tsx` should primarily contain providers and route/tab definitions.

**Actionable Fix:**
- Extract document fetching and filtering into a custom hook.
- Extract layout concerns into a `<Layout>` wrapper.
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

---

## 2. Structural Complexity: DRY Violation in Tracker Views
**Observation:**
In `src/components/TrackerTab.tsx`, the exact same mapping loop, action buttons, difficulty badge generation, and date formatting logic are duplicated for the "Mobile Cards View" (Lines 474-604) and "Desktop Table View" (Lines 632-781). Additionally, a `timeAgo` function is locally defined here (Line 53) and duplicated in `SmartRevisitModal.tsx` (Line 149).

**Logic Chain:**
Duplicating rendering logic for different breakpoints violates DRY. A change to a button's logic or a badge's styling requires modifying the code in two places, increasing the risk of bugs.

**Caveats:**
None. This is a standard responsive design anti-pattern.

**Conclusion:**
The problem mapping logic must be extracted into reusable components, and utility functions must be centralized.

**Verification Method:**
Inspect `src/components/TrackerTab.tsx` for the two `filteredProblems.map` blocks. Verify the presence of `timeAgo` in both files.

**Actionable Fix:**
- Move `timeAgo` to `src/lib/dateUtils.ts`.
- Extract row/card components:
```tsx
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

---

## 3. Performance Bottleneck: Lack of Code Splitting for Heavy Views
**Observation:**
In `src/App.tsx` (Lines 25-38), heavy components like `TrackerTab` (which imports `recharts`) and `PreviewPanel` (which imports `react-markdown` and `remark-gfm`) are eagerly imported.

**Logic Chain:**
Because these components are statically imported at the top of `App.tsx`, bundlers (Vite/Rollup) will compile them into the main JavaScript bundle. Users must download and parse heavy charting and markdown-parsing libraries before they can even view the Home or Login screens, significantly degrading Initial Load Time and Core Web Vitals.

**Caveats:**
Code splitting introduces slight delays when switching tabs for the first time, requiring a fallback UI.

**Conclusion:**
Implementing route/tab-level code splitting is required to optimize the initial bundle size.

**Verification Method:**
Run `npm run build` and inspect the generated chunk sizes in the `dist` folder.

**Actionable Fix:**
Use `React.lazy` and `Suspense`:
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

---

## 4. Performance Bottleneck: Excessive Re-renders from Global State & Mounted Modals
**Observation:**
`App.tsx` holds high-frequency state like `searchQuery` (Line 47). Typing in the search bar triggers a top-level re-render. Downstream, heavy components (`TrackerTab`) are not memoized, and modals (`AddProblemModal`, `SettingsModal`, etc. - Lines 1105-1175) are permanently mounted in the DOM, receiving `isOpen={false}` instead of being conditionally unmounted.

**Logic Chain:**
Every keystroke in the search bar re-evaluates the entire VDOM tree of `App`, including off-screen charts and the hooks inside hidden modals. This will cause visible input latency on slower devices.

**Caveats:**
Debouncing the input might feel less responsive than immediate filtering, but it saves CPU cycles. Conditional mounting loses local state in modals when closed (which is usually desired anyway).

**Conclusion:**
State updates must be localized, heavy children memoized, and hidden modals unmounted.

**Verification Method:**
Use the React DevTools Profiler while typing in the search bar; observe all child components re-rendering.

**Actionable Fix:**
1. Conditionally render modals to prevent their hooks from running when closed:
```tsx
// src/App.tsx
{showAddModal && (
  <AddProblemModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onAdded={() => setProblemsRefreshKey((k) => k + 1)}
  />
)}
```
2. Wrap tabs in `React.memo`:
```tsx
// src/components/TrackerTab.tsx
export default React.memo(function ProblemsTab({ onOpenAddModal, refreshKey }: ProblemsTabProps) { ... });
```

---

## 5. Performance Bottleneck: Unoptimized Context Values
**Observation:**
In `src/context/AuthContext.tsx` (Line 78) and `src/context/NetworkStatusContext.tsx` (Line 104), object literals are passed directly into the Provider's `value` prop (e.g., `<AuthContext.Provider value={{ user, token, isSignedIn: !!token, login, logout, getToken }}>`).

**Logic Chain:**
In React, whenever the Provider's parent re-renders, a new object reference is created for the `value` prop. This bypasses React's context bailout mechanisms, forcing every component consuming `useAuth` or `useNetworkStatus` to re-render unnecessarily.

**Caveats:**
The impact is currently minor because the Provider sits near the root (`main.tsx`) and rarely re-renders. However, it is a dangerous anti-pattern that can cause catastrophic cascading re-renders if a state update is introduced higher up the tree.

**Conclusion:**
Context values and their associated functions must be memoized.

**Verification Method:**
Check the `value` prop of `AuthContext.Provider`.

**Actionable Fix:**
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
