import React from "react";
import {
  ExternalLink,
  CalendarClock,
  RotateCcw,
  Loader2,
  Pencil,
  StickyNote,
  CalendarPlus,
  Trash2,
} from "lucide-react";
import { TrackedProblem } from "../types";
import { timeAgo } from "../lib/dateUtils";

import { Card } from "./ui/Card";

interface ProblemMobileCardProps {
  problem: TrackedProblem;
  revisitingId: string | null;
  deletingId: string | null;
  onRevisit: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (problem: TrackedProblem) => void;
  onNote: (problem: TrackedProblem) => void;
  onSchedule: (problem: TrackedProblem) => void;
  id?: string;
  isHighlighted?: boolean;
}

export const ProblemMobileCard = React.memo(function ProblemMobileCard({
  problem,
  revisitingId,
  deletingId,
  onRevisit,
  onDelete,
  onEdit,
  onNote,
  onSchedule,
  id,
  isHighlighted,
}: ProblemMobileCardProps) {
  return (
    <Card 
      id={id} 
      padding="sm" 
      className={`flex flex-col gap-3 rounded-none border-x-0 border-t-0 shadow-none transition-all duration-500 ease-in-out ${
        isHighlighted 
          ? "bg-indigo-50/60 border-indigo-200 ring-2 ring-indigo-500/50 shadow-inner z-10 relative" 
          : "hover:bg-indigo-50/20"
      }`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-neutral-800 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
          >
            <span className="line-clamp-2">{problem.title}</span>
            {(problem.notes || problem.hasNotes) && (
              <StickyNote className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
            )}
            <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
          </a>
          {problem.reviewDurationDays ? (
            (Date.now() - new Date(problem.lastAttemptedDate).getTime()) /
              (1000 * 60 * 60 * 24) >=
            problem.reviewDurationDays ? (
              <span className="inline-flex items-center gap-1 mt-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                <CalendarClock className="w-3 h-3" />
                Marked for review today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 mt-1.5 w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                <CalendarClock className="w-3 h-3" />
                Review Scheduled
              </span>
            )
          ) : null}
        </div>
        <span
          className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
            problem.difficulty === "Easy"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
              : problem.difficulty === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-100/50"
                : problem.difficulty === "Hard"
                  ? "bg-rose-50 text-rose-700 border-rose-100/50"
                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
          }`}
        >
          {problem.difficulty || "N/A"}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-medium">Attempts:</span>
          <span
            className={`inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              problem.attemptCount > 1
                ? "bg-emerald-50 text-emerald-700"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            {problem.attemptCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-3 h-3 text-neutral-400" />
          <span className="font-medium text-neutral-500">
            {timeAgo(problem.lastAttemptedDate)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-neutral-50">
        <button
          onClick={() => onRevisit(problem._id)}
          disabled={revisitingId === problem._id}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {revisitingId === problem._id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          Revisit
        </button>
        <button
          onClick={() => onEdit(problem)}
          className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNote(problem)}
          className={`px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer ${
            problem.notes || problem.hasNotes
              ? "text-indigo-500 bg-indigo-50 hover:bg-indigo-100"
              : "text-neutral-400 bg-neutral-50 hover:text-amber-600 hover:bg-amber-50"
          }`}
        >
          <StickyNote className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSchedule(problem)}
          className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(problem._id)}
          disabled={deletingId === problem._id}
          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {deletingId === problem._id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </Card>
  );
});
