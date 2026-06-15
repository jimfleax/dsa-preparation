import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, CalendarPlus, CalendarClock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { TrackedProblem } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface ScheduleReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  problem: TrackedProblem | null;
}

export default function ScheduleReviewModal({
  isOpen,
  onClose,
  onUpdated,
  problem,
}: ScheduleReviewModalProps) {
  const [reviewDuration, setReviewDuration] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    if (problem && isOpen) {
      setReviewDuration(problem.reviewDurationDays ? String(problem.reviewDurationDays) : "");
      setError(null);
      setSuccess(false);
    }
  }, [problem, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!problem) return;

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          url: problem.url, // URL is required by the schema, so we send the existing one
          attemptCount: problem.attemptCount, // Send existing attempt count
          reviewDurationDays: reviewDuration ? parseInt(reviewDuration) : null
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to update problem.");
        return;
      }

      setSuccess(true);
      onUpdated();
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err) {
      setError("Network error. Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!problem) return;

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          url: problem.url,
          attemptCount: problem.attemptCount,
          reviewDurationDays: null
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to remove review schedule.");
        return;
      }

      setSuccess(true);
      onUpdated();
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err) {
      setError("Network error. Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  useEscapeKey(isOpen, handleClose, 50, "schedule-review");

  if (!isOpen || !problem) return null;

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <CalendarPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Schedule Review
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium">
                  {problem.title}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-neutral-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
            {problem.reviewDurationDays ? (
              <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-medium">
                <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  This problem is currently scheduled for review on{" "}
                  <strong>
                    {new Date(
                      new Date(problem.lastAttemptedDate).getTime() +
                        problem.reviewDurationDays * 24 * 60 * 60 * 1000
                    ).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>.
                  <br />
                  <span className="text-indigo-600 opacity-90">Changing the duration below will overwrite the current schedule.</span>
                </span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Remind me to review in (days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 7"
                  value={reviewDuration}
                  onChange={(e) => setReviewDuration(e.target.value)}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400">
                Leave empty if you want to cancel an existing scheduled review.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Review schedule updated!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              {problem.reviewDurationDays ? (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={saving}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Remove Review"
                  )}
                </button>
              ) : null}
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Save Schedule"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
