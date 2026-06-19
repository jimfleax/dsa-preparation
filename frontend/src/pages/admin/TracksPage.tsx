import { useState, useEffect } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Map, Plus, Edit2, Trash2, Hash } from "lucide-react";
import TrackModal from "../../components/admin/TrackModal";

export default function TracksPage() {
  const { adminToken } = useAdminAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);

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

  const handleAddClick = () => {
    setEditingTrack(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (track: any) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const handleSaveTrack = async (trackJson: any) => {
    const url = editingTrack 
      ? `${import.meta.env.VITE_API_URL || ""}/api/admin/tracks/${editingTrack._id}`
      : `${import.meta.env.VITE_API_URL || ""}/api/admin/tracks`;
      
    const method = editingTrack ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}` 
      },
      body: JSON.stringify(trackJson)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save track");
    }

    await fetchTracks();
  };

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-2">
            Tracks
          </h1>
          <p className="text-base text-neutral-500 font-medium">
            Manage the learning paths and problem sequences.
          </p>
        </div>
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-max"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-12 text-center text-neutral-400 font-medium animate-pulse">
          Loading tracks...
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-16 flex flex-col items-center text-center">
          <Map className="w-12 h-12 text-neutral-200 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900">No tracks found</h3>
          <p className="text-sm text-neutral-500 mt-1 max-w-sm">
            You haven't created any learning tracks yet. Create your first track to start guiding users.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div 
              key={track._id} 
              className="group bg-white border border-neutral-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/80 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity -z-0" />
              
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Map className="w-5 h-5" />
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-indigo-950 transition-colors">
                  {track.title}
                </h3>
                <p className="text-sm text-neutral-500 font-medium line-clamp-2 leading-relaxed">
                  {track.description}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-100 group-hover:border-indigo-50 transition-colors">
                <button 
                  onClick={() => handleEditClick(track)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(track._id)} 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TrackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTrack}
        initialData={editingTrack}
      />
    </div>
  );
}
