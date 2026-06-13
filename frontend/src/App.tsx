import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SignedIn, SignedOut, useAuth } from "./context/AuthContext";
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
  Settings,
  Map,
  Home,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { DocumentMetadata, UserSettings } from "./types";
import StatsGrid from "./components/StatsGrid";
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

export default function App() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collectionFilter, setCollectionFilter] = useState<
    "all" | "theory" | "problemsheets"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
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

  // Global shortcuts key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        e.preventDefault();
        if (activeMainTab === "learn") {
          searchInputRef.current?.focus();
        } else if (activeMainTab === "tracker") {
          document.getElementById("problems-search-input")?.focus();
        } else {
          // Switch to learn tab first if on home or tracks
          setActiveMainTab("learn");
          // Small delay to allow tab animation/rendering
          setTimeout(() => searchInputRef.current?.focus(), 150);
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
  }, [tabs]);

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

  // Filter Categories dynamically from currently loaded files
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    documents.forEach((doc) => {
      if (doc.category) categories.add(doc.category);
    });
    return ["All", ...Array.from(categories)];
  }, [documents]);

  // Combined search and multi-facet filtering selection
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Filter by collection type
      if (collectionFilter !== "all" && doc.type !== collectionFilter) {
        return false;
      }

      // 2. Filter by category
      if (categoryFilter !== "All" && doc.category !== categoryFilter) {
        return false;
      }

      // 3. Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesCategory = doc.category.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );

        return matchesTitle || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [documents, searchQuery, collectionFilter, categoryFilter]);

  const handleSelectDocument = (doc: DocumentMetadata) => {
    setActiveDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCollectionFilter("all");
    setCategoryFilter("All");
  };

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
              className="p-2 bg-indigo-600 rounded-xl text-white flex items-center justify-center"
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1
                id="navbar-main-heading"
                className="text-base font-bold text-neutral-905 tracking-tight leading-tight"
              >
                DSA Preparation
              </h1>
            </div>
          </div>

          {/* Center: Tab Selectors — only shown when signed in */}
          <SignedIn>
            <nav role="navigation">
              <div
                id="main-tab-selector"
                role="tablist"
                className="bg-neutral-50 p-1 rounded-xl border border-neutral-100 flex gap-1"
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
                    Home
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
                    Learn
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
                    Tracker
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
                    Tracks
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

              {/* Settings button */}
              <Tooltip content="User Settings">
                <button
                  id="settings-btn"
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 hover:bg-indigo-50 rounded-xl border border-neutral-100 text-neutral-500 hover:text-indigo-700 transition-colors cursor-pointer active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              {/* Native Logout / User Info */}
              <div className="relative group">
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold border-2 border-transparent hover:border-indigo-300 transition-all cursor-pointer"
                  title="Account"
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-lg rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-neutral-50 bg-neutral-50/50">
                    <p className="text-sm font-bold text-neutral-900 truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
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

      {/* Main Workspace Frame container */}
      <main
        id="dsa-main-content-layout"
        role="main"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 overflow-x-hidden relative"
      >
        {/* === SIGNED OUT: Landing Prompt === */}
        <SignedOut>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-lg">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 w-fit mx-auto mb-6">
                <GraduationCap className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Welcome to DSA Preparation
              </h2>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                Track your DSA problem-solving journey, organize study
                materials, and sync your LeetCode progress — all in one place.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center gap-2 mx-auto"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Get Started
              </button>
            </div>
          </div>
        </SignedOut>

        {/* === SIGNED IN: Full App === */}
        <SignedIn>
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
                  {/* Loaded Documents Dynamic Stats Strip */}
                  <StatsGrid documents={documents} />

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
                            placeholder="Search by title, category, or tags..."
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

                      {/* Collection Type Selector Segment */}
                      <div
                        id="collection-tabs-row"
                        className="bg-neutral-50 p-1 rounded-xl border border-neutral-100 flex gap-1 self-stretch sm:self-start lg:self-auto shrink-0 overflow-x-auto scrollbar-none"
                      >
                        <button
                          id="tab-collection-all"
                          onClick={() => setCollectionFilter("all")}
                          className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            collectionFilter === "all"
                              ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          All Collections
                        </button>
                        <button
                          id="tab-collection-theory"
                          onClick={() => setCollectionFilter("theory")}
                          className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            collectionFilter === "theory"
                              ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-650" />
                          Theory Mode
                        </button>
                        <button
                          id="tab-collection-sheets"
                          onClick={() => setCollectionFilter("problemsheets")}
                          className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            collectionFilter === "problemsheets"
                              ? "bg-white text-indigo-700 shadow-xs border border-indigo-100"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          Problemsheets
                        </button>
                      </div>
                    </div>

                    <div
                      id="filter-row-secondary"
                      className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-50 text-xs"
                    >
                      <div
                        id="multi-facet-filters-box"
                        className="flex flex-wrap items-center gap-3 flex-1"
                      >
                        {/* Category Filter Pills segment */}
                        <div
                          id="filter-category-select-wrapper"
                          className="flex items-center gap-2"
                        >
                          <span
                            id="lbl-category-select"
                            className="text-neutral-400 font-medium flex items-center gap-1.5"
                          >
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />{" "}
                            Filter Category:
                          </span>
                          <select
                            id="category-dropdown"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-white border border-neutral-200 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-755 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {availableCategories.map((cat, i) => (
                              <option key={i} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Active filters summary indicator */}
                      {(searchQuery ||
                        collectionFilter !== "all" ||
                        categoryFilter !== "All") && (
                        <button
                          id="clear-all-filters-btn"
                          onClick={handleClearFilters}
                          className="text-neutral-550 hover:text-indigo-650 font-semibold flex items-center gap-1 py-1 px-2 hover:bg-indigo-50/50 rounded-lg cursor-pointer select-none"
                        >
                          <X className="w-3.5 h-3.5" />
                          Clear Active Filters
                        </button>
                      )}
                    </div>
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
        </SignedIn>
      </main>

      {/* Footer Info Hub */}
      <footer
        id="dsa-footer"
        role="contentinfo"
        className="bg-white border-t border-neutral-100 py-6 mt-12 text-center text-xs text-neutral-400"
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
        <PreviewPanel
          activeDoc={activeDoc}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
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
