import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { adminFetch } from "../../lib/adminFetch";
import { FileText, Trash2, Tag, Calendar, Plus } from "lucide-react";
import AddDocModal from "../../components/admin/AddDocModal";

export default function DocsPage() {
  const { adminToken } = useAdminAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await adminFetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/docs`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      const json = await res.json();
      setDocs(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [adminToken]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await adminFetch(
        `${import.meta.env.VITE_API_URL || ""}/api/admin/docs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      fetchDocs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4 relative">
      <div className="flex items-start justify-between mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Learning Documents
          </h1>
          <p className="text-base text-neutral-500 font-medium">
            Upload and manage markdown study materials.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full bg-white border border-neutral-100 rounded-2xl p-12 text-center text-neutral-400 font-medium animate-pulse">
            Loading documents...
          </div>
        ) : docs.length === 0 ? (
          <div className="col-span-full bg-white border border-neutral-100 rounded-2xl p-16 flex flex-col items-center text-center">
            <FileText className="w-12 h-12 text-neutral-200 mb-4" />
            <h3 className="text-lg font-bold text-neutral-900">
              No documents found
            </h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
              Upload your first markdown document to see it here.
            </p>
          </div>
        ) : (
          docs.map((doc: any) => (
            <div
              key={doc._id}
              className="group bg-white border border-neutral-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-indigo-950 transition-colors truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate">
                      {doc.filename}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 mt-2">
                    {doc.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2.5 py-1 bg-neutral-50 text-neutral-600 rounded-lg text-xs font-bold border border-neutral-200 group-hover:border-indigo-100 transition-colors"
                      >
                        <Tag className="w-3 h-3 text-neutral-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 group-hover:border-indigo-50 transition-colors">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddDocModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchDocs();
          }}
        />
      )}
    </div>
  );
}
