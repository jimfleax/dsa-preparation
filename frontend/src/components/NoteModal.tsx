import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { X, StickyNote, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { TrackedProblem } from "../types";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  problem: TrackedProblem | null;
}

export default function NoteModal({
  isOpen,
  onClose,
  onUpdated,
  problem,
}: NoteModalProps) {
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    if (problem && isOpen) {
      setNotes(problem.notes || "");
      setError(null);
      setSuccess(false);
      
      // Auto focus the textarea after render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Put cursor at the end
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length
          );
        }
      }, 50);
    }
  }, [problem, isOpen]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!problem) return;

    if (notes.length > 2000) {
      setError("Notes cannot exceed 2000 characters.");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const response = await fetch(`${apiBase}/api/tracker/${problem._id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          notes: notes.trim() === "" ? null : notes.trim() 
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save note.");
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

  const handleClear = async (e: React.MouseEvent) => {
    e.preventDefault();
    setNotes("");
    // We can directly save null to clear it
    if (problem?.notes) {
      setError(null);
      setSuccess(false);
      setSaving(true);
      try {
        const token = await getToken();
        const response = await fetch(`${apiBase}/api/tracker/${problem._id}/notes`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: null }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || "Failed to clear note.");
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
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  useEscapeKey(isOpen, handleClose, 50, "note-modal");

  if (!isOpen || !problem) return null;

  const isOverLimit = notes.length > 2000;

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
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 line-clamp-1">
                  Problem Notes
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium line-clamp-1">
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

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <div className="p-6 pb-2 flex-1 flex flex-col gap-3">
              <div className="relative flex-1 flex flex-col group">
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving}
                  placeholder="Write down your thoughts, approaches, or key takeaways for this problem..."
                  className="note-editor w-full h-full min-h-[200px] flex-1 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono shadow-inner resize-none"
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
                  <span 
                    className={`note-char-count text-[10px] font-bold px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border shadow-sm ${
                      isOverLimit 
                        ? "text-rose-600 border-rose-200" 
                        : "text-neutral-400 border-neutral-200"
                    }`}
                  >
                    {notes.length} / 2000
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium shrink-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Note saved successfully!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 shrink-0 bg-neutral-50/50">
              <button
                type="button"
                onClick={handleClear}
                disabled={saving || (!problem?.notes && !notes)}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                Clear Note
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isOverLimit}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-100 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Note"
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
