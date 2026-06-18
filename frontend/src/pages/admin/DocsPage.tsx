import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function DocsPage() {
  const { adminToken } = useAdminAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchDocs();
  }, [adminToken]);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/admin/docs", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      setDocs(json || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      const res = await fetch("/api/admin/docs", {
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
      await fetch(`/api/admin/docs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      fetchDocs();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading docs...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Learning Documents</h1>
      
      <div className="bg-white shadow sm:rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Document</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Markdown File</label>
            <input 
              type="file" 
              accept=".md" 
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filename</label>
              <input type="text" value={filename} onChange={e => setFilename(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
          </div>
          {content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview Content (truncated)</label>
              <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {content.slice(0, 500)} {content.length > 500 && "..."}
              </div>
            </div>
          )}
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Upload Document
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {Array.isArray(docs) && docs.map((doc: any) => (
            <li key={doc._id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{doc.title}</h4>
                <p className="text-sm text-gray-500">{doc.filename}</p>
              </div>
              <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
