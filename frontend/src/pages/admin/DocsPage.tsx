import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { FileText, Upload, Trash2, Tag, FileUp, Calendar } from "lucide-react";

export default function DocsPage() {
  const { adminToken } = useAdminAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    if (!title) setTitle(file.name.replace(".md", "").replace(/-/g, " "));

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !filename) return alert("Title, filename and content are required");

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ title, filename, tags: tagArray, content })
      });
      
      if (res.ok) {
        setTitle("");
        setTags("");
        setFilename("");
        setContent("");
        fetchDocs();
      } else {
        const err = await res.json();
        alert("Failed to upload: " + err.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading document");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      fetchDocs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      <div className="max-w-2xl mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Learning Documents
        </h1>
        <p className="text-base text-neutral-500 font-medium">
          Upload and manage markdown study materials.
        </p>
      </div>
      
      <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-6 md:p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900">Upload New Document</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors relative group">
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-center">
              <FileUp className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 transition-colors mb-3" />
              <span className="text-sm font-semibold text-neutral-700">Click to select a markdown file</span>
              <span className="text-xs text-neutral-500 mt-1">.md files only</span>
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
              <label className="block text-sm font-bold text-neutral-700 mb-2">Filename</label>
              <input 
                type="text" 
                value={filename} 
                onChange={e => setFilename(e.target.value)} 
                required 
                className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor" 
                placeholder="e.g. basics.md"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor" 
                placeholder="Document Title"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              className="block w-full rounded-xl border-neutral-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none note-editor" 
              placeholder="e.g. arrays, strings, algorithms"
            />
          </div>
          
          {content && (
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">Preview Content (truncated)</label>
              <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-300 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-hide">
                {content.slice(0, 500)} {content.length > 500 && "..."}
              </div>
            </div>
          )}
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full bg-white border border-neutral-100 rounded-2xl p-12 text-center text-neutral-400 font-medium animate-pulse">
            Loading documents...
          </div>
        ) : docs.length === 0 ? (
          <div className="col-span-full bg-white border border-neutral-100 rounded-2xl p-16 flex flex-col items-center text-center">
            <FileText className="w-12 h-12 text-neutral-200 mb-4" />
            <h3 className="text-lg font-bold text-neutral-900">No documents found</h3>
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
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-indigo-950 transition-colors line-clamp-1">{doc.title}</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{doc.filename}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 mt-2">
                    {doc.tags.map((tag: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-50 text-neutral-600 rounded-lg text-xs font-bold border border-neutral-200 group-hover:border-indigo-100 transition-colors">
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
    </div>
  );
}
