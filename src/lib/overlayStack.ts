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

  // Sort by zIndex descending, then by timestamp descending
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
  // Prevent duplicate registration
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

// Exposed for testing
export function getStackState() {
  return [...stack];
}
