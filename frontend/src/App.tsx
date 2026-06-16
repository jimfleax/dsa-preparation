import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SignedIn, SignedOut, useAuth } from "./context/AuthContext";
import { useNetworkStatus } from "./context/NetworkStatusContext";
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import {
  Search,
  BookOpen,
  Terminal,
  Layers,
  X,
  GraduationCap,
  FolderOpen,
  RefreshCcw,
  Code2,
  LogIn,
  Map,
  Home,
  Loader2,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import { DocumentMetadata, UserSettings, TrackedProblem } from "./types";
import DocumentCard from "./components/DocumentCard";
import PreviewPanel from "./components/PreviewPanel";
import TrackerTab from "./components/TrackerTab";
import TracksTab from "./components/TracksTab";
import AddProblemModal from "./components/AddProblemModal";
import SettingsModal from "./components/SettingsModal";
import SyncToast from "./components/SyncToast";
import HomeTab from "./components/HomeTab";
import AboutMeModal from "./components/AboutMeModal";
import Tooltip from "./components/Tooltip";
import ReviewDuePopup from "./components/ReviewDuePopup";
import CommandPalette from "./components/CommandPalette";
import { useCommandPalette } from "./hooks/useCommandPalette";
import LandingPage from "./components/LandingPage";

export default function App() {
  const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const { isOffline } = useNetworkStatus();
  const prevOfflineRef = useRef(isOffline);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDoc, setActiveDoc] = useState<DocumentMetadata | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success">("idle");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Top-level tab state: controls which main view is active
  const tabs = useMemo(() => ["home", "learn", "tracker", "tracks"] as const, []);
  const [activeMainTab, setActiveMainTab] = useState<typeof tabs[number]>("home");
  const [direction, setDirection] = useState(0);
  const prevTabRef = useRef<typeof tabs[number]>(activeMainTab);

  useEffect(() => {
    const currentIndex = tabs.indexOf(activeMainTab);
    const prevIndex = tabs.indexOf(prevTabRef.current);

    if (currentIndex !== prevIndex) {
      setDirection(currentIndex > prevIndex ? 1 : -1);
      prevTabRef.current = activeMainTab;
    }
  }, [activeMainTab, tabs]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [problemsRefreshKey, setProblemsRefreshKey] = useState<number>(0);

  // Backend connection tracking states
  const [backendStatus, setBackendStatus] = useState<
    "connecting" | "connected" | "unreachable"
  >("connecting");
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // User settings state
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showAboutMeModal, setShowAboutMeModal] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  // Sync state
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState<number>(0);
  const [newSubmissions, setNewSubmissions] = useState<any[]>([]);
  const [revisitedSubmissionsCount, setRevisitedSubmissionsCount] = useState<number>(0);
  const [revisitedSubmissions, setRevisitedSubmissions] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const { getToken, isSignedIn, logout, user } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  // Command Palette
  const {
    isOpen: isPaletteOpen,
    open: openPalette,
    close: closePalette,
    toggle: togglePalette,
    calendarData,
    isLoading: isCalendarLoading,
    error: calendarError
  } = useCommandPalette(userSettings?.leetcodeUsername);

  const [trackedProblemsForPalette, setTrackedProblemsForPalette] = useState<TrackedProblem[]>([]);

  // Fetch tracked problems when palette opens to populate search
  useEffect(() => {
    if (isPaletteOpen && isSignedIn) {
      const fetchProblems = async () => {
        try {
          const token = await getToken();
          const res = await fetch(`${apiBase}/api/tracker`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setTrackedProblemsForPalette(data.problems);
          }
        } catch (e) {}
      };
      fetchProblems();
    }
  }, [isPaletteOpen, isSignedIn, getToken, apiBase]);

  const checkLeetCodeSync = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/sync/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && (data.newCount > 0 || (data.revisitedCount && data.revisitedCount > 0))) {
        setNewSubmissionsCount(data.newCount || 0);
        setNewSubmissions(data.newSubmissions || []);
        setRevisitedSubmissionsCount(data.revisitedCount || 0);
        setRevisitedSubmissions(data.revisitedSubmissions || []);
        setShowSyncToast(true);
      }
    } catch (err) {
      console.error("Failed to check sync:", err);
    }
  }, [getToken, apiBase]);

  const handleTrackAll = async () => {
    setIsSyncing(true);
    try {
      const token = await getToken();
      
      const promises: Promise<any>[] = [];

      // Sync new submissions
      if (newSubmissions.length > 0) {
        promises.push(
          fetch(`${apiBase}/api/sync/track`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ submissions: newSubmissions, notrack: false }),
          }).then(res => res.json())
        );
      }

      // Sync revisited submissions
      if (revisitedSubmissions.length > 0) {
        revisitedSubmissions.forEach(sub => {
          promises.push(
            fetch(`${apiBase}/api/tracker/${sub.problemId}/revisit`, {
              method: "PATCH",
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ timestamp: sub.submission.timestamp }),
            }).then(res => res.json())
          );
        });
      }

      await Promise.all(promises);
      
      setShowSyncToast(false);
      setProblemsRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to track submissions:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDismissSync = async () => {
    setIsSyncing(true);
    try {
      const token = await getToken();
      
      // Only dismiss new submissions by tracking them with notrack=true
      if (newSubmissions.length > 0) {
        await fetch(`${apiBase}/api/sync/track`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submissions: newSubmissions, notrack: true }),
        });
      }
      
      // For revisited submissions, dismissing just clears the toast without updating the tracker
      setShowSyncToast(false);
    } catch (err) {
      console.error("Failed to dismiss submissions:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Fetches user settings from the backend. Auto-provisions a User document
   * on first login. Shows settings modal if LeetCode username is missing.
   */
  const fetchUserSettings = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/user/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        console.warn("Unauthorized token detected, logging out.");
        logout();
        return;
      }
      const data = await response.json();
      if (data.success) {
        setUserSettings(data.settings);
        // Prompt to set LeetCode username if missing
        if (!data.settings.leetcodeUsername) {
          setShowSettingsModal(true);
        } else {
          checkLeetCodeSync();
        }
      }
    } catch (err) {
      console.error("Error fetching user settings:", err);
    }
  }, [isSignedIn, getToken, apiBase, checkLeetCodeSync]);

  // Fetch user settings when auth state changes
  useEffect(() => {
    if (isSignedIn) {
      fetchUserSettings();
    } else {
      // Clean up state on sign-out to prevent data leaking between sessions
      setUserSettings(null);
      setShowSettingsModal(false);
    }
  }, [isSignedIn, fetchUserSettings]);

  // Load all listed documents on mount
  const fetchDocumentsList = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
      setSyncStatus("syncing");
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`${apiBase}/api/documents`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
        if (showRefreshIndicator) {
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        }
      } else {
        if (showRefreshIndicator) setSyncStatus("idle");
      }
    } catch (err) {
      console.error("Error loading listed documents:", err);
      if (showRefreshIndicator) setSyncStatus("idle");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Perform dynamic ping health check
  const checkBackendStatus = useCallback(async () => {
    setBackendStatus("connecting");
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${apiBase}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      const endTime = performance.now();
      if (response.ok && data.success) {
        setBackendStatus("connected");
        setBackendLatency(Math.round(endTime - startTime));
      } else {
        setBackendStatus("unreachable");
        setBackendLatency(null);
      }
    } catch (err) {
      console.error("Backend status check failed:", err);
      setBackendStatus("unreachable");
      setBackendLatency(null);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchDocumentsList();
    checkBackendStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Offline / Online title swap ────────────────────────────
  useEffect(() => {
    document.title = isOffline
      ? "No Internet — DSA Preparation"
      : "DSA Preparation";
  }, [isOffline]);

  // ── Auto-refresh all data when coming back online ──────────
  useEffect(() => {
    if (prevOfflineRef.current && !isOffline) {
      // Transitioned from offline → online: refresh everything
      fetchDocumentsList();
      checkBackendStatus();
      fetchUserSettings();
      setProblemsRefreshKey((k) => k + 1);
    }
    prevOfflineRef.current = isOffline;
  }, [isOffline, checkBackendStatus, fetchUserSettings]);

  // Global shortcuts key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }

      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === "Home") {
        e.preventDefault(); // Prevents default scrolling behavior
        setActiveMainTab("home");
      } else if (e.key === "/") {
        // Focus search input only within the current tab; do nothing if tab has no search bar
        if (activeMainTab === "learn") {
          e.preventDefault();
          searchInputRef.current?.focus();
        } else if (activeMainTab === "tracker") {
          e.preventDefault();
          document.getElementById("problems-search-input")?.focus();
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setActiveMainTab((current) => {
          const currentIndex = tabs.indexOf(current);
          if (e.key === "ArrowLeft") {
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            return tabs[prevIndex];
          } else {
            const nextIndex = (currentIndex + 1) % tabs.length;
            return tabs[nextIndex];
          }
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeMainTab]);

  // Auto-ping every 5 seconds when unreachable
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (backendStatus === "unreachable") {
      intervalId = setInterval(() => {
        checkBackendStatus();
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [backendStatus, checkBackendStatus]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    documents.forEach((doc) => {
      doc.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [documents]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Combined search and filtering selection
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesTags) return false;
      }

      if (selectedTags.length > 0) {
        const hasSomeTags = selectedTags.some((t) => doc.tags.includes(t));
        if (!hasSomeTags) return false;
      }

      return true;
    });
  }, [documents, searchQuery, selectedTags]);

  const handleSelectDocument = (doc: DocumentMetadata) => {
    setActiveDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const displayTags = useMemo(() => {
    return [...allTags].sort((a, b) => {
      const aSelected = selectedTags.includes(a);
      const bSelected = selectedTags.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [allTags, selectedTags]);

  return (
    <div
      id="dsa-app-root"
      className="min-h-screen bg-[#fafafa] text-neutral-800 font-sans antialiased flex flex-col"
    >
      {/* Dynamic Navigation Top-Bar */}
      <header
        id="dsa-navbar"
        role="banner"
        className="bg-white border-b border-neutral-100 h-16 shrink-0 sticky top-0 z-30"
      >
        <div
          id="navbar-container"
          className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
        >
          <div id="navbar-logo-sec" className="flex items-center gap-3">
            <div
              id="logo-icon-box"
              className={`p-2 sm:p-2 rounded-xl text-white flex items-center justify-center transition-colors duration-300 ${
                isOffline ? "bg-rose-500" : "bg-indigo-600"
              }`}
            >
              {isOffline ? (
                <WifiOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <div>
              <h1
                id="navbar-main-heading"
                className={`text-base font-bold tracking-tight leading-tight transition-colors duration-300 ${
                  isOffline ? "text-rose-600" : "text-neutral-905"
                }`}
              >
                {isOffline ? "No Internet" : "DSA Preparation"}
              </h1>
            </div>
          </div>

          {/* Center: Tab Selectors — only shown when signed in */}
          <SignedIn>
            <nav role="navigation">
              <div
                id="main-tab-selector"
                role="tablist"
                className="bg-neutral-50 p-1 rounded-xl border border-neutral-100 hidden sm:flex gap-1"
              >
                <Tooltip content="Home Dashboard" shortcut="Home">
                  <button
                    id="tab-home"
                    role="tab"
                    aria-selected={activeMainTab === "home"}
                    onClick={() => setActiveMainTab("home")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeMainTab === "home"
                        ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Home</span>
                  </button>
                </Tooltip>
                <Tooltip content="Learning Resources" shortcut="< >">
                  <button
                    id="tab-learn"
                    role="tab"
                    aria-selected={activeMainTab === "learn"}
                    onClick={() => setActiveMainTab("learn")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeMainTab === "learn"
                        ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Learn</span>
                  </button>
                </Tooltip>
                <Tooltip content="Problem Tracker" shortcut="< >">
                  <button
                    id="tab-tracker"
                    role="tab"
                    aria-selected={activeMainTab === "tracker"}
                    onClick={() => setActiveMainTab("tracker")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeMainTab === "tracker"
                        ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tracker</span>
                  </button>
                </Tooltip>
                <Tooltip content="Skill Tracks" shortcut="< >">
                  <button
                    id="tab-tracks"
                    role="tab"
                    aria-selected={activeMainTab === "tracks"}
                    onClick={() => setActiveMainTab("tracks")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeMainTab === "tracks"
                        ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tracks</span>
                  </button>
                </Tooltip>
              </div>
            </nav>
          </SignedIn>

          <div id="navbar-controls-sec" className="flex items-center gap-2">
            <SignedIn>
              {/* Show Sync button only in Learn tab */}
              {activeMainTab === "learn" && (
                <Tooltip content="Scan markdown directories">
                  <button
                    id="refresh-docs-btn"
                    onClick={() => fetchDocumentsList(true)}
                    disabled={syncStatus !== "idle"}
                    className="h-9 px-3 hover:bg-indigo-50 rounded-xl border border-neutral-100 text-neutral-500 hover:text-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 text-xs font-semibold min-w-[80px]"
                  >
                    <AnimatePresence mode="wait">
                      {syncStatus === "idle" && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-1.5"
                        >
                          <RefreshCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sync</span>
                        </motion.div>
                      )}
                      {syncStatus === "syncing" && (
                        <motion.div
                          key="syncing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-1.5"
                        >
                          <RefreshCcw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span className="hidden sm:inline">Syncing...</span>
                        </motion.div>
                      )}
                      {syncStatus === "success" && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-1.5 text-emerald-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Synced</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </Tooltip>
              )}

              <div className="hidden sm:block">
                <Tooltip content="use this keyboard shortcut to open control panel">
                  <button
                    onClick={togglePalette}
                    className="flex items-center gap-1 bg-transparent hover:bg-neutral-50/50 transition-all duration-200 cursor-pointer active:scale-95 select-none p-1 rounded-xl opacity-80 hover:opacity-100"
                  >
                  {isMac ? (
                    <>
                      <kbd className="bg-neutral-100/90 border border-neutral-200/80 px-2 py-1 rounded-md text-[9px] font-mono text-neutral-600 font-bold shadow-xs leading-none">⌘</kbd>
                      <kbd className="bg-neutral-100/90 border border-neutral-200/80 px-2 py-1 rounded-md text-[9px] font-mono text-neutral-600 font-bold shadow-xs leading-none">K</kbd>
                    </>
                  ) : (
                    <>
                      <kbd className="bg-neutral-100/90 border border-neutral-200/80 px-2 py-1 rounded-md text-[9px] font-mono text-neutral-600 font-bold shadow-xs leading-none">Ctrl</kbd>
                      <kbd className="bg-neutral-100/90 border border-neutral-200/80 px-2 py-1 rounded-md text-[9px] font-mono text-neutral-600 font-bold shadow-xs leading-none">K</kbd>
                    </>
                  )}
                </button>
              </Tooltip>
              </div>

              {/* Native Logout / User Info */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold border-2 border-transparent hover:border-indigo-300 transition-all cursor-pointer text-sm sm:text-base relative z-50"
                  title="Account"
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </button>
                {userDropdownOpen && (
                  <>
                    {/* Backdrop to close when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-lg rounded-xl overflow-hidden z-50 transition-all">
                      <div className="p-3 border-b border-neutral-50 bg-neutral-50/50">
                        <p className="text-sm font-bold text-neutral-900 truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </SignedIn>

            <SignedOut>
              <button
                id="sign-in-btn"
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-100"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* ── Offline Banner ─────────────────────────────────── */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden sticky top-16 z-29"
          >
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-b border-rose-100 px-4 py-2.5 flex items-center justify-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-xs font-semibold text-rose-700">
                You're offline — showing cached data. Reconnecting automatically…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SIGNED OUT: Landing Page === */}
      <SignedOut>
        <main className="flex-1 w-full flex flex-col overflow-x-hidden">
          <LandingPage onSignIn={() => setShowLoginModal(true)} />
        </main>
      </SignedOut>

      {/* Main Workspace Frame container */}
      <SignedIn>
        <main
          id="dsa-main-content-layout"
          role="main"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:py-8 flex flex-col gap-6 overflow-x-hidden relative"
        >
          <ReviewDuePopup 
            refreshKey={problemsRefreshKey}
            onRevisited={() => setProblemsRefreshKey((k) => k + 1)} 
          />
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            {/* === HOME TAB VIEW === */}
            {activeMainTab === "home" && (
              <motion.div
                key="home"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full flex-1 flex flex-col gap-6"
              >
                <HomeTab
                  totalDocuments={documents.length}
                  onNavigate={setActiveMainTab}
                  refreshKey={problemsRefreshKey}
                />
              </motion.div>
            )}

            {/* === TRACKER TAB VIEW === */}
            {activeMainTab === "tracker" && (
              <motion.div
                key="tracker"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full flex-1 flex flex-col gap-6"
              >
                <TrackerTab
                  onOpenAddModal={() => setShowAddModal(true)}
                  refreshKey={problemsRefreshKey}
                />
              </motion.div>
            )}

            {/* === TRACKS TAB VIEW === */}
            {activeMainTab === "tracks" && (
              <motion.div
                key="tracks"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full flex-1 flex flex-col gap-6"
              >
                <TracksTab />
              </motion.div>
            )}

            {/* === LEARN TAB VIEW (existing content) === */}
            {activeMainTab === "learn" && (
              <motion.div
                key="learn"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full flex-1 flex flex-col gap-6"
              >
                <div className="flex flex-col gap-6">
                  {/* Filtration Control Panel Box */}
                  <div
                    id="filter-control-panel-container"
                    className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-2xs space-y-4"
                  >
                    <div
                      id="filter-row-primary"
                      className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between"
                    >
                      {/* Search Input Box */}
                      <div id="search-input-wrapper" className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-450 w-4.5 h-4.5" />
                        <Tooltip content="Quick Search" shortcut="/">
                          <input
                            id="search-input-field"
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by title or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
                          />
                        </Tooltip>
                        {searchQuery && (
                          <button
                            id="clear-search-btn"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tag Filter Strip */}
                    {allTags.length > 0 && (
                      <div
                        id="filter-tags-strip"
                        className="pt-3 border-t border-neutral-100 flex items-center gap-3 w-full overflow-hidden"
                      >
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider shrink-0">
                          Filter by Tags:
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 flex-1">
                          {displayTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                onClick={() => handleToggleTag(tag)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border active:scale-95 shrink-0 ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                        {selectedTags.length > 0 && (
                          <button
                            onClick={() => setSelectedTags([])}
                            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold active:scale-95 transition-all cursor-pointer border border-transparent hover:border-rose-100 bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg shrink-0"
                          >
                            <X className="w-3.5 h-3.5" /> Clear Tags
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Main interactive grid workarea */}
                  <div
                    id="workspace-grid-previewer-parent"
                    className="flex-1 flex gap-6 items-start relative min-h-[400px]"
                  >
                    {/* Grid listing content frame */}
                    <div
                      id="documents-results-scroller"
                      className={`flex-1 transition-all duration-300 ${
                        isPreviewOpen && !isPreviewMaximized
                          ? "lg:mr-[600px] xl:mr-[650px]"
                          : "mr-0"
                      }`}
                    >
                      {loading ? (
                        <div
                          id="main-grid-loading"
                          className="h-64 flex flex-col items-center justify-center text-center"
                        >
                          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                        </div>
                      ) : filteredDocuments.length === 0 ? (
                        <div
                          id="no-matching-docs"
                          className="bg-white border border-neutral-100 rounded-2xl p-12 text-center max-w-lg mx-auto mt-8"
                        >
                          <FolderOpen className="w-12 h-12 stroke-1 text-neutral-300 mx-auto mb-3" />
                          <h3
                            id="no-matching-head"
                            className="text-base font-bold text-neutral-800"
                          >
                            No Match Found
                          </h3>
                          <p
                            id="no-matching-desc"
                            className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed"
                          >
                            We couldn't find any resources matching your parameters:{" "}
                            <code>{searchQuery || "Multiple Filters"}</code>. Try
                            resetting filters or creating a new document in the
                            collection folders.
                          </p>
                          <button
                            id="reset-filters-hero-btn"
                            onClick={handleClearFilters}
                            className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                          >
                            Reset Parameters
                          </button>
                        </div>
                      ) : (
                        <div
                          id="documents-grid"
                          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                        >
                          {filteredDocuments.map((doc) => (
                            <DocumentCard
                              key={doc.id}
                              doc={doc}
                              isActive={activeDoc?.id === doc.id}
                              onSelect={() => handleSelectDocument(doc)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* End Learn Tab conditional */}
          </AnimatePresence>
        </main>
      </SignedIn>

      {/* === SIGNED IN: Bottom Navigation for Mobile === */}
      <SignedIn>
        <nav
          className="sm:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-neutral-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-40 pb-safe"
        >
          <div className="flex justify-around items-center px-4 py-2.5">
            <button
              onClick={() => setActiveMainTab("home")}
              className={`flex items-center justify-center p-3 rounded-xl transition-all active:scale-95 ${activeMainTab === "home" ? "text-indigo-600" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveMainTab("learn")}
              className={`flex items-center justify-center p-3 rounded-xl transition-all active:scale-95 ${activeMainTab === "learn" ? "text-indigo-600" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveMainTab("tracker")}
              className={`flex items-center justify-center p-3 rounded-xl transition-all active:scale-95 ${activeMainTab === "tracker" ? "text-indigo-600" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              <Code2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveMainTab("tracks")}
              className={`flex items-center justify-center p-3 rounded-xl transition-all active:scale-95 ${activeMainTab === "tracks" ? "text-indigo-600" : "text-neutral-400 hover:text-neutral-600"}`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </SignedIn>

      {/* Footer Info Hub */}
        <footer
        id="dsa-footer"
        role="contentinfo"
        className="bg-white border-t border-neutral-100 py-6 mt-12 text-center text-xs text-neutral-400 hidden sm:block"
      >
        <div
          id="footer-inner"
          className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3"
        >
          <p id="footer-copy" className="font-medium">
            Built with ❤️ by{" "}
            <button 
              onClick={() => setShowAboutMeModal(true)}
              className="text-indigo-600 hover:text-indigo-700 font-bold underline decoration-indigo-200 underline-offset-4 cursor-pointer transition-colors"
            >
              Reetabrata
            </button>
          </p>
          <div
            id="footer-meta"
            className="flex flex-wrap items-center gap-2 bg-neutral-50 p-2 border border-neutral-100 rounded-xl text-[11px] font-medium text-neutral-600"
          >
            <div className="flex items-center gap-2 pl-2 pr-2 py-1 bg-white rounded-lg border border-neutral-100 shadow-3xs">
              {backendStatus === "connecting" ? (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-amber-600 font-bold">
                    Checking Connection...
                  </span>
                </span>
              ) : backendStatus === "connected" ? (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    Connected{" "}
                    {backendLatency !== null ? `(${backendLatency}ms)` : ""}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                    Unreachable / Offline
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modals — rendered at root level for proper z-index stacking */}
      <SignedIn>
        <CommandPalette 
          isOpen={isPaletteOpen}
          onClose={closePalette}
          leetcodeUsername={userSettings?.leetcodeUsername}
          calendarData={calendarData}
          isLoadingCalendar={isCalendarLoading}
          calendarError={calendarError}
          documents={documents}
          trackedProblems={trackedProblemsForPalette}
          onNavigate={setActiveMainTab}
          onSelectDocument={handleSelectDocument}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <PreviewPanel
          activeDoc={activeDoc}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setActiveDoc(null);
          }}
          isMaximized={isPreviewMaximized}
          setIsMaximized={setIsPreviewMaximized}
        />
        {showSyncToast && (
          <SyncToast
            count={newSubmissionsCount}
            revisitCount={revisitedSubmissionsCount}
            onTrack={handleTrackAll}
            onDismiss={handleDismissSync}
            isProcessing={isSyncing}
          />
        )}
        <AddProblemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdded={() => setProblemsRefreshKey((k) => k + 1)}
        />
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          currentUsername={userSettings?.leetcodeUsername || ""}
          onSaved={(username) => {
            setUserSettings((prev) =>
              prev ? { ...prev, leetcodeUsername: username } : prev,
            );
            setShowSettingsModal(false);
            if (username) {
              checkLeetCodeSync();
            }
          }}
        />
      </SignedIn>
      <SignedOut>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      </SignedOut>

      <AboutMeModal
        isOpen={showAboutMeModal}
        onClose={() => setShowAboutMeModal(false)}
      />
    </div>
  );
}
