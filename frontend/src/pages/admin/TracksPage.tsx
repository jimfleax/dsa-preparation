import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function TracksPage() {
  const { adminToken } = useAdminAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/admin/tracks", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const json = await res.json();
      if (json.success) {
        setTracks(json.tracks);
      } else {
        // Handle array returned directly
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
      await fetch(`/api/admin/tracks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      fetchTracks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading tracks...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tracks</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Add Track</button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tracks.map((track) => (
            <li key={track._id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-600 truncate">{track.title}</h3>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{track.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex space-x-2">
                    <button className="text-sm text-gray-600 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(track._id)} className="text-sm text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
