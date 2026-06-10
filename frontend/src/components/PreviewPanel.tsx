import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  FileText,
  ArrowRightLeft,
  BookOpen,
  Terminal,
  Code,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown-light.css";
import { DocumentMetadata, DocumentDetail } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface PreviewPanelProps {
  activeDoc: DocumentMetadata | null;
  isOpen: boolean;
  onClose: () => void;
  isMaximized: boolean;
  setIsMaximized: (val: boolean) => void;
}

export default function PreviewPanel({
  activeDoc,
  isOpen,
  onClose,
  isMaximized,
  setIsMaximized,
}: PreviewPanelProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKey(isOpen, onClose, 35, "preview-panel");

  useEffect(() => {
    if (!activeDoc) {
      setData(null);
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiBase =
          (import.meta as any).env.VITE_API_URL ||
          "https://dsa-preparation-788547842951.asia-south1.run.app";
        const response = await fetch(
          `${apiBase}/api/document?type=${activeDoc.type}&filename=${activeDoc.filename}`,
        );
        const result = await response.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "Failed to load document.");
        }
      } catch (err: any) {
        console.error("Error fetching document content:", err);
        setError("Network error. Unable to load workspace document.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
    // Reset copy state and maximize state when switching documents
    setCopied(false);
  }, [activeDoc]);

  // Lock root page scroll when a modal overlay is active on smaller screens
  useEffect(() => {
    if (isOpen) {
      const lockScroll = () => {
        const isMobileOrTablet = window.innerWidth < 1024;
        if (isMaximized || isMobileOrTablet) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      };

      lockScroll();
      window.addEventListener("resize", lockScroll);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("resize", lockScroll);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, isMaximized]);

  // Reset maximized state when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
    }
  }, [isOpen, setIsMaximized]);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop overlay - visible on mobile/tablet, or when maximized, captures clicks to dismiss panel */}
      <div
        id="preview-backdrop"
        onClick={onClose}
        className={`fixed inset-0 z-35 bg-black/40 backdrop-blur-xs transition-all duration-300 ${
          isOpen
            ? isMaximized
              ? "opacity-100 pointer-events-auto"
              : "opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        id="preview-sidebar-container"
        className={`fixed inset-y-0 right-0 z-40 bg-white border-l border-neutral-100 shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${
          isMaximized
            ? "w-full"
            : "w-full md:w-[500px] lg:w-[600px] xl:w-[650px]"
        }`}
      >
        {/* Top Navigation Control Strip */}
        <div
          id="preview-panel-header"
          className="h-16 border-b border-neutral-100 flex items-center justify-between px-6 bg-white shrink-0"
        >
          <div id="header-meta-group" className="flex items-center gap-2.5">
            <div
              id="item-icon-wrapper"
              className="p-2 border border-indigo-100 bg-indigo-50/50 text-indigo-700 rounded-lg"
            >
              {activeDoc?.type === "theory" ? (
                <BookOpen className="w-4 h-4 text-indigo-600" />
              ) : (
                <Terminal className="w-4 h-4 text-indigo-750" />
              )}
            </div>
            <div>
              <h4
                id="header-meta-title"
                className="text-xs text-indigo-600 font-bold uppercase tracking-widest leading-none mb-1"
              >
                {activeDoc?.type === "theory"
                  ? "Theory Module"
                  : "Problem Sheet"}
              </h4>
              <p
                id="header-meta-filename"
                className="text-[11px] font-mono text-neutral-500 leading-none"
              >
                {activeDoc?.type === "theory" ? "theory" : "problemsheets"}/
                {activeDoc?.filename}
              </p>
            </div>
          </div>

          <div id="header-action-group" className="flex items-center gap-1">
            {data && (
              <button
                id="copy-text-btn"
                onClick={handleCopy}
                title="Copy original raw markdown content"
                className="p-2 hover:bg-indigo-50/50 rounded-lg text-neutral-500 hover:text-indigo-700 active:scale-95 transition-all cursor-pointer"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-650">
                    <Check className="w-4 h-4" /> Copied
                  </span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
            {/* Maximize/Minimize Toggle Button */}
            <button
              id="maximize-sidebar-btn"
              onClick={() => setIsMaximized(!isMaximized)}
              title={
                isMaximized
                  ? "Minimize Preview"
                  : "Maximize Preview (Full Screen)"
              }
              className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-500 hover:text-neutral-850 active:scale-95 transition-all cursor-pointer"
            >
              {isMaximized ? (
                <Minimize2 className="w-4.5 h-4.5 text-indigo-600" />
              ) : (
                <Maximize2 className="w-4.5 h-4.5" />
              )}
            </button>
            <button
              id="close-sidebar-btn"
              onClick={onClose}
              title="Collapse Preview Panel"
              className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-500 hover:text-neutral-850 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Main Container Work Area */}
        <div
          id="preview-workspace-area"
          className="flex-1 overflow-y-auto px-8 py-6"
        >
          {!activeDoc ? (
            <div
              id="no-active-doc-placeholder"
              className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400"
            >
              <FileText className="w-12 h-12 stroke-1 mb-3 text-neutral-200" />
              <h3
                id="no-active-doc-heading"
                className="text-sm font-semibold text-neutral-650"
              >
                No Document Selected
              </h3>
              <p
                id="no-active-doc-desc"
                className="text-xs text-neutral-450 max-w-xs mt-1"
              >
                Select any theory module or problemsheet from the grid workspace
                to render the preview here.
              </p>
            </div>
          ) : loading ? (
            <div
              id="preview-loading-state"
              className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400"
            >
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div
              id="preview-error-state"
              className="h-full flex flex-col items-center justify-center text-center p-6"
            >
              <div
                id="preview-error-icon"
                className="w-12 h-12 text-rose-500 bg-rose-50 flex items-center justify-center rounded-2xl mb-4"
              >
                <Code className="w-5 h-5" />
              </div>
              <h3
                id="preview-error-heading"
                className="text-sm font-semibold text-neutral-850"
              >
                Preview Failed to Render
              </h3>
              <p
                id="preview-error-desc"
                className="text-xs text-neutral-500 max-w-sm mt-1"
              >
                {error}
              </p>
            </div>
          ) : data ? (
            <div id="preview-content-grid" className="space-y-6">
              {/* Extended Meta Tags Strip */}
              <div
                id="preview-metadata-strip"
                className="bg-indigo-50/20 p-5 border border-indigo-100/50 rounded-2xl space-y-3"
              >
                <h1
                  id="preview-meta-title"
                  className="text-xl font-bold text-neutral-900 tracking-tight leading-tight"
                >
                  {data.metadata.title}
                </h1>

                <div
                  id="meta-pills-row"
                  className="flex flex-wrap gap-2 items-center text-xs"
                >
                  {/* Category Pill */}
                  <div
                    id="meta-pill-cat"
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-100 text-indigo-750 rounded-md font-medium"
                  >
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    {data.metadata.category}
                  </div>
                </div>

                {/* Tag List */}
                {data.metadata.tags.length > 0 && (
                  <div
                    id="meta-tags-container"
                    className="pt-2 border-t border-indigo-100/30 flex flex-wrap gap-1.5 items-center"
                  >
                    <span
                      id="tags-lbl"
                      className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mr-1"
                    >
                      Tags:
                    </span>
                    {data.metadata.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-medium border border-indigo-100/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Rendered Pure Markdown */}
              <div id="markdown-scroller" className="markdown-body max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>{data.content}</Markdown>
              </div>
            </div>
          ) : null}
        </div>

        {/* Floating Action Hint */}
        {data && (
          <div
            id="preview-action-footer"
            className="p-4 border-t border-neutral-50 bg-white flex items-center justify-between shrink-0"
          >
            <p id="footer-actions-tip" className="text-[11px] text-neutral-400">
              Editing this content? Just modify files inside `/content`
              directory!
            </p>
            <button
              id="footer-copy-btn"
              onClick={handleCopy}
              className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-full text-xs font-bold flex items-center gap-2 active:scale-95 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Solution Code
            </button>
          </div>
        )}
      </div>
    </>
  );
}
