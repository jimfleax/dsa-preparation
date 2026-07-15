import { getBackendUrl } from "@/src/lib/envUtils";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  ExternalLink,
  RotateCcw,
  Loader2,
  CalendarClock,
  Hash,
  Sparkles,
} from "lucide-react";
import { TrackedProblem } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";
import BaseModal from "./BaseModal";

import { apiFetch } from "@/src/lib/apiFetch";
import { timeAgo } from "../lib/dateUtils";

/**
 * Weighted Spaced-Repetition Algorithm
 *
 * Selects a problem for revisit using weighted-random sampling.
 * Higher score = higher probability of being picked.
 *
 * score = daysSinceLastAttempt^1.3 × difficultyMultiplier × attemptDecay
 *
 * - Time Decay (^1.3): super-linear — old problems rise aggressively
 * - Difficulty: Hard 1.5, Medium 1.2, Easy 0.7, N/A 0.8
 * - Attempt Decay (1/ln(attempts+1)): strongly favors low-attempt, never zeroes
 */
export function selectSmartRevisitProblem(
  problems: TrackedProblem[],
): TrackedProblem | null {
  if (problems.length === 0) return null;
  if (problems.length === 1) return problems[0];

  const now = Date.now();

  const DIFFICULTY_MULTIPLIER: Record<string, number> = {
    Hard: 1.5,
    Medium: 1.2,
    Easy: 0.7,
  };
  const DEFAULT_DIFFICULTY_MULTIPLIER = 0.8;

  const scored = problems.map((problem) => {
    const msElapsed = now - new Date(problem.lastAttemptedDate).getTime();
    // Floor at 1 day so problems done today still have a score
    const daysSince = Math.max(1, msElapsed / (1000 * 60 * 60 * 24));

    const timeFactor = Math.pow(daysSince, 1.3);
    const diffMultiplier =
      DIFFICULTY_MULTIPLIER[problem.difficulty || ""] ??
      DEFAULT_DIFFICULTY_MULTIPLIER;
    const attemptDecay = 1 / Math.log(problem.attemptCount + 1);

    const score = timeFactor * diffMultiplier * attemptDecay;

    return { problem, score };
  });

  // Weighted random selection
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  let random = Math.random() * totalScore;

  for (const entry of scored) {
    random -= entry.score;
    if (random <= 0) return entry.problem;
  }

  // Fallback (should never reach here due to floating-point, but safety first)
  return scored[scored.length - 1].problem;
}

interface SmartRevisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: TrackedProblem | null;
  onRevisited: () => void;
}

/**
 * Two-phase modal for the Smart Revisit feature.
 *
 * Phase 1 — Problem Reveal: shows problem info + "Open in LeetCode" button.
 * Phase 2 — Mark Revisit: after opening LeetCode, shows Cancel + Mark as Revisited.
 */
export default function SmartRevisitModal({
  isOpen,
  onClose,
  problem,
  onRevisited,
}: SmartRevisitModalProps) {
  // Phase: 'reveal' (show problem) or 'confirm' (mark as revisited)
  const [phase, setPhase] = useState<"reveal" | "confirm">("reveal");
  const [isMarking, setIsMarking] = useState(false);

  const { getToken } = useAuth();
  const apiBase =
    getBackendUrl();

  const handleClose = () => {
    setPhase("reveal");
    setIsMarking(false);
    onClose();
  };

  useEscapeKey(isOpen, handleClose, 50, "smart-revisit-modal");

  if (!isOpen || !problem) return null;

  const handleOpenInLeetCode = () => {
    window.open(problem.url, "_blank", "noopener,noreferrer");
    setPhase("confirm");
  };

  const handleMarkRevisited = async () => {
    setIsMarking(true);
    try {
      const token = await getToken();
      const response = await apiFetch(
        `${apiBase}/api/tracker/${problem._id}/revisit`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        onRevisited();
        handleClose();
      }
    } catch (err) {
      console.error("Error marking revisit:", err);
    } finally {
      setIsMarking(false);
    }
  };

  // Difficulty badge styling — matches ProblemsTab
  const difficultyStyles: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    Medium: "bg-amber-50 text-amber-700 border-amber-100/50",
    Hard: "bg-rose-50 text-rose-700 border-rose-100/50",
  };
  const badgeClass =
    difficultyStyles[problem.difficulty || ""] ||
    "bg-neutral-100 text-neutral-600 border-neutral-200";

  // Human-readable time-ago imported from dateUtils

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      modalId="smart-revisit-modal"
      hideHeader
      absoluteClose
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-800">
              Smart Revisit
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium">
              {phase === "reveal"
                ? "Here's a problem to revisit"
                : "Did you solve it?"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        {phase === "reveal" ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-neutral-800 leading-snug">
                {problem.title}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                {problem.titleSlug}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Difficulty
                </p>
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${badgeClass}`}
                >
                  {problem.difficulty || "N/A"}
                </span>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Attempts
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Hash className="w-3 h-3 text-neutral-400" />
                  <span className="text-lg font-extrabold text-neutral-800">
                    {problem.attemptCount}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Last Done
                </p>
                <div className="flex items-center justify-center gap-1">
                  <CalendarClock className="w-3 h-3 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-700">
                    {timeAgo(problem.lastAttemptedDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenInLeetCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-200/50"
            >
              <ExternalLink className="w-4 h-4" />
              Open in LeetCode
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-neutral-800 mb-1">
                Done solving?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                Mark{" "}
                <span className="font-semibold text-neutral-700">
                  {problem.title}
                </span>{" "}
                as revisited to update your attempt count and last attempted
                date.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-sm font-bold active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkRevisited}
                disabled={isMarking}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-200/50"
              >
                {isMarking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {isMarking ? "Saving..." : "Mark as Revisited"}
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
