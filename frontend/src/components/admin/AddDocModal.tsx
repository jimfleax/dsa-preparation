import { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { X, FileUp, FileText } from "lucide-react";
import BaseModal from "../BaseModal";

interface AddDocModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDocModal({ onClose, onSuccess }: AddDocModalProps) {
  const { adminToken } = useAdminAuth();

  // Form states
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");

  // Feedback states
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.name.endsWith(".md")) {
      setUploadError("Please upload a valid Markdown file (.md)");
      return;
    }

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      // Basic binary / corrupt file check
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text.slice(0, 1024))) {
        setUploadError(
          "The file appears to be corrupt or is not a valid text document.",
        );
        setContent("");
        return;
      }

      setContent(text);

      let extractedTitle = "";
      let extractedTags: string[] = [];

      // Parse YAML frontmatter
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
      const match = text.match(frontmatterRegex);

      if (match) {
        const fmContent = match[1];
        const titleMatch = fmContent.match(/title:\s*['"]?(.*?)['"]?(\r?\n|$)/);
        if (titleMatch) extractedTitle = titleMatch[1].trim();

        const tagsMatch = fmContent.match(/tags:\s*(.+?)(\r?\n|$)/);
        if (tagsMatch) {
          extractedTags = tagsMatch[1]
            .replace(/[\[\]]/g, "")
            .split(",")
            .map((t) => t.trim().replace(/['"]/g, ""))
            .filter(Boolean);
        }
      } else {
        // Fallback to first # Heading
        const headingMatch = text.match(/^#\s+(.*?)$/m);
        if (headingMatch) {
          extractedTitle = headingMatch[1].trim();
        }
      }

      if (extractedTitle) setTitle(extractedTitle);
      else if (!title)
        setTitle(file.name.replace(".md", "").replace(/-/g, " "));

      if (extractedTags.length > 0) {
        setTags(extractedTags.join(", "));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");

    if (!title || !content || !filename) {
      setUploadError("Title, filename and content are required");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsUploading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/docs`,
        {
          method: "POST",
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
        setUploadError(err.error || "Failed to upload document");
      }
    } catch (error) {
      console.error(error);
      setUploadError("Error uploading document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      modalId="add-doc-modal"
      title="Upload New Document"
      subtitle="Upload a markdown file to add to learning docs."
      maxWidthClass="max-w-2xl"
      error={uploadError || null}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <form id="add-doc-form" onSubmit={handleSubmit} className="space-y-6">

          <div className="p-6 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors relative group">
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center">
              <FileUp className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors mb-3" />
              <span className="text-sm font-semibold text-neutral-700">
                Click to select a markdown file
              </span>
              <span className="text-xs text-neutral-500 mt-1">
                .md files only
              </span>
              <input
                type="file"
                accept=".md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {filename && (
              <div className="absolute inset-0 bg-indigo-50/95 flex items-center justify-center rounded-2xl backdrop-blur-sm border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <FileText className="w-5 h-5" />
                  {filename}
                </div>
              </div>
            )}
          </div>

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

          {content && (
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Preview Content (truncated)
              </label>
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-hide">
                {content.slice(0, 500)} {content.length > 500 && "..."}
              </div>
            </div>
          )}
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
          form="add-doc-form"
          disabled={isUploading || !content}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </button>
      </div>
    </BaseModal>
  );
}
