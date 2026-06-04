import { useState, useEffect, useMemo } from "react";
import { Search, X, ExternalLink, ArrowUpDown, Inbox, Trash2, Loader2, RotateCcw, Hash, CalendarClock } from "lucide-react";
import { ProblemProgress } from "../types";

interface ProblemsTabProps {
  onOpenAddModal: () => void;
  refreshKey?: number;
}

/**
 * Computes a human-readable relative time string (e.g. "3 days ago").
 */
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function ProblemsTab({ onOpenAddModal, refreshKey }: ProblemsTabProps) {
  const [problems, setProblems] = useState<ProblemProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [revisitingId, setRevisitingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'attempts'>("date");

  const apiBase = (import.meta as any).env.VITE_API_URL || "https://dsa-preparation-788547842951.asia-south1.run.app";

  const fetchProblems = async () => {
    try {
      const response = await fetch(`${apiBase}/api/problems`);
      const data = await response.json();
      if (data.success) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.error("Error fetching problems:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Records a revisit: increments attemptCount, updates lastAttemptedDate to now.
   */
  const handleRevisit = async (problemId: string) => {
    setRevisitingId(problemId);
    try {
      const response = await fetch(`${apiBase}/api/problems/${problemId}/revisit`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (data.success) {
        setProblems(prev =>
          prev.map(p => p._id === problemId ? data.problem : p)
        );
      }
    } catch (err) {
      console.error("Error recording revisit:", err);
    } finally {
      setRevisitingId(null);
    }
  };

  /**
   * Deletes a problem from the tracker.
   */
  const handleDelete = async (problemId: string) => {
    setDeletingId(problemId);
    try {
      const response = await fetch(`${apiBase}/api/problems/${problemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setProblems(prev => prev.filter(p => p._id !== problemId));
      }
    } catch (err) {
      console.error("Error deleting problem:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [refreshKey]);

  // Client-side filtering and sorting
  const filteredProblems = useMemo(() => {
    let result = [...problems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.titleSlug.includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "attempts") return b.attemptCount - a.attemptCount;
      return new Date(b.lastAttemptedDate).getTime() - new Date(a.lastAttemptedDate).getTime();
    });

    return result;
  }, [problems, searchQuery, sortBy]);

  // Calculate stats
  const totalAttempts = problems.reduce((sum, p) => sum + p.attemptCount, 0);
  const multiRevisited = problems.filter(p => p.attemptCount > 1).length;

  if (loading) {
    return (
      <div id="problems-loading" className="h-64 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 border-3 border-neutral-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-neutral-500 font-medium">Loading problem tracker...</p>
      </div>
    );
  }

  return (
    <div id="problems-tab-root" className="space-y-5">

      {/* Stats Strip */}
      <div id="problems-stats-strip" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-indigo-100 transition-colors">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Problems Solved</p>
            <p className="text-2xl font-extrabold text-neutral-800">{problems.length}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-emerald-100 transition-colors">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Total Attempts</p>
            <p className="text-2xl font-extrabold text-emerald-700">{totalAttempts}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-2xs flex items-center gap-4 hover:border-violet-100 transition-colors">
          <div className="bg-violet-50 p-2.5 rounded-xl text-violet-600">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Revisited</p>
            <p className="text-2xl font-extrabold text-violet-700">{multiRevisited}</p>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div id="problems-controls-panel" className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              id="problems-search-input"
              type="text"
              placeholder="Search problems by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-neutral-400 font-medium text-xs">Sort:</span>
            <select
              id="problems-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-neutral-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="date">Last Attempted</option>
              <option value="title">Title</option>
              <option value="attempts">Attempt Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems Table */}
      {filteredProblems.length === 0 ? (
        <div id="problems-empty-state" className="bg-white border border-neutral-100 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Inbox className="w-12 h-12 stroke-1 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">No Problems Tracked Yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {problems.length === 0
              ? "Start tracking your DSA journey! Add a problem you've solved."
              : "No problems match your search. Try a different query."}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              + Add Your First Problem
            </button>
          )}
        </div>
      ) : (
        <div id="problems-table-container" className="bg-white border border-neutral-100 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Problem</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">Attempts</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Last Attempted</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">Revisit</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="border-b border-neutral-50 hover:bg-indigo-50/20 transition-colors group"
                  >
                    {/* Problem Title + Link */}
                    <td className="px-5 py-3.5">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-neutral-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group/link"
                      >
                        <span className="truncate max-w-[300px]">{problem.title}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-300 group-hover/link:text-indigo-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{problem.titleSlug}</p>
                    </td>

                    {/* Attempt Count Badge */}
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold ${
                        problem.attemptCount > 1
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {problem.attemptCount}
                      </span>
                    </td>

                    {/* Last Attempted Date */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3 h-3 text-neutral-300" />
                        <span className="text-xs font-medium text-neutral-500">
                          {timeAgo(problem.lastAttemptedDate)}
                        </span>
                      </div>
                    </td>

                    {/* Revisit Button */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleRevisit(problem._id)}
                        disabled={revisitingId === problem._id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[11px] font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50 border border-indigo-100/50"
                        title="I revisited and solved this problem again"
                      >
                        {revisitingId === problem._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        {revisitingId === problem._id ? "Saving..." : "Revisit"}
                      </button>
                    </td>

                    {/* Delete (hover reveal) */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDelete(problem._id)}
                        disabled={deletingId === problem._id}
                        className="p-1.5 rounded-lg text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Remove from tracker"
                      >
                        {deletingId === problem._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-neutral-50 bg-neutral-50/30 text-[11px] text-neutral-400 font-medium">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
        </div>
      )}
    </div>
  );
}
