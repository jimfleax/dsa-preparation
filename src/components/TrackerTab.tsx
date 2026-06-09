import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  X,
  ExternalLink,
  ArrowUpDown,
  Inbox,
  Trash2,
  Loader2,
  RotateCcw,
  Hash,
  CalendarClock,
  Pencil,
  EyeOff,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrackedProblem } from "../types";
import EditProblemModal from "./EditProblemModal";
import UntrackedProblemsModal from "./UntrackedProblemsModal";
import SmartRevisitModal, {
  selectSmartRevisitProblem,
} from "./SmartRevisitModal";
import { useEscapeKey } from "../hooks/useEscapeKey";

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

export default function ProblemsTab({
  onOpenAddModal,
  refreshKey,
}: ProblemsTabProps) {
  const [problems, setProblems] = useState<TrackedProblem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [revisitingId, setRevisitingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [problemToDelete, setProblemToDelete] = useState<TrackedProblem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "attempts">("date");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<TrackedProblem | null>(
    null,
  );
  const [isUntrackedModalOpen, setIsUntrackedModalOpen] =
    useState<boolean>(false);
  const [isSmartRevisitOpen, setIsSmartRevisitOpen] = useState<boolean>(false);
  const [smartRevisitProblem, setSmartRevisitProblem] =
    useState<TrackedProblem | null>(null);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEscapeKey(
    !!problemToDelete,
    () => setProblemToDelete(null),
    50,
    "delete-problem-confirm",
  );

  const fetchProblems = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = await getToken();
      const response = await fetch(
        `${apiBase}/api/tracker/${problemId}/revisit`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setProblems((prev) =>
          prev.map((p) => (p._id === problemId ? data.problem : p)),
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
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProblems((prev) => prev.filter((p) => p._id !== problemId));
        setProblemToDelete(null);
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
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.titleSlug.includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "attempts") return b.attemptCount - a.attemptCount;
      return (
        new Date(b.lastAttemptedDate).getTime() -
        new Date(a.lastAttemptedDate).getTime()
      );
    });

    return result;
  }, [problems, searchQuery, sortBy]);

  // Calculate stats
  const easyCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardCount = problems.filter((p) => p.difficulty === "Hard").length;
  const unratedCount = problems.length - (easyCount + mediumCount + hardCount);

  const difficultyData = [
    { name: "Easy", value: easyCount, color: "#10b981" },
    { name: "Medium", value: mediumCount, color: "#f59e0b" },
    { name: "Hard", value: hardCount, color: "#ef4444" },
    ...(unratedCount > 0
      ? [{ name: "Unrated", value: unratedCount, color: "#94a3b8" }]
      : []),
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div
        id="problems-loading"
        className="h-64 flex flex-col items-center justify-center text-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div id="problems-tab-root" className="space-y-5">
      {/* Stats Section */}
      <div
        id="problems-stats-section"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Total Solved Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-4 hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default group">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-400 font-semibold uppercase tracking-wider mb-1">
              Problems Solved
            </p>
            <p className="text-4xl font-extrabold text-neutral-800">
              {problems.length}
            </p>
          </div>
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center h-48 hover:border-neutral-200 hover:shadow-md transition-all duration-300">
          {problems.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  style={{ outline: "none" }}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ outline: "none" }}
                      className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    padding: "6px 10px",
                  }}
                  itemStyle={{ color: "#1f2937", fontWeight: 600, padding: 0 }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-neutral-400 font-medium">
              No problems tracked yet.
            </p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
          <div className="text-center mb-1">
            <p className="text-sm text-neutral-400 font-semibold uppercase tracking-wider">
              Quick Actions
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <button
              id="smart-revisit-btn"
              onClick={() => {
                const selected = selectSmartRevisitProblem(problems);
                if (selected) {
                  setSmartRevisitProblem(selected);
                  setIsSmartRevisitOpen(true);
                }
              }}
              disabled={problems.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Smart Revisit
            </button>
            <button
              id="add-problem-btn"
              onClick={onOpenAddModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Add Problem
            </button>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div
        id="problems-controls-panel"
        className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-2xs space-y-4"
      >
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

          {/* Sort & Untracked Modal Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsUntrackedModalOpen(true)}
              className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold border border-neutral-200 hover:border-neutral-300 transition-all duration-200 flex items-center gap-1.5 active:scale-95"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Untracked
            </button>
            <div className="w-px h-6 bg-neutral-200 mx-1"></div>
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
        <div
          id="problems-empty-state"
          className="bg-white border border-neutral-100 rounded-2xl p-12 text-center max-w-lg mx-auto"
        >
          <Inbox className="w-12 h-12 stroke-1 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800">
            No Problems Tracked Yet
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {problems.length === 0
              ? "Start tracking your DSA journey! Add a problem you've solved."
              : "No problems match your search. Try a different query."}
          </p>
          {problems.length === 0 && (
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 text-white text-xs font-bold rounded-xl active:scale-95 transition-all duration-200 cursor-pointer"
            >
              + Add Your First Problem
            </button>
          )}
        </div>
      ) : (
        <div
          id="problems-table-container"
          className="bg-white border border-neutral-100 rounded-2xl shadow-2xs overflow-hidden"
        >
          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col divide-y divide-neutral-100">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="p-4 bg-white hover:bg-indigo-50/20 transition-colors flex flex-col gap-3"
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
                      <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                    </a>
                    <p className="text-[11px] text-neutral-400 font-mono mt-1">
                      {problem.titleSlug}
                    </p>
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
                    <span className="text-neutral-500 font-medium">
                      Attempts:
                    </span>
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
                    onClick={() => handleRevisit(problem._id)}
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
                    onClick={() => {
                      setEditingProblem(problem);
                      setIsEditModalOpen(true);
                    }}
                    className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(problem._id)}
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
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Difficulty
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Attempts
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Last Attempted
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    Revisit
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center w-20">
                    Actions
                  </th>
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
                        <span className="truncate max-w-[300px]">
                          {problem.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-neutral-300 group-hover/link:text-indigo-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {problem.titleSlug}
                      </p>
                    </td>

                    {/* Difficulty Badge */}
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
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
                    </td>

                    {/* Attempt Count Badge */}
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold ${
                          problem.attemptCount > 1
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm text-indigo-600 rounded-lg text-[11px] font-bold active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 border border-indigo-100/50 hover:border-indigo-200"
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

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProblem(problem);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-90 transition-all duration-200 cursor-pointer"
                          title="Edit problem"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProblemToDelete(problem)}
                          disabled={deletingId === problem._id}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 active:scale-90 transition-all duration-200 cursor-pointer disabled:opacity-50"
                          title="Remove from tracker"
                        >
                          {deletingId === problem._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
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

      <EditProblemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProblem(null);
        }}
        onUpdated={fetchProblems}
        problem={editingProblem}
      />

      <UntrackedProblemsModal
        isOpen={isUntrackedModalOpen}
        onClose={() => setIsUntrackedModalOpen(false)}
        onTracked={fetchProblems}
      />

      <SmartRevisitModal
        isOpen={isSmartRevisitOpen}
        onClose={() => {
          setIsSmartRevisitOpen(false);
          setSmartRevisitProblem(null);
        }}
        problem={smartRevisitProblem}
        onRevisited={fetchProblems}
      />

      {/* Delete Confirmation Modal */}
      {problemToDelete && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setProblemToDelete(null)}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setProblemToDelete(null)
            }
          >
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-neutral-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5 px-6 py-4 border-b border-neutral-100">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">
                    Delete Problem
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-neutral-600 mb-6">
                  Are you sure you want to remove{" "}
                  <strong className="text-neutral-900">
                    {problemToDelete.title}
                  </strong>{" "}
                  from your tracker?
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setProblemToDelete(null)}
                    disabled={deletingId === problemToDelete._id}
                    className="px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(problemToDelete._id)}
                    disabled={deletingId === problemToDelete._id}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {deletingId === problemToDelete._id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
