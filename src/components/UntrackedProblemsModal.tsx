import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, EyeOff, Loader2, RefreshCcw } from "lucide-react";
import { ProblemProgress } from "../types";

interface UntrackedProblemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTracked: () => void;
}

export default function UntrackedProblemsModal({
  isOpen,
  onClose,
  onTracked,
}: UntrackedProblemsModalProps) {
  const [problems, setProblems] = useState<ProblemProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    if (isOpen) {
      fetchUntracked();
    }
  }, [isOpen]);

  const fetchUntracked = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/problems/untracked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.error("Failed to fetch untracked problems:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrack = async (id: string) => {
    setTogglingId(id);
    try {
      const token = await getToken();
      const response = await fetch(
        `${apiBase}/api/problems/${id}/toggle-track`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setProblems((prev) => prev.filter((p) => p._id !== id));
        onTracked();
      }
    } catch (err) {
      console.error("Failed to toggle track status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-100 rounded-lg text-neutral-600">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Untracked Problems
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Problems you dismissed from sync
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-xs font-medium">
                  Loading untracked problems...
                </span>
              </div>
            ) : problems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-3">
                  <EyeOff className="w-5 h-5 text-neutral-300" />
                </div>
                <h3 className="text-sm font-bold text-neutral-700">
                  No Untracked Problems
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  All your LeetCode submissions are being tracked.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {problems.map((problem) => (
                  <div
                    key={problem._id}
                    className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors border border-transparent hover:border-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-neutral-800">
                        {problem.title}
                      </span>
                      {problem.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                            problem.difficulty === "Easy"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                              : problem.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-100/50"
                                : problem.difficulty === "Hard"
                                  ? "bg-rose-50 text-rose-700 border-rose-100/50"
                                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleTrack(problem._id)}
                      disabled={togglingId === problem._id}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {togglingId === problem._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-3.5 h-3.5" />
                      )}
                      Track
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50 shrink-0 flex justify-between items-center text-[11px] font-medium text-neutral-500">
            <span>
              Showing {problems.length} untracked problem
              {problems.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white text-neutral-700 rounded-lg border border-neutral-200 font-bold hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
