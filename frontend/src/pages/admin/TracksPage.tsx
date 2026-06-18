import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function TracksPage() {
  const { adminToken } = useAdminAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      if (json.success) {
        setTracks(json.tracks);
      } else {
        setTracks(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [adminToken]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this track?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/tracks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      fetchTracks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-gray-500">Loading tracks...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tracks</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Add Track
        </button>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tracks.map((track) => (
                <tr key={track._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{track.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{track.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{track.order || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-600 hover:text-blue-600 mr-4">Edit</button>
                    <button onClick={() => handleDelete(track._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {tracks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No tracks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
