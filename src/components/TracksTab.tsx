import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TrackCard from "./TrackCard";
import { TrackedProblem } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function TracksTab() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [trackedProblems, setTrackedProblems] = useState<Record<string, TrackedProblem>>({});
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  
  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    fetchTracksAndProgress();
  }, []);

  const fetchTracksAndProgress = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [tracksRes, progressRes] = await Promise.all([
        fetch(`${apiBase}/api/tracks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiBase}/api/tracker`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const tracksData = await tracksRes.json();
      const progressData = await progressRes.json();
      
      if (tracksData.success) {
        setTracks(tracksData.tracks);
      }
      
      if (progressData.success) {
        const progressMap: Record<string, TrackedProblem> = {};
        progressData.problems.forEach((p: TrackedProblem) => {
          progressMap[p.url] = p;
        });
        setTrackedProblems(progressMap);
      }
    } catch (err) {
      console.error("Error fetching tracks", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-neutral-500 font-medium">Loading tracks...</div>;
  }

  // Calculate overall metrics
  let totalProblems = 0;
  let totalSolved = 0;

  tracks.forEach(track => {
    track.problems.forEach((problem: any) => {
      totalProblems++;
      if (trackedProblems[problem.url]) {
        totalSolved++;
      }
    });
  });

  const chartData = [
    { name: "Solved", value: totalSolved },
    { name: "Remaining", value: Math.max(0, totalProblems - totalSolved) }
  ];

  const COLORS = ["#10b981", "#e5e7eb"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Roadmap Tracks</h2>
          <p className="text-sm text-neutral-500 mt-1 font-medium">
            Follow curated paths to master data structures and algorithms.
          </p>
        </div>
      </div>

      {totalProblems > 0 && (
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="h-48 w-full max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} problems`, "Count"]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-neutral-800">Overall Progress</h3>
            <p className="text-neutral-500 text-sm mt-1">
              You have completed <strong className="text-emerald-600">{totalSolved}</strong> out of <strong className="text-neutral-800">{totalProblems}</strong> track problems.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Solved</p>
                <p className="text-xl font-extrabold text-emerald-700">{totalSolved}</p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Remaining</p>
                <p className="text-xl font-extrabold text-neutral-700">{totalProblems - totalSolved}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-6">
        {tracks.map((track) => (
          <TrackCard 
            key={track._id} 
            track={track} 
            trackedProblems={trackedProblems}
            onUpdate={fetchTracksAndProgress} 
          />
        ))}
        {tracks.length === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl">
            <p className="text-neutral-500 font-medium">No roadmap tracks available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
