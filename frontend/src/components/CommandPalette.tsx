import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, BookOpen, Code2, Map, Home, Settings, 
  Flame, CalendarDays, Award, X, FileText
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
  documents,
  trackedProblems,
  onNavigate,
  onSelectDocument,
  onOpenSettings
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(isOpen, onClose, 60, "command-palette");

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      // Small delay to allow animation to start before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const isSearchMode = searchQuery.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearchMode) return { docs: [], problems: [] };
    
    const query = searchQuery.toLowerCase().trim();
    
    const docs = documents.filter(doc => 
      doc.title.toLowerCase().includes(query) || 
      doc.category.toLowerCase().includes(query) ||
      doc.tags.some(t => t.toLowerCase().includes(query))
    ).slice(0, 5); // limit to 5

    const problems = trackedProblems.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.titleSlug.toLowerCase().includes(query)
    ).slice(0, 5); // limit to 5

    return { docs, problems };
  }, [searchQuery, documents, trackedProblems, isSearchMode]);

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
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs md:flex items-start justify-center hidden pt-[10vh]"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="fixed inset-0 z-[60] pointer-events-none md:flex items-start justify-center hidden pt-[10vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
          className={`bg-white rounded-2xl shadow-2xl border border-neutral-200 flex transition-all duration-300 pointer-events-auto overflow-hidden
            ${isSearchMode ? "w-[600px]" : "w-[850px]"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Panel - Stats (Hidden in search mode) */}
          <AnimatePresence>
            {!isSearchMode && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 220 }}
                exit={{ opacity: 0, width: 0 }}
                className="bg-neutral-50 border-r border-neutral-100 flex flex-col overflow-hidden shrink-0"
              >
                <div className="p-5 flex-1 w-[220px]">
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
                  ) : (
                    <div className="text-sm text-neutral-500">
                      <p className="mb-3">Connect your LeetCode account to see your stats here.</p>
                      <button 
                        onClick={handleOpenSettings}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Connect Account →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Box - Search & List */}
          <div className="flex-1 flex flex-col min-w-[400px]">
            {/* Search Input */}
            <div className="relative px-4 py-4 border-b border-neutral-100 flex items-center">
              <Search className="w-5 h-5 text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems, articles, or commands..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-900 placeholder-neutral-400 ml-3 text-base"
              />
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <kbd className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-[10px] font-mono text-neutral-500">ESC</kbd>
              </div>
            </div>

            {/* Results / Navigation List */}
            <div className="overflow-y-auto max-h-[350px] p-2 custom-scrollbar">
              {isSearchMode ? (
                <div className="space-y-4 py-2">
                  {searchResults.docs.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Learning Resources</h4>
                      {searchResults.docs.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => { onSelectDocument(doc); onClose(); }}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 flex items-center gap-3 group transition-colors"
                        >
                          <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{doc.title}</p>
                            <p className="text-[11px] text-neutral-500">{doc.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.problems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">Tracked Problems</h4>
                      {searchResults.problems.map(p => (
                        <button
                          key={p._id}
                          onClick={() => handleNavigate("tracker")}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 flex items-center gap-3 group transition-colors"
                        >
                          <div className="p-2 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{p.title}</p>
                            <p className="text-[11px] text-neutral-500">{p.difficulty || "Unknown"} • {p.attemptCount} attempts</p>
                          </div>
                        </button>
                      ))}
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
                  
                  <button onClick={() => handleNavigate("home")} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 text-neutral-500 group-hover:text-indigo-600 transition-colors">
                        <Home className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">Home Dashboard</span>
                    </div>
                  </button>
                  
                  <button onClick={() => handleNavigate("learn")} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 text-neutral-500 group-hover:text-indigo-600 transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">Study Theory & Docs</span>
                    </div>
                  </button>
                  
                  <button onClick={() => handleNavigate("tracker")} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 text-neutral-500 group-hover:text-emerald-600 transition-colors">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">Problem Tracker</span>
                    </div>
                  </button>
                  
                  <button onClick={() => handleNavigate("tracks")} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 text-neutral-500 group-hover:text-purple-600 transition-colors">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">Roadmap Tracks</span>
                    </div>
                  </button>

                  <div className="h-px bg-neutral-100 my-2 mx-2"></div>

                  <button onClick={handleOpenSettings} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 text-neutral-500 group-hover:text-neutral-900 transition-colors">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">Settings</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Heatmap (Hidden in search mode) */}
          <AnimatePresence>
            {!isSearchMode && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 230 }}
                exit={{ opacity: 0, width: 0 }}
                className="bg-neutral-50 border-l border-neutral-100 flex flex-col overflow-hidden shrink-0"
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
                    <LeetCodeHeatmap submissionCalendar={calendarData.submissionCalendar} weeksToShow={16} />
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
