# Frontend UI/UX Plan

## 1. Application Layout Updates
Currently, `App.tsx` has a monolithic state structure. We will introduce a top-level Tab State:
- `activeTab`: `'learn' | 'problems'`

**Navbar Changes:**
- Center or Left align a Toggle Switch / Tab group:
  - `[ Learn ]` `[ Problems ]`
- Only show the existing `RefreshCcw` sync button when in the `Learn` tab.
- Add an `[+ Add Problem]` button in the navbar when in the `Problems` tab.

## 2. Problems View Component
A new component `ProblemsList.tsx` will be rendered when `activeTab === 'problems'`.
- **Layout**: Dense Table View to allow for easy scanning, sorting, and filtering.
- **Columns**:
  - Title (truncated with ellipsis).
  - Attempt Count (Badge).
  - Last Solved (e.g., "3 days ago").
  - Status (Solved/Unsolved).
- **Controls**:
  - Search Input (reused from existing style).
  - Filter by "Solved" / "Unsolved".
- **Sync Behavior**: 
  - An automatic sync will be triggered in the background (`useEffect`) the first time the `ProblemsList` component mounts, calling `/api/sync` silently to fetch the latest data.

## 3. Add Problem Modal
A new component `AddProblemModal.tsx`.
- Triggered by the `[+ Add Problem]` button.
- **Fields**:
  - Input: "LeetCode URL".
  - Input: "Title" (Disabled, displays "Auto-fetching..." when URL is pasted).
  - Button: "Save".
- **Interaction Flow**:
  1. User pastes URL.
  2. `onChange` triggers a regex extraction of the `titleSlug`.
  3. Frontend calls backend (or external API directly) to fetch the title.
  4. Field populates. User clicks Save.
