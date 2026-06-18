import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function AdminDocs() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch docs");
      const data = await res.json();
      setDocs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileTitle(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!fileTitle || !fileContent) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: fileTitle.replace('.md', ''),
          filename: fileTitle,
          content: fileContent,
          tags: []
        })
      });
      if (!res.ok) throw new Error("Failed to save doc");
      setFileContent("");
      setFileTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/docs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete doc");
      fetchDocs();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Docs Management</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Markdown Document</h2>
        <input 
          type="file" 
          accept=".md" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {fileContent && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Preview:</h3>
            <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 max-h-96 overflow-y-auto mb-4 prose max-w-none">
              <ReactMarkdown>{fileContent}</ReactMarkdown>
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Save Document
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {docs.map((doc) => (
              <tr key={doc._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.filename}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                  <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
