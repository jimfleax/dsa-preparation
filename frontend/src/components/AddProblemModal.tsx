import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Link2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void; // Callback to refresh the problems list
}

export default function AddProblemModal({
  isOpen,
  onClose,
  onAdded,
}: AddProblemModalProps) {
  const [url, setUrl] = useState<string>("");
  const [titlePreview, setTitlePreview] = useState<string>("");
  const [difficultyPreview, setDifficultyPreview] = useState<string>("");
  const [fetchingTitle, setFetchingTitle] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  /**
   * Extracts titleSlug from URL and fetches the real title from LeetCode via backend.
   */
  const handleUrlChange = async (value: string) => {
    setUrl(value);
    setError(null);
    setSuccess(false);

    const match = value.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (match) {
      const slug = match[1].toLowerCase();
      // Show loading state while fetching
      setFetchingTitle(true);
      setTitlePreview(""); // Clear old preview
      setDifficultyPreview(""); // Clear old difficulty

      try {
        // Fetch real title from LeetCode via a utility endpoint
        const response = await fetch(`${apiBase}/api/problems/scrape-title`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: value.trim() }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.title) {
          setTitlePreview(data.title);
          if (data.difficulty) setDifficultyPreview(data.difficulty);
        } else {
          // Fallback: Generate preview from slug if API fails
          console.warn(
            "[AddProblemModal] Could not fetch title, using slug preview",
          );
          setTitlePreview(
            slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          );
        }
      } catch (err) {
        // Fallback: Generate preview from slug on network error
        console.warn(
          "[AddProblemModal] Network error fetching title, using slug preview:",
          err,
        );
        setTitlePreview(
          slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        );
      } finally {
        setFetchingTitle(false);
      }
    } else {
      setTitlePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!url.trim()) {
      setError("Please enter a LeetCode problem URL.");
      return;
    }

    const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    if (!match) {
      setError("This doesn't look like a valid LeetCode problem URL.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to add problem.");
        return;
      }

      setSuccess(true);
      setUrl("");
      setTitlePreview("");
      setDifficultyPreview("");
      onAdded();

      // Auto-close after short delay to show success state
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 800);
    } catch (err: any) {
      setError("Network error. Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setTitlePreview("");
    setDifficultyPreview("");
    setError(null);
    setSuccess(false);
    onClose();
  };

  useEscapeKey(isOpen, handleClose, 50, "add-problem");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        id="add-problem-backdrop"
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal */}
      <div
        id="add-problem-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Add Problem
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Track a new LeetCode problem
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

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto"
          >
            {/* URL Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="problem-url-input"
                className="text-xs font-semibold text-neutral-600"
              >
                LeetCode URL
              </label>
              <input
                id="problem-url-input"
                type="url"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={saving}
                autoFocus
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Title Preview (fetched from LeetCode, read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Problem Title
              </label>
              <div
                className={`w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium min-h-[42px] flex items-center justify-between ${
                  titlePreview ? "text-neutral-800" : "text-neutral-400 italic"
                }`}
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
              <p className="text-[10px] text-neutral-400">
                Title is fetched from LeetCode in real-time as you enter the
                URL.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Problem added successfully!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !titlePreview || fetchingTitle}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Save Problem"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
