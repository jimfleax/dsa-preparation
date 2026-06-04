import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, Terminal, SlidersHorizontal, Layers, X, HelpCircle, GraduationCap, FolderOpen, RefreshCcw, Server, Wifi, WifiOff } from "lucide-react";
import { DocumentMetadata } from "./types";
import StatsGrid from "./components/StatsGrid";
import DocumentCard from "./components/DocumentCard";
import PreviewPanel from "./components/PreviewPanel";

export default function App() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'theory' | 'problemsheets'>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [activeDoc, setActiveDoc] = useState<DocumentMetadata | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Backend connection tracking states
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'unreachable'>("connecting");
  const [backendLatency, setBackendLatency] = useState<number | null>(null);

  // Load all listed documents on mount
  const fetchDocumentsList = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || "https://dsa-preparation-788547842951.asia-south1.run.app";
      const response = await fetch(`${apiBase}/api/documents`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Error loading listed documents:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Perform dynamic ping health check
  const checkBackendStatus = async () => {
    setBackendStatus("connecting");
    const startTime = performance.now();
    try {
      const apiBase = (import.meta as any).env.VITE_API_URL || "https://dsa-preparation-788547842951.asia-south1.run.app";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${apiBase}/api/health`, { 
        signal: controller.signal,
        cache: 'no-store'
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
  };

  useEffect(() => {
    fetchDocumentsList();
    checkBackendStatus();
  }, []);

  // Filter Categories dynamically from currently loaded files
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    documents.forEach(doc => {
      if (doc.category) categories.add(doc.category);
    });
    return ["All", ...Array.from(categories)];
  }, [documents]);

  // Combined search and multi-facet filtering selection
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
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
        const matchesTags = doc.tags.some(tag => tag.toLowerCase().includes(query));
        
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
    <div id="dsa-app-root" className="min-h-screen bg-[#fafafa] text-neutral-800 font-sans antialiased flex flex-col">
      
      {/* Dynamic Navigation Top-Bar */}
      <header id="dsa-navbar" className="bg-white border-b border-neutral-100 h-16 shrink-0 sticky top-0 z-30">
        <div id="navbar-container" className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div id="navbar-logo-sec" className="flex items-center gap-3">
            <div id="logo-icon-box" className="p-2 bg-indigo-600 rounded-xl text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 id="navbar-main-heading" className="text-base font-bold text-neutral-905 tracking-tight leading-tight">DSA Preparation</h1>
            </div>
          </div>

          <div id="navbar-controls-sec" className="flex items-center gap-2">
            <button
              id="refresh-docs-btn"
              onClick={() => fetchDocumentsList(true)}
              disabled={refreshing}
              title="Scan and synchronize markdown directories"
              className="p-2 hover:bg-indigo-50 rounded-xl border border-neutral-100 text-neutral-500 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 text-xs font-semibold"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              Sync Folders
            </button>
            <div id="version-pill" className="px-3 py-1 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-600 font-mono" onClick={()=>window.open("https://jimfleax.in", "blank")}>
              Jim Fleax
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main id="dsa-main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        


        {/* Loaded Documents Dynamic Stats Strip */}
        <StatsGrid documents={documents} />

        {/* Filtration Control Panel Box */}
        <div id="filter-control-panel-container" className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-2xs space-y-4">
          <div id="filter-row-primary" className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Search Input Box */}
            <div id="search-input-wrapper" className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-450 w-4.5 h-4.5" />
              <input
                id="search-input-field"
                type="text"
                placeholder="Search by title, category, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
              />
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
            <div id="collection-tabs-row" className="bg-neutral-50 p-1 rounded-xl border border-neutral-100 flex gap-1 self-stretch sm:self-start lg:self-auto shrink-0 overflow-x-auto scrollbar-none">
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

          <div id="filter-row-secondary" className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-50 text-xs">
            <div id="multi-facet-filters-box" className="flex flex-wrap items-center gap-3 flex-1">
              
              {/* Category Filter Pills segment */}
              <div id="filter-category-select-wrapper" className="flex items-center gap-2">
                <span id="lbl-category-select" className="text-neutral-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> Filter Category:
                </span>
                <select
                  id="category-dropdown"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-neutral-200 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-755 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {availableCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters summary indicator */}
            {(searchQuery || collectionFilter !== "all" || categoryFilter !== "All") && (
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
        <div id="workspace-grid-previewer-parent" className="flex-1 flex gap-6 items-start relative min-h-[400px]">
          
          {/* Grid listing content frame */}
          <div 
            id="documents-results-scroller" 
            className={`flex-1 transition-all duration-300 ${
              isPreviewOpen && !isPreviewMaximized ? "lg:mr-[600px] xl:mr-[650px]" : "mr-0"
            }`}
          >
            {loading ? (
              <div id="main-grid-loading" className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 border-3 border-neutral-200 border-t-neutral-800 rounded-full animate-spin mb-3"></div>
                <p id="main-grid-loading-lbl" className="text-xs text-neutral-500 font-medium">Scanning listed study collections...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div id="no-matching-docs" className="bg-white border border-neutral-100 rounded-2xl p-12 text-center max-w-lg mx-auto mt-8">
                <FolderOpen className="w-12 h-12 stroke-1 text-neutral-300 mx-auto mb-3" />
                <h3 id="no-matching-head" className="text-base font-bold text-neutral-800">No Match Found</h3>
                <p id="no-matching-desc" className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any resources matching your parameters: <code>{searchQuery || "Multiple Filters"}</code>. Try resetting filters or creating a new document in the collection folders.
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
              <div id="documents-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredDocuments.map(doc => (
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

          {/* Interactive Collapsible previewer component drawer */}
          <PreviewPanel
            activeDoc={activeDoc}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            isMaximized={isPreviewMaximized}
            setIsMaximized={setIsPreviewMaximized}
          />
        </div>

      </main>

      {/* Footer Info Hub */}
       <footer id="dsa-footer" className="bg-white border-t border-neutral-100 py-6 mt-12 text-center text-xs text-neutral-400">
        <div id="footer-inner" className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p id="footer-copy">© 2026 DSA Preparation. Built with ❤️ by <a href="https://jimfleax.in/" target="_blank">Reetabrata Bhandari</a>.</p>
          <div id="footer-meta" className="flex flex-wrap items-center gap-2 bg-neutral-50 p-2 border border-neutral-100 rounded-xl text-[11px] font-medium text-neutral-600">
            <div className="flex items-center gap-2 pl-2 pr-2 py-1 bg-white rounded-lg border border-neutral-100 shadow-3xs">
              {backendStatus === "connecting" ? (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-amber-600 font-bold">Checking Connection...</span>
                </span>
              ) : backendStatus === "connected" ? (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    Connected {backendLatency !== null ? `(${backendLatency}ms)` : ""}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                    <WifiOff className="w-3 h-3 text-rose-500 shrink-0" />
                    Unreachable / Offline
                  </span>
                </span>
              )}
            </div>

            <button
              onClick={checkBackendStatus}
              disabled={backendStatus === "connecting"}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-100/50 hover:border-indigo-200 text-[10px] font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 hover:text-indigo-700 disabled:opacity-50"
              title="Test backend connection strength"
            >
              <RefreshCcw className={`w-3 h-3 ${backendStatus === "connecting" ? "animate-spin text-indigo-500" : ""}`} />
              Test API Ping
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
