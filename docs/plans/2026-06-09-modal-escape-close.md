# Escape Key Overlay Dismissal Implementation Plan

**Goal:** Implement an Escape key listener that dismissed the topmost active overlay (modal or preview panel sidebar) when pressed, without key collision or incorrect closing.

**Architecture:** Create a centralized, lightweight `overlayStack` manager that keeps a sorted list of currently open overlays by their `zIndex` (and insertion order if `zIndex` matches). Modals and drawers register themselves upon mount/opening and unregister upon unmounting/closing. The manager listens for the Escape key globally and executes `onClose` ONLY on the topmost overlay in the stack.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide Icons.

---

### Task 1: Create Overlay Stack Module
**Files:**
- Create: `src/lib/overlayStack.ts`
- Test: `src/lib/overlayStack.test.ts` (or simulated in `_test_overlay.ts`)

**Step 1: Write the implementation**
```typescript
interface Overlay {
  id: string;
  onClose: () => void;
  zIndex: number;
  timestamp: number;
}

let stack: Overlay[] = [];

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  if (stack.length === 0) return;

  const sorted = [...stack].sort((a, b) => {
    if (b.zIndex !== a.zIndex) {
      return b.zIndex - a.zIndex;
    }
    return b.timestamp - a.timestamp;
  });

  const topOverlay = sorted[0];
  if (topOverlay) {
    topOverlay.onClose();
  }
}

export function registerOverlay(id: string, onClose: () => void, zIndex: number) {
  stack = stack.filter((item) => item.id !== id);
  stack.push({
    id,
    onClose,
    zIndex,
    timestamp: Date.now(),
  });

  if (stack.length === 1) {
    window.addEventListener("keydown", handleKeyDown);
  }
}

export function unregisterOverlay(id: string) {
  stack = stack.filter((item) => item.id !== id);
  if (stack.length === 0) {
    window.removeEventListener("keydown", handleKeyDown);
  }
}

export function getStackState() {
  return [...stack];
}
```

---

### Task 2: Create React Hook wrapper
**Files:**
- Create: `src/hooks/useEscapeKey.ts`

**Step 1: Write hook implementation**
```typescript
import { useEffect } from "react";
import { registerOverlay, unregisterOverlay } from "../lib/overlayStack";

export function useEscapeKey(
  isOpen: boolean,
  onClose: () => void,
  zIndex: number = 50,
  id: string
) {
  useEffect(() => {
    if (!isOpen) return;

    registerOverlay(id, onClose, zIndex);
    return () => {
      unregisterOverlay(id);
    };
  }, [isOpen, onClose, zIndex, id]);
}
```

---

### Task 3: Integrate Hook into Modals and Sidebars
**Files:**
- Modify:
  - `src/components/PreviewPanel.tsx`
  - `src/components/AddProblemModal.tsx`
  - `src/components/AttemptProblemModal.tsx`
  - `src/components/EditProblemModal.tsx`
  - `src/components/LoginModal.tsx`
  - `src/components/RegisterModal.tsx`
  - `src/components/SettingsModal.tsx`
  - `src/components/SmartRevisitModal.tsx`
  - `src/components/UntrackedProblemsModal.tsx`
  - `src/components/TrackerTab.tsx`

---

### Task 4: Verify and Clean up
**Files:**
- Modify: `docs/CHANGELOG.md`
