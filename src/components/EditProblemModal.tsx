import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Hash,
  Trash2,
} from "lucide-react";
import { TrackedProblem } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface EditProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  problem: TrackedProblem | null;
}

export default function EditProblemModal({
  isOpen,
  onClose,
  onUpdated,
  problem,
}: EditProblemModalProps) {
  const [url, setUrl] = useState<string>("");
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [titlePreview, setTitlePreview] = useState<string>("");
  const [difficultyPreview, setDifficultyPreview] = useState<string>("");
  const [fetchingTitle, setFetchingTitle] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    if (problem && isOpen) {
      setUrl(problem.url);
      setAttemptCount(problem.attemptCount);
      setTitlePreview(problem.title);
      setDifficultyPreview(problem.difficulty || "");
      setError(null);
      setSuccess(false);
      setConfirmDelete(false);
    }
  }, [problem, isOpen]);

  const handleUrlChange = async (value: string) => {
    setUrl(value);
    setError(null);
    setSuccess(false);

    if (problem && value.trim() === problem.url) {
      // Reverted to original URL
      setTitlePreview(problem.title);
      setDifficultyPreview(problem.difficulty || "");
      return;
    }

    const match = value.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (match) {
      const slug = match[1].toLowerCase();
      setFetchingTitle(true);
      setTitlePreview("");
      setDifficultyPreview("");

      try {
        const response = await fetch(`${apiBase}/api/problems/scrape-title`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value.trim() }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.title) {
          setTitlePreview(data.title);
          if (data.difficulty) setDifficultyPreview(data.difficulty);
        } else {
          setTitlePreview(
            slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          );
        }
      } catch (err) {
        setTitlePreview(
          slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        );
      } finally {
        setFetchingTitle(false);
      }
    } else {
      setTitlePreview("");
      setDifficultyPreview("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!problem) return;

    if (!url.trim()) {
      setError("Please enter a LeetCode problem URL.");
      return;
    }

    if (attemptCount < 1) {
      setError("Attempt count must be at least 1.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: url.trim(), attemptCount }),
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

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (!problem) return;

    setDeleting(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to delete problem.");
        setConfirmDelete(false);
        return;
      }

      onUpdated();
      handleClose();
    } catch (err) {
      setError("Network error. Could not reach the server.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setConfirmDelete(false);
    onClose();
  };

  useEscapeKey(isOpen, handleClose, 50, "edit-problem");

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
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Edit Problem
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Update problem URL and attempts
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                LeetCode URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={saving || deleting}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Problem Title
              </label>
              <div
                className={`w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium min-h-[42px] flex items-center justify-between ${titlePreview ? "text-neutral-800" : "text-neutral-400 italic"}`}
              >
                <div className="flex items-center gap-3">
                  <span>{titlePreview || "Enter URL to fetch title..."}</span>
                  {difficultyPreview && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        difficultyPreview === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
                          : difficultyPreview === "Medium"
                            ? "bg-amber-50 text-amber-700 border-amber-100/50"
                            : difficultyPreview === "Hard"
                              ? "bg-rose-50 text-rose-700 border-rose-100/50"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {difficultyPreview}
                    </span>
                  )}
                </div>
                {fetchingTitle && (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Attempt Count
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  value={attemptCount}
                  onChange={(e) =>
                    setAttemptCount(parseInt(e.target.value) || 1)
                  }
                  disabled={saving || deleting}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
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
                <span>Problem updated successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                  confirmDelete
                    ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
                    : "bg-white hover:bg-rose-50 text-rose-600 border-rose-200"
                } disabled:opacity-50`}
              >
                {deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving || deleting}
                  className="px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    saving || deleting || !titlePreview || fetchingTitle
                  }
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
