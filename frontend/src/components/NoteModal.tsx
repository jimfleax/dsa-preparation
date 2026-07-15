import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { StickyNote, Loader2, Pencil } from "lucide-react";
import { TrackedProblem } from "../types";
import BaseModal from "./BaseModal";
import FormAlert from "./FormAlert";

import { apiFetch } from "@/src/lib/apiFetch";

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

  const [loadingNotes, setLoadingNotes] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [originalNotes, setOriginalNotes] = useState<string>("");

  const { getToken } = useAuth();
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  // Fetch the full problem data (including notes) when modal opens
  useEffect(() => {
    if (!problem || !isOpen) return;

    const hasExistingNote = !!(problem.hasNotes || problem.notes);
    setIsEditing(!hasExistingNote);

    setError(null);
    setSuccess(false);
    setNotes(problem.notes || ""); // Optimistic: show whatever we have
    setOriginalNotes(problem.notes || "");

    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const token = await getToken();
        const response = await apiFetch(
          `${apiBase}/api/tracker/${problem._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await response.json();
        if (data.success && data.problem) {
          const fetchedNotes = data.problem.notes || "";
          setNotes(fetchedNotes);
          setOriginalNotes(fetchedNotes);
          if (fetchedNotes) {
            setIsEditing(false);
          }
        }
      } catch (err) {
        console.error("Error fetching problem notes:", err);
        // Keep whatever we had from the list data
      } finally {
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [problem?._id, isOpen]);

  useEffect(() => {
    if (isEditing && !loadingNotes && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            textareaRef.current.value.length,
            textareaRef.current.value.length,
          );
        }
      }, 50);
    }
  }, [isEditing, loadingNotes]);

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
      const response = await apiFetch(`${apiBase}/api/tracker/${problem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notes: notes.trim() === "" ? null : notes.trim(),
          url: problem.url,
          attemptCount: problem.attemptCount,
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
        const response = await apiFetch(
          `${apiBase}/api/tracker/${problem._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              notes: null,
              url: problem.url,
              attemptCount: problem.attemptCount,
            }),
          },
        );
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

  const handleCancelOrClose = () => {
    if (isEditing && originalNotes) {
      setNotes(originalNotes);
      setIsEditing(false);
      setError(null);
    } else {
      handleClose();
    }
  };

  if (!problem) return null;

  const isOverLimit = notes.length > 2000;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      modalId="note-modal"
      title="Problem Notes"
      subtitle={problem.title}
      icon={<StickyNote className="w-4 h-4" />}
      maxWidthClass="max-w-2xl"
      error={error || null}
    >
      <form
        onSubmit={handleSave}
        className="flex flex-col flex-1 overflow-hidden min-h-[300px]"
      >
        <div className="p-6 pb-2 flex-1 flex flex-col gap-3">
          <div className="relative flex-1 flex flex-col group">
            {!isEditing ? (
              <div className="w-full h-full min-h-[200px] flex-1 p-4 bg-white border border-transparent rounded-xl text-sm text-neutral-800 whitespace-pre-wrap overflow-y-auto font-sans shadow-inner">
                {loadingNotes ? (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  notes
                )}
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving || loadingNotes}
                  placeholder="Write down your thoughts, approaches, or key takeaways for this problem..."
                  className="note-editor w-full h-full min-h-[200px] flex-1 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans shadow-inner resize-none"
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
              </>
            )}
          </div>
          {success && (
            <FormAlert type="success" message="Note saved successfully!" />
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 shrink-0 bg-neutral-50/50 rounded-b-2xl">
          <div className="flex-1">
            {isEditing && (
              <button
                type="button"
                onClick={handleClear}
                disabled={saving || (!problem?.notes && !notes)}
                className="px-4 py-2.5 bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                Clear Note
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelOrClose}
              disabled={saving}
              className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl border border-neutral-200 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isEditing && originalNotes ? "Cancel" : "Close"}
            </button>
            <button
              type={isEditing ? "submit" : "button"}
              onClick={
                !isEditing
                  ? (e) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }
                  : undefined
              }
              disabled={isEditing && (saving || isOverLimit)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-100 cursor-pointer"
            >
              {isEditing ? (
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Note"
                )
              ) : (
                <>
                  <Pencil className="w-4 h-4" /> Edit Note
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
