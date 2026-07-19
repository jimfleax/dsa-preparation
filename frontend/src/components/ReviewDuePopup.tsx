import { getBackendUrl } from "@/src/lib/envUtils";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { X, CalendarClock, ChevronRight } from "lucide-react";
import { TrackedProblem } from "../types";
import SmartRevisitModal from "./SmartRevisitModal";

import { apiFetch } from "@/src/lib/apiFetch";

interface ReviewDuePopupProps {
  onRevisited?: () => void;
  refreshKey?: number;
}

function ReviewActionCard({
  problem,
  onSelect,
}: {
  problem: TrackedProblem;
  onSelect: (problem: TrackedProblem) => void;
}) {
  return (
    <div 
      onClick={() => onSelect(problem)}
      className="bg-white hover:bg-indigo-50/50 rounded-xl border border-neutral-200 hover:border-indigo-200 overflow-hidden cursor-pointer group transition-all duration-200 shadow-sm hover:shadow-md animate-in slide-in-from-bottom-2 fade-in"
    >
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-neutral-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
            {problem.title}
          </h4>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
            Last attempted{" "}
            {Math.floor(
              (Date.now() - new Date(problem.lastAttemptedDate).getTime()) /
                (1000 * 60 * 60 * 24),
            )}{" "}
            days ago
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

export default function ReviewDuePopup({
  onRevisited,
  refreshKey,
}: ReviewDuePopupProps) {
  const [dueProblems, setDueProblems] = useState<TrackedProblem[]>([]);
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<TrackedProblem | null>(null);
  const { getToken, isSignedIn } = useAuth();
  const apiBase =
    getBackendUrl();

  const fetchDueProblems = useCallback(async () => {
    if (!isSignedIn) return [];
    try {
      const token = await getToken();
      const response = await apiFetch(`${apiBase}/api/tracker/due`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success && data.problems) {
        setDueProblems(data.problems);
        return data.problems as TrackedProblem[];
      }
    } catch (err) {
      console.error("Failed to fetch due problems:", err);
    }
    return [];
  }, [isSignedIn, getToken, apiBase]);

  useEffect(() => {
    fetchDueProblems();
  }, [fetchDueProblems, refreshKey]);

  useEffect(() => {
    const handleOpen = async () => {
      const problems = await fetchDueProblems();
      if (problems.length === 1) {
        setSelectedProblem(problems[0]);
      } else {
        setSelectedProblem(null);
      }
      setIsModalDismissed(false);
    };
    window.addEventListener("openReviewModal", handleOpen);
    return () => window.removeEventListener("openReviewModal", handleOpen);
  }, [fetchDueProblems]);

  const handleRevisitDone = (problemId: string) => {
    setDueProblems((prev) => prev.filter((p) => p._id !== problemId));
    if (onRevisited) onRevisited();
  };

  if (dueProblems.length === 0 || isModalDismissed) return null;

  if (selectedProblem) {
    return (
      <SmartRevisitModal
        isOpen={!!selectedProblem}
        onClose={() => {
          setSelectedProblem(null);
          if (dueProblems.length === 1) {
            setIsModalDismissed(true);
          }
        }}
        problem={selectedProblem}
        onRevisited={() => handleRevisitDone(selectedProblem._id)}
        mode="review"
      />
    );
  }

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
            {dueProblems.length} problem{dueProblems.length > 1 ? "s" : ""} due
            for review
          </span>
          <button
            onClick={() => setIsModalDismissed(true)}
            className="p-1.5 bg-indigo-100/50 hover:bg-indigo-200/50 text-indigo-600 hover:text-indigo-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 no-scrollbar">
          {dueProblems.map((problem) => (
            <ReviewActionCard
              key={problem._id}
              problem={problem}
              onSelect={setSelectedProblem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
