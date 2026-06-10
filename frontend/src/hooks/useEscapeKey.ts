import { useEffect } from "react";
import { registerOverlay, unregisterOverlay } from "../lib/overlayStack";

/**
 * Registers an overlay component to be dismissed when Escape is pressed.
 * Only the topmost active overlay (highest zIndex, then most recently opened) is dismissed.
 *
 * @param isOpen Whether the overlay is currently open
 * @param onClose Callback to close the overlay
 * @param zIndex Visual overlay z-index level (default: 50)
 * @param id Unique identifier for the overlay to prevent duplicates
 */
export function useEscapeKey(
  isOpen: boolean,
  onClose: () => void,
  zIndex: number = 50,
  id: string,
) {
  useEffect(() => {
    if (!isOpen) return;

    registerOverlay(id, onClose, zIndex);
    return () => {
      unregisterOverlay(id);
    };
  }, [isOpen, onClose, zIndex, id]);
}
