import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { X, FileEdit } from "lucide-react";
import BaseModal from "../BaseModal";

interface EditDocModalProps {
  doc: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDocModal({ doc, onClose, onSuccess }: EditDocModalProps) {
  const { adminToken } = useAdminAuth();

  // Form states
  const [title, setTitle] = useState(doc?.title || "");
  const [tags, setTags] = useState(doc?.tags ? doc.tags.join(", ") : "");
  const [filename, setFilename] = useState(doc?.filename || "");
  const [content, setContent] = useState(doc?.content || "");

  // Feedback states
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (doc) {
      setTitle(doc.title || "");
      setTags(doc.tags ? doc.tags.join(", ") : "");
      setFilename(doc.filename || "");
      setContent(doc.content || "");
    }
  }, [doc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");

    if (!title || !content || !filename) {
      setSaveError("Title, filename and content are required");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/docs/${doc._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ title, filename, tags: tagArray, content }),
        },
      );

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        setSaveError(err.error || "Failed to save document");
      }
    } catch (error) {
      console.error(error);
      setSaveError("Error saving document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      modalId="edit-doc-modal"
      title="Edit Document"
      subtitle={`Editing ${doc?.filename}`}
      maxWidthClass="max-w-4xl"
      error={saveError || null}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <form id="edit-doc-form" onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                required
                className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor"
                placeholder="e.g. basics.md"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor"
                placeholder="Document Title"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor"
              placeholder="e.g. arrays, strings, algorithms"
            />
          </div>

          <div className="flex flex-col flex-1 h-[400px]">
            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-indigo-500" />
              Markdown Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full h-full p-4 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono text-sm text-neutral-800 resize-none shadow-inner"
              placeholder="Write your markdown content here..."
              spellCheck={false}
            />
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="edit-doc-form"
          disabled={isSaving || !content}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </BaseModal>
  );
}
