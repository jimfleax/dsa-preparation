import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BookOpen, Code2, Map, Home, Settings, 
  Flame, CalendarDays, Award, X, FileText, Trophy
} from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { DocumentMetadata, TrackedProblem } from "../types";
import { LeetCodeCalendarData } from "../hooks/useCommandPalette";
import LeetCodeHeatmap from "./LeetCodeHeatmap";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  leetcodeUsername?: string;
  calendarData: LeetCodeCalendarData | null;
  isLoadingCalendar: boolean;
  calendarError?: string | null;
  documents: DocumentMetadata[];
  trackedProblems: TrackedProblem[];
  onNavigate: (tab: "home" | "learn" | "tracker" | "tracks") => void;
  onSelectDocument: (doc: DocumentMetadata) => void;
  onOpenSettings: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  leetcodeUsername,
  calendarData,
  isLoadingCalendar,
  calendarError,
  documents,
  trackedProblems,
  onNavigate,
  onSelectDocument,
  onOpenSettings
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const altKeyLabel = isMac ? "⌥" : "Alt";

  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isLoadingCalendar && calendarData) {
      setTimeout(() => {
        if (heatmapScrollRef.current) {
          heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [isOpen, isLoadingCalendar, calendarData]);

  useEscapeKey(isOpen, onClose, 60, "command-palette");

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      // Small delay to allow animation to start before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const isSearchMode = searchQuery.trim().length > 0;

  const showSidePanels = !isSearchMode && !!leetcodeUsername && !calendarError && (isLoadingCalendar || !!calendarData);
  const showBanner = !isSearchMode && !!calendarError;

  const searchResults = useMemo(() => {
    if (!isSearchMode) return { docs: [], problems: [] };
    
    const query = searchQuery.toLowerCase().trim();
    
    const docs = documents.filter(doc => 
      doc.title.toLowerCase().includes(query) || 
      doc.tags.some(t => t.toLowerCase().includes(query))
    ).slice(0, 5); // limit to 5

    const problems = trackedProblems.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.titleSlug.toLowerCase().includes(query)
    ).slice(0, 5); // limit to 5

    return { docs, problems };
  }, [searchQuery, documents, trackedProblems, isSearchMode]);

  const items = useMemo(() => {
    if (isSearchMode) {
      const result: Array<
        | { type: "doc"; data: DocumentMetadata }
        | { type: "problem"; data: TrackedProblem }
      > = [];
      searchResults.docs.forEach(doc => result.push({ type: "doc", data: doc }));
      searchResults.problems.forEach(p => result.push({ type: "problem", data: p }));
      return result;
    } else {
      return [
        { type: "nav" as const, tab: "home" as const, label: "Home Dashboard" },
        { type: "nav" as const, tab: "learn" as const, label: "Study Theory & Docs" },
        { type: "nav" as const, tab: "tracker" as const, label: "Problem Tracker" },
        { type: "nav" as const, tab: "tracks" as const, label: "Roadmap Tracks" },
        { type: "nav" as const, tab: "settings" as const, label: "Settings" }
      ];
    }
  }, [isSearchMode, searchResults]);

  const navItemsConfig = useMemo(() => [
    { tab: "home" as const, label: "Home Dashboard", icon: Home, hoverColor: "text-indigo-600", keyChar: "h" },
    { tab: "learn" as const, label: "Study Theory & Docs", icon: BookOpen, hoverColor: "text-indigo-600", keyChar: "l" },
    { tab: "tracker" as const, label: "Problem Tracker", icon: Code2, hoverColor: "text-emerald-600", keyChar: "t" },
    { tab: "tracks" as const, label: "Roadmap Tracks", icon: Map, hoverColor: "text-purple-600", keyChar: "r" },
    { tab: "settings" as const, label: "Settings", icon: Settings, hoverColor: "text-neutral-900", keyChar: "s" }
  ], []);

  // Reset focus index when items change
  useEffect(() => {
    setFocusedIndex(0);
  }, [items]);

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    }
  }, [focusedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      const key = e.key.toLowerCase();
      if (key === "h") {
        e.preventDefault();
        e.stopPropagation();
        handleNavigate("home");
        return;
      }
      if (key === "l") {
        e.preventDefault();
        e.stopPropagation();
        handleNavigate("learn");
        return;
      }
      if (key === "t") {
        e.preventDefault();
        e.stopPropagation();
        handleNavigate("tracker");
        return;
      }
      if (key === "r") {
        e.preventDefault();
        e.stopPropagation();
        handleNavigate("tracks");
        return;
      }
      if (key === "s") {
        e.preventDefault();
        e.stopPropagation();
        handleOpenSettings();
        return;
      }
    }

    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      setFocusedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const activeItem = items[focusedIndex];
      if (!activeItem) return;

      if (activeItem.type === "doc") {
        onSelectDocument(activeItem.data);
        onClose();
      } else if (activeItem.type === "problem") {
        handleNavigate("tracker");
      } else if (activeItem.type === "nav") {
        if (activeItem.tab === "settings") {
          handleOpenSettings();
        } else {
          handleNavigate(activeItem.tab);
        }
      }
    }
  };

  const handleNavigate = (tab: "home" | "learn" | "tracker" | "tracks") => {
    onNavigate(tab);
    onClose();
  };

  const handleOpenSettings = () => {
    onOpenSettings();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex items-center justify-center"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="fixed inset-0 z-[60] pointer-events-none flex p-4 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          className="flex gap-4 pointer-events-auto items-stretch"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Left Panel - Stats (Hidden in search mode or when username/data is not available) */}
          <AnimatePresence>
            {showSidePanels && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.9 }}
                animate={{ opacity: 1, width: 220, scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.9 }}
                className="hidden md:flex bg-white/85 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-md flex-col overflow-hidden shrink-0"
              >
                <div className="p-5 flex-1 w-[220px] flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                    LeetCode Profile
                  </h3>
                  
                  {isLoadingCalendar ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                      <div className="h-8 bg-neutral-200 rounded w-2/3"></div>
                    </div>
                  ) : calendarData && leetcodeUsername ? (
                    <div className="space-y-5">
                      {calendarData.ranking && (
                        <div>
                          <div className="flex items-center gap-2 text-neutral-500 mb-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium">Global Rank</span>
                          </div>
                          <p className="text-2xl font-bold text-neutral-900">
                            {calendarData.ranking.toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 text-neutral-500 mb-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-medium">Current Streak</span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900">
                          {calendarData.streak} <span className="text-sm font-normal text-neutral-500">days</span>
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 text-neutral-500 mb-1">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-medium">Active Days</span>
                        </div>
                        <p className="text-xl font-bold text-neutral-900">
                          {calendarData.totalActiveDays}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-neutral-500 mb-1">
                          <Award className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium">Active Years</span>
                        </div>
                        <p className="text-sm font-bold text-neutral-800">
                          {calendarData.activeYears.slice(0, 3).join(", ")}
                          {calendarData.activeYears.length > 3 && " ..."}
                        </p>
                      </div>
                    </div>
                  ) : !leetcodeUsername ? (
                    <div className="flex flex-col items-center justify-center text-center py-4 text-neutral-500 h-full">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Username Not Set</p>
                      <p className="text-xs mb-4">Connect your LeetCode account to view stats.</p>
                      <button 
                        onClick={handleOpenSettings}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all active:scale-95 w-full border border-indigo-100"
                      >
                        Set Username
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500">
                      <p>No stats available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Column - contains Center Box and Banner */}
          <div className="flex flex-col gap-3 items-center w-full">
            {/* Center Box - Search & List */}
            <div className={`bg-white border border-neutral-200 rounded-2xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 w-full ${isSearchMode ? "max-w-[600px]" : "max-w-[400px]"}`}>
            {/* Search Input */}
            <div className="relative px-4 py-4 border-b border-neutral-100 flex items-center">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems, articles, or commands..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 placeholder-neutral-400 ml-3 text-sm"
              />
              <div className="flex items-center shrink-0 ml-2 select-none opacity-80 hover:opacity-100 transition-opacity duration-200">
                <kbd className="bg-neutral-100/90 border border-neutral-200/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-neutral-500 font-semibold shadow-xs leading-none">ESC</kbd>
              </div>
            </div>

            {/* Results / Navigation List */}
            <div className="overflow-y-auto max-h-[350px] p-2 custom-scrollbar">
              {isSearchMode ? (
                <div className="space-y-4 py-2">
                  {searchResults.docs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Learning Resources</h4>
                      {searchResults.docs.map((doc, index) => {
                        const isFocused = focusedIndex === index;
                        return (
                          <button
                            key={doc.id}
                            ref={isFocused ? activeItemRef : undefined}
                            onClick={() => { onSelectDocument(doc); onClose(); }}
                            onMouseEnter={() => setFocusedIndex(index)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group transition-colors ${
                              isFocused ? "bg-indigo-50/80 text-indigo-900" : "hover:bg-indigo-50"
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              isFocused ? "bg-indigo-600 text-white" : "bg-indigo-100/50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                            }`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold transition-colors ${isFocused ? "text-indigo-950" : "text-neutral-900"}`}>{doc.title}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {searchResults.problems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Tracked Problems</h4>
                      {searchResults.problems.map((p, index) => {
                        const globalIndex = searchResults.docs.length + index;
                        const isFocused = focusedIndex === globalIndex;
                        return (
                          <button
                            key={p._id}
                            ref={isFocused ? activeItemRef : undefined}
                            onClick={() => handleNavigate("tracker")}
                            onMouseEnter={() => setFocusedIndex(globalIndex)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group transition-colors ${
                              isFocused ? "bg-emerald-50/80 text-emerald-900" : "hover:bg-emerald-50"
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${
                              isFocused ? "bg-emerald-600 text-white" : "bg-emerald-100/50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                            }`}>
                              <Code2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold transition-colors ${isFocused ? "text-emerald-950" : "text-neutral-900"}`}>{p.title}</p>
                              <p className={`text-[11px] transition-colors ${isFocused ? "text-emerald-700/80" : "text-neutral-500"}`}>{p.difficulty || "Unknown"} • {p.attemptCount} attempts</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {searchResults.docs.length === 0 && searchResults.problems.length === 0 && (
                    <div className="py-8 text-center text-neutral-500 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2 mt-1">Navigation</h4>
                  
                  {navItemsConfig.map((item, index) => {
                    const Icon = item.icon;
                    const isSettings = item.tab === "settings";
                    const isFocused = focusedIndex === index;
                    
                    return (
                      <React.Fragment key={item.tab}>
                        {isSettings && <div className="h-px bg-neutral-100 my-2 mx-2"></div>}
                        
                        <button 
                          ref={isFocused ? activeItemRef : undefined}
                          onClick={() => {
                            if (isSettings) {
                              handleOpenSettings();
                            } else {
                              handleNavigate(item.tab);
                            }
                          }}
                          onMouseEnter={() => setFocusedIndex(index)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between group transition-colors ${
                            isFocused ? "bg-neutral-100" : "hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 transition-colors ${
                              isFocused ? item.hoverColor : `text-neutral-500 group-hover:${item.hoverColor}`
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                              isFocused ? "text-neutral-900" : "text-neutral-800 group-hover:text-neutral-900"
                            }`}>
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 ml-2 select-none opacity-80 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-200">
                            <kbd className="bg-neutral-100/90 border border-neutral-200/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-neutral-500 font-semibold shadow-xs leading-none uppercase">
                              {altKeyLabel}
                            </kbd>
                            <kbd className="bg-neutral-100/90 border border-neutral-200/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-neutral-500 font-semibold shadow-xs leading-none uppercase">
                              {item.keyChar}
                            </kbd>
                          </div>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
            
            {/* Premium LeetCode connection banner */}
            <AnimatePresence>
              {showBanner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full bg-white/85 backdrop-blur-md border border-neutral-200/60 rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-4 pointer-events-auto"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-xl text-rose-500 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-rose-600">
                        Failed to retrieve LeetCode stats
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-normal">
                        {calendarError || `We couldn't load stats for "${leetcodeUsername}".`} Please check settings or connection.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenSettings}
                    className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-950 text-white rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap shadow-sm hover:shadow cursor-pointer"
                  >
                    Check Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Heatmap (Hidden in search mode or when username/data is not available) */}
          <AnimatePresence>
            {showSidePanels && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.9 }}
                animate={{ opacity: 1, width: 230, scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.9 }}
                className="hidden md:flex bg-white/85 backdrop-blur-md border border-neutral-200/60 rounded-2xl shadow-md flex-col overflow-hidden shrink-0"
              >
                <div className="p-5 flex-1 w-[230px] flex flex-col justify-center">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                    Activity Heatmap
                  </h3>
                  
                  {isLoadingCalendar ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-24 bg-neutral-200 rounded w-full"></div>
                    </div>
                  ) : calendarData?.submissionCalendar ? (
                    <div ref={heatmapScrollRef} className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
                      <div className="w-max pr-2">
                        <LeetCodeHeatmap submissionCalendar={calendarData.submissionCalendar} weeksToShow={52} />
                      </div>
                    </div>
                  ) : !leetcodeUsername ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-neutral-500">
                      <CalendarDays className="w-8 h-8 mb-3 opacity-30 text-indigo-500" />
                      <p className="text-sm font-medium text-neutral-700 mb-2">Username Not Set</p>
                      <p className="text-xs mb-4">Set your LeetCode username to see your activity heatmap here.</p>
                      <button 
                        onClick={handleOpenSettings}
                        className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all active:scale-95 border border-indigo-100"
                      >
                        Set Username
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-neutral-400">
                      <FileText className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs font-medium">No activity data available.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Custom CSS for scrollbar inside the palette */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
      `}</style>
    </>
  );
}
