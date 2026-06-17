import React, { useEffect, useRef } from "react";
import { RefreshCcw, ChevronRight, Keyboard, ArrowLeft, ArrowRight } from "lucide-react";

interface GlobalContextMenuProps {
  onNavigate: (tab: "home" | "learn" | "tracker" | "tracks") => void;
  onOpenShortcuts: () => void;
}

export default function GlobalContextMenu({ onNavigate, onOpenShortcuts }: GlobalContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

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
      
      if (menuRef.current) {
        // Set coordinates
        menuRef.current.style.left = `${e.clientX}px`;
        menuRef.current.style.top = `${e.clientY}px`;
        
        try {
          if (!menuRef.current.matches(':popover-open')) {
            // @ts-ignore
            menuRef.current.showPopover();
          }
        } catch (err) {
          console.error("Popover API error", err);
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const closeMenu = () => {
    try {
      if (menuRef.current?.matches(':popover-open')) {
        // @ts-ignore
        menuRef.current.hidePopover();
      }
      if (submenuRef.current?.matches(':popover-open')) {
        // @ts-ignore
        submenuRef.current.hidePopover();
      }
    } catch (e) {}
  };

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <>
      <div 
        id="global-context-menu" 
        ref={menuRef} 
        // @ts-ignore
        popover="auto" 
        className="fixed m-0 bg-white border border-neutral-200 shadow-xl rounded-xl w-56 flex flex-col p-1.5 z-[9999]"
        style={{ inset: "auto" }} // overrides native popover centering
      >
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
        
        {/* Anchor for the nested popover */}
        <button 
          // @ts-ignore
          popovertarget="context-goto-submenu"
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

      {/* Nested Submenu */}
      <div 
        id="context-goto-submenu" 
        ref={submenuRef}
        // @ts-ignore
        popover="auto" 
        className="context-goto-submenu fixed m-0 bg-white border border-neutral-200 shadow-xl rounded-xl w-40 flex flex-col p-1.5 z-[10000]"
      >
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
    </>
  );
}
