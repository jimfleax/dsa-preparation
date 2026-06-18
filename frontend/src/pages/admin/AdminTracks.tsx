import { useState, useEffect } from "react";

export default function AdminTracks() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch tracks");
      const data = await res.json();
      setTracks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this track?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete track");
      fetchTracks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    const title = window.prompt("Enter track title:");
    if (!title) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description: "New track",
          order: tracks.length + 1,
          topics: []
        })
      });
      if (!res.ok) throw new Error("Failed to create track");
      fetchTracks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async (track: any) => {
    const newTitle = window.prompt("Enter new track title:", track.title);
    if (!newTitle) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks/${track._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error("Failed to edit track");
      fetchTracks();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tracks</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Create Track
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tracks.map((track) => (
              <tr key={track._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{track.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{track.order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(track)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(track._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
