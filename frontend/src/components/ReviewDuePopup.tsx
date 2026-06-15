import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, CalendarClock, RotateCcw, Loader2, BookOpen } from "lucide-react";
import { TrackedProblem } from "../types";

interface ReviewDuePopupProps {
  onRevisited?: () => void;
}

export function ReviewActionCard({ 
  problem, 
  onRevisited 
}: { 
  problem: TrackedProblem; 
  onRevisited: (id: string) => void; 
}) {
  const [revisitingId, setRevisitingId] = useState<string | null>(null);
  const [keepReviewDuration, setKeepReviewDuration] = useState<string>("");
  const [showKeepReviewing, setShowKeepReviewing] = useState<boolean>(false);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  const handleRevisit = async (reviewDurationDays: number | null) => {
    setRevisitingId(problem._id);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}/revisit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewDurationDays }),
      });
      const data = await response.json();

      if (data.success) {
        setShowKeepReviewing(false);
        onRevisited(problem._id);
      }
    } catch (err) {
      console.error("Error recording revisit:", err);
    } finally {
      setRevisitingId(null);
    }
  };

  return (
    <div className="bg-neutral-50/50 rounded-xl border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="p-4 space-y-4">
        <div>
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-neutral-800 hover:text-indigo-600 transition-colors line-clamp-2"
          >
            {problem.title}
          </a>
          <p className="text-xs text-neutral-400 mt-1">
            Last attempted {Math.floor((Date.now() - new Date(problem.lastAttemptedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </p>
        </div>

        {showKeepReviewing ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                placeholder="Days"
                value={keepReviewDuration}
                onChange={(e) => setKeepReviewDuration(e.target.value)}
                className="w-20 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-neutral-500 font-medium">days later</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeepReviewing(false)}
                disabled={revisitingId === problem._id}
                className="flex-1 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleRevisit(parseInt(keepReviewDuration) || problem.reviewDurationDays || 1)
                }
                disabled={revisitingId === problem._id || !keepReviewDuration}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {revisitingId === problem._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleRevisit(null)}
              disabled={revisitingId === problem._id}
              className="w-full px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 border border-emerald-100"
            >
              {revisitingId === problem._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Mark as Reviewed
            </button>
            <button
              onClick={() => setShowKeepReviewing(true)}
              disabled={revisitingId === problem._id}
              className="w-full px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-neutral-200"
            >
              Keep Reviewing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewDuePopup({ onRevisited }: ReviewDuePopupProps) {
  const [dueProblems, setDueProblems] = useState<TrackedProblem[]>([]);
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchDueProblems = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${apiBase}/api/tracker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success && data.problems) {
          const now = Date.now();
          const due = data.problems.filter((p: TrackedProblem) => {
            if (!p.reviewDurationDays) return false;
            const lastAttempt = new Date(p.lastAttemptedDate).getTime();
            const diffDays = (now - lastAttempt) / (1000 * 60 * 60 * 24);
            return diffDays >= p.reviewDurationDays;
          });
          setDueProblems(due);
        }
      } catch (err) {
        console.error("Failed to fetch due problems:", err);
      }
    };

    fetchDueProblems();
  }, [isSignedIn, getToken, apiBase]);

  useEffect(() => {
    const handleOpen = () => setIsModalDismissed(false);
    window.addEventListener('openReviewModal', handleOpen);
    return () => window.removeEventListener('openReviewModal', handleOpen);
  }, []);

  const handleRevisitDone = (problemId: string) => {
    setDueProblems((prev) => prev.filter((p) => p._id !== problemId));
    if (onRevisited) onRevisited();
  };

  if (dueProblems.length === 0 || isModalDismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsModalDismissed(true)}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">
        <div className="flex justify-between items-center bg-indigo-50 border-b border-indigo-100 px-4 py-3 shrink-0">
           <span className="text-sm font-bold text-indigo-700 flex items-center gap-2">
             <CalendarClock className="w-4 h-4" />
             {dueProblems.length} problem{dueProblems.length > 1 ? "s" : ""} due for review
           </span>
           <button 
             onClick={() => setIsModalDismissed(true)} 
             className="p-1.5 bg-indigo-100/50 hover:bg-indigo-200/50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors cursor-pointer"
           >
             <X className="w-4 h-4"/>
           </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 no-scrollbar">
          {dueProblems.map((problem) => (
            <ReviewActionCard
              key={problem._id}
              problem={problem}
              onRevisited={handleRevisitDone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
