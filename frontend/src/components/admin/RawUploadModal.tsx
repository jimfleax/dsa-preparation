import { getBackendUrl } from "@/src/lib/envUtils";
import { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { getInstructionText } from "../../lib/rawUploadInstructions";
import { parseRawUploadMarkdown, ParseResult } from "../../lib/rawUploadParser";
import {
  Upload,
  ChevronRight,
  ChevronLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  XCircle
} from "lucide-react";
import { Stepper } from "../ui/Stepper";

interface RawUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (trackData: any) => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function RawUploadModal({
  isOpen,
  onClose,
  onComplete,
}: RawUploadModalProps) {
  const { adminToken } = useAdminAuth();

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [copied, setCopied] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");
  
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  
  // Fetching state
  const [isFetching, setIsFetching] = useState(false);
  const [currentFetchIndex, setCurrentFetchIndex] = useState(0);
  const [fetchedProblems, setFetchedProblems] = useState<any[]>([]);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [currentFetchUrl, setCurrentFetchUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      setCopied(false);
      setMarkdownInput("");
      setParseResult(null);
      setIsFetching(false);
      setCurrentFetchIndex(0);
      setFetchedProblems([]);
      setFailedUrls([]);
      setCurrentFetchUrl("");
    }
  }, [isOpen]);

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(getInstructionText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleParse = () => {
    const result = parseRawUploadMarkdown(markdownInput);
    setParseResult(result);
    if (result.success) {
      setPhase(3);
      startFetching(result);
    }
  };

  const fetchWithRetry = async (url: string, retries: number = 3): Promise<any> => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const res = await fetch(
          `${getBackendUrl()}/api/problems/scrape-title`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ url: url.trim() }),
          }
        );
        const data = await res.json();
        if (res.ok && data.success && data.title) {
          return { success: true, data };
        }
      } catch (err) {
        // Will retry
      }
      attempt++;
      if (attempt < retries) {
        await sleep(500 * Math.pow(2, attempt - 1)); // 500ms, 1000ms, 2000ms
      }
    }
    return { success: false };
  };

  const startFetching = async (result: ParseResult) => {
    setIsFetching(true);
    setFetchedProblems([]);
    setFailedUrls([]);
    setCurrentFetchIndex(0);

    // Flatten all URLs to fetch
    const allUrlsToFetch = [
      ...result.rootUrls,
      ...result.parts.flatMap((p) => p.urls)
    ];

    const fetchedMap = new Map<string, any>();
    const failed: string[] = [];

    for (let i = 0; i < allUrlsToFetch.length; i++) {
      const item = allUrlsToFetch[i];
      setCurrentFetchIndex(i);
      setCurrentFetchUrl(item.url);

      const res = await fetchWithRetry(item.url);
      if (res.success) {
        const pData = {
          title: res.data.title,
          titleSlug: item.slug,
          difficulty: res.data.difficulty || "Medium",
          url: item.url
        };
        fetchedMap.set(item.slug, pData);
        setFetchedProblems(prev => [...prev, pData]);
      } else {
        failed.push(item.url);
        setFailedUrls(prev => [...prev, item.url]);
      }
    }

    setIsFetching(false);
    setCurrentFetchUrl("");
    
    // We do NOT automatically hand off if there are failures, or even if success,
    // so user can see the results. Handoff happens on button click.
  };

  const handleHandoff = () => {
    if (!parseResult) return;

    // We use the fetched data to populate the structure
    // We map over the parseResult structure, replacing URLs with fetched objects.
    // If a problem failed to fetch, we skip it (or we could use a fallback, but skipping is safer or we let the user know they are missing)
    
    const finalRootProblems = parseResult.rootUrls
      .map(u => fetchedProblems.find(fp => fp.titleSlug === u.slug))
      .filter(Boolean);

    const finalParts = parseResult.parts.map(part => ({
      title: part.title,
      description: part.description || "",
      problems: part.urls
        .map(u => fetchedProblems.find(fp => fp.titleSlug === u.slug))
        .filter(Boolean)
    })).filter(part => part.problems.length > 0 || parseResult.parts.length > 0);

    const trackData = {
      title: parseResult.trackTitle || "",
      description: parseResult.trackDescription || "",
      problems: finalRootProblems,
      parts: finalParts
    };

    onComplete(trackData);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        if (!isFetching) onClose();
      }}
      modalId="raw-upload-wizard"
      title="Raw Track Upload"
      subtitle={<Stepper steps={["Copy Instructions", "Paste Response", "Fetch from LeetCode"]} currentStep={phase} />}
      icon={<Upload className="w-5 h-5" />}
      maxWidthClass="max-w-3xl"
      hideHeader={false}
    >
      <div className="relative overflow-hidden min-h-[500px]">
        
        {/* Phase 1: Instructions */}
        <div className={`absolute inset-0 p-6 flex flex-col transition-transform duration-300 ${phase === 1 ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-neutral-600 mb-4">
              To bulk-import a track, you can use any AI assistant (ChatGPT, Claude, etc.) to generate the required LeetCode URLs. Copy the instructions below, paste them into your AI, and copy its response.
            </p>
            
            <div className="bg-neutral-900 rounded-xl p-4 mb-4 overflow-x-auto text-xs font-mono text-neutral-300 whitespace-pre">
              {getInstructionText()}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center shrink-0">
            <button
              onClick={handleCopyInstructions}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                copied 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Instructions"}
            </button>
            
            <button
              onClick={() => setPhase(2)}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              Next: Paste Response <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase 2: Paste Response */}
        <div className={`absolute inset-0 p-6 flex flex-col transition-transform duration-300 ${phase === 2 ? "translate-x-0" : phase < 2 ? "translate-x-full" : "-translate-x-full"}`}>
          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-bold text-neutral-700 mb-2 shrink-0">
              Paste AI Response (Markdown)
            </label>
            <textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              placeholder="# Track: Blind 75..."
              className="w-full flex-1 min-h-[200px] p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            />
            
            {parseResult && !parseResult.success && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl shrink-0 max-h-40 overflow-y-auto">
                <div className="flex items-center gap-2 text-rose-700 font-bold mb-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {parseResult.errors.length} error(s) found
                </div>
                <ul className="space-y-1">
                  {parseResult.errors.map((err, i) => (
                    <li key={i} className="text-xs text-rose-600 flex items-start gap-2">
                      <span className="font-mono text-rose-400 bg-rose-100 px-1.5 py-0.5 rounded shrink-0">Line {err.line}</span>
                      <span className="mt-0.5">{err.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {parseResult && parseResult.warnings.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl shrink-0 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {parseResult.warnings.length} warning(s)
                </div>
                <ul className="space-y-1">
                  {parseResult.warnings.map((warn, i) => (
                    <li key={i} className="text-xs text-amber-600 flex items-start gap-2">
                      <span className="font-mono text-amber-400 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">Line {warn.line}</span>
                      <span className="mt-0.5">{warn.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center shrink-0">
            <button
              onClick={() => setPhase(1)}
              className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl flex items-center gap-2 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            
            <button
              onClick={handleParse}
              disabled={!markdownInput.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              Parse & Extract
            </button>
          </div>
        </div>

        {/* Phase 3: Fetching */}
        <div className={`absolute inset-0 p-6 flex flex-col transition-transform duration-300 ${phase === 3 ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex-1 overflow-y-auto">
            {parseResult && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{parseResult.trackTitle}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium">
                    <span>{parseResult.totalUrlCount} total problems</span>
                    <span>{parseResult.parts.length} subtracks</span>
                  </div>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-neutral-700">Fetching Progress</span>
                    <span className="text-xs font-bold text-neutral-500">
                      {fetchedProblems.length + failedUrls.length} / {parseResult.totalUrlCount}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${Math.max(5, ((fetchedProblems.length + failedUrls.length) / parseResult.totalUrlCount) * 100)}%` }}
                    ></div>
                  </div>
                  
                  {isFetching ? (
                    <div className="flex items-center gap-3 text-sm text-indigo-600 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span className="truncate">Fetching: {currentFetchUrl}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm font-bold text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                      Fetch complete
                    </div>
                  )}
                </div>

                {failedUrls.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-rose-600 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> 
                      Failed to fetch ({failedUrls.length})
                    </h4>
                    <ul className="space-y-2">
                      {failedUrls.map((url, i) => (
                        <li key={i} className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg truncate">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Successfully fetched ({fetchedProblems.length})
                  </h4>
                  <ul className="space-y-2">
                    {fetchedProblems.slice().reverse().map((p, i) => (
                      <li key={i} className="text-xs flex items-center justify-between bg-white border border-neutral-100 shadow-sm px-3 py-2 rounded-lg">
                        <span className="font-bold text-neutral-800 truncate pr-4">{p.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shrink-0 ${
                          p.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                          : p.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100/50"
                          : "bg-rose-50 text-rose-700 border-rose-100/50"
                        }`}>
                          {p.difficulty}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between items-center shrink-0">
            {isFetching ? (
              <button
                onClick={() => onClose()} // Could add a proper abort controller, but closing is fine for now
                className="px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setPhase(2)}
                className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl flex items-center gap-2 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Edit
              </button>
            )}
            
            <button
              onClick={handleHandoff}
              disabled={isFetching || fetchedProblems.length === 0}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              Open in Track Editor
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
