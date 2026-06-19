import React, { useEffect, useRef } from "react";
import {
  RefreshCcw,
  ChevronRight,
  Keyboard,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface GlobalContextMenuProps {
  onNavigate: (tab: "home" | "learn" | "tracker" | "tracks") => void;
  onOpenShortcuts: () => void;
}

// Extend HTMLDivElement to include Popover API methods safely
interface PopoverElement extends HTMLDivElement {
  showPopover: () => void;
  hidePopover: () => void;
}

export default function GlobalContextMenu({
  onNavigate,
  onOpenShortcuts,
}: GlobalContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const gotoBtnRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Don't intercept if clicking on an input or textarea or contenteditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      e.preventDefault();

      const menuEl = menuRef.current as PopoverElement | null;
      if (menuEl) {
        // Set coordinates
        menuEl.style.left = `${e.clientX}px`;
        menuEl.style.top = `${e.clientY}px`;

        try {
          if (!menuEl.matches(":popover-open")) {
            menuEl.showPopover();
          }
        } catch (err) {
          console.error("Popover API error", err);
        }
      }
    };

    const handleGlobalMouseDown = (e: MouseEvent) => {
      const menuEl = menuRef.current as PopoverElement | null;
      const submenuEl = submenuRef.current as PopoverElement | null;

      // If the menu is open, and we click outside of both the main menu and submenu, close it
      if (menuEl?.matches(":popover-open")) {
        const target = e.target as Node;
        if (
          !menuEl.contains(target) &&
          (!submenuEl || !submenuEl.contains(target))
        ) {
          menuEl.hidePopover();
          if (submenuEl?.matches(":popover-open")) {
            submenuEl.hidePopover();
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const menuEl = menuRef.current as PopoverElement | null;
        const submenuEl = submenuRef.current as PopoverElement | null;

        if (submenuEl?.matches(":popover-open")) {
          submenuEl.hidePopover();
        } else if (menuEl?.matches(":popover-open")) {
          menuEl.hidePopover();
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("mousedown", handleGlobalMouseDown, {
      capture: true,
    });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("mousedown", handleGlobalMouseDown, {
        capture: true,
      });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const closeMenu = () => {
    try {
      const menuEl = menuRef.current as PopoverElement | null;
      const submenuEl = submenuRef.current as PopoverElement | null;

      if (menuEl?.matches(":popover-open")) {
        menuEl.hidePopover();
      }
      if (submenuEl?.matches(":popover-open")) {
        submenuEl.hidePopover();
      }
    } catch (e) {
      console.error("Failed to close menu", e);
    }
  };

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  const openSubmenu = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const submenuEl = submenuRef.current as PopoverElement | null;
    const gotoBtnEl = gotoBtnRef.current;

    if (submenuEl && gotoBtnEl && !submenuEl.matches(":popover-open")) {
      const rect = gotoBtnEl.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      const submenuWidth = 160; // Approximate width for w-40 (40 * 4 = 160px)

      if (spaceOnRight >= submenuWidth + 10) {
        submenuEl.style.left = `${rect.right + 5}px`;
      } else {
        submenuEl.style.left = `${rect.left - submenuWidth - 5}px`;
      }
      submenuEl.style.top = `${rect.top}px`;

      try {
        submenuEl.showPopover();
      } catch (e) {
        console.error("Popover error", e);
      }
    }
  };

  const closeSubmenuDeferred = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      const submenuEl = submenuRef.current as PopoverElement | null;
      if (submenuEl?.matches(":popover-open")) {
        try {
          submenuEl.hidePopover();
        } catch (e) {}
      }
    }, 150);
  };

  const keepSubmenuOpen = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <>
      <div
        id="global-context-menu"
        ref={menuRef}
        popover="manual"
        className="fixed m-0 bg-white border border-neutral-200 shadow-xl rounded-xl w-56 p-1.5 z-[9999]"
        style={{ inset: "auto" }} // overrides native popover centering
      >
        <div className="flex flex-col">
          <button
            onClick={() => handleAction(() => window.history.back())}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={() => handleAction(() => window.history.forward())}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Forward</span>
          </button>
          <button
            onClick={() => handleAction(() => window.location.reload())}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reload</span>
          </button>

          <div className="h-px bg-neutral-200 my-1 mx-2" />

          <button
            ref={gotoBtnRef}
            onMouseEnter={openSubmenu}
            onMouseLeave={closeSubmenuDeferred}
            className="context-goto-btn flex items-center justify-between w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-transparent" /> {/* Spacer */}
              <span>Go to</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          <div className="h-px bg-neutral-200 my-1 mx-2" />

          <button
            onClick={() => handleAction(onOpenShortcuts)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Nested Submenu */}
      <div
        id="context-goto-submenu"
        ref={submenuRef}
        popover="manual"
        onMouseEnter={keepSubmenuOpen}
        onMouseLeave={closeSubmenuDeferred}
        className="context-goto-submenu fixed m-0 bg-white border border-neutral-200 shadow-xl rounded-xl w-40 p-1.5 z-[10000]"
        style={{ inset: "auto" }}
      >
        <div className="flex flex-col">
          <button
            onClick={() => handleAction(() => onNavigate("home"))}
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => handleAction(() => onNavigate("learn"))}
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Learn
          </button>
          <button
            onClick={() => handleAction(() => onNavigate("tracker"))}
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Tracker
          </button>
          <button
            onClick={() => handleAction(() => onNavigate("tracks"))}
            className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Tracks
          </button>
        </div>
      </div>
    </>
  );
}
