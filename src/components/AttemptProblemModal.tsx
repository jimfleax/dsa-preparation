import { useState } from "react";
import { ExternalLink, X, Play, Loader2 } from "lucide-react";
import { TrackedProblem } from "../types";
import { useAuth } from "../context/AuthContext";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface AttemptProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: any; // from Track
  trackedProblem?: TrackedProblem; // existing record, if any
  onUpdated: () => void;
}

export default function AttemptProblemModal({
  isOpen,
  onClose,
  problem,
  trackedProblem,
  onUpdated,
}: AttemptProblemModalProps) {
  const { getToken } = useAuth();
  const [phase, setPhase] = useState<"reveal" | "confirm">("reveal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEscapeKey(isOpen, onClose, 100, "attempt-problem");

  if (!isOpen) return null;

  const handleAttempt = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      if (trackedProblem) {
        // PATCH existing
        const res = await fetch(
          `${apiBase}/api/tracker/${trackedProblem._id}/revisit`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        // POST new
        const res = await fetch(`${apiBase}/api/tracker`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: problem.url,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save attempt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 shrink-0">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-500" />
            Attempt Problem
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-neutral-800">
              {problem.title}
            </h3>
            <span
              className={`inline-block mt-2 text-xs px-2 py-1 rounded font-bold ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-100 text-emerald-700"
                  : problem.difficulty === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
              }`}
            >
              {problem.difficulty}
            </span>
            {trackedProblem && (
              <p className="text-sm text-neutral-500 mt-3 font-medium bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                You've attempted this{" "}
                <strong className="text-indigo-600">
                  {trackedProblem.attemptCount}
                </strong>{" "}
                times.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {phase === "reveal" ? (
            <div className="flex flex-col gap-4">
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                onClick={() => setPhase("confirm")}
              >
                Solve on LeetCode
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-xs text-center text-neutral-400 font-medium px-4">
                Clicking this will open LeetCode in a new tab. Come back here to
                log your result!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-sm font-bold text-neutral-700 text-center mb-2">
                Did you solve it?
              </p>
              <button
                disabled={loading}
                onClick={() => handleAttempt()}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : trackedProblem ? (
                  "Log Revisit"
                ) : (
                  "Mark as Solved"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
