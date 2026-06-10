import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TrackCard from "./TrackCard";
import { TrackedProblem } from "../types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { ChevronDown, ChevronUp, CheckCircle, Loader2 } from "lucide-react";
import { extractTitleSlug } from "../lib/slugUtils";
import { AnimatedNumber } from "./AnimatedNumber";

export default function TracksTab() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [trackedProblems, setTrackedProblems] = useState<
    Record<string, TrackedProblem>
  >({});
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
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
        fetch(`${apiBase}/api/tracks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBase}/api/tracker`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tracksData = await tracksRes.json();
      const progressData = await progressRes.json();

      if (tracksData.success) {
        setTracks(tracksData.tracks);
      }

      if (progressData.success) {
        const progressMap: Record<string, TrackedProblem> = {};
        progressData.problems.forEach((p: TrackedProblem) => {
          if (p.titleSlug) {
            progressMap[p.titleSlug] = p;
          }
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
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Calculate overall metrics
  let totalProblems = 0;
  let totalSolved = 0;

  tracks.forEach((track) => {
    track.problems.forEach((problem: any) => {
      totalProblems++;
      const slug = extractTitleSlug(problem.url);
      if (slug && trackedProblems[slug]) {
        totalSolved++;
      }
    });
  });

  const chartData = [
    { name: "Solved", value: totalSolved, color: "#10b981" },
    {
      name: "Remaining",
      value: Math.max(0, totalProblems - totalSolved),
      color: "#e5e7eb",
    },
  ].filter((d) => d.value > 0);

  // Categorize tracks into incomplete and completed
  const categorizedTracks = tracks.reduce(
    (acc, track) => {
      let completedCount = 0;
      track.problems.forEach((problem: any) => {
        const slug = extractTitleSlug(problem.url);
        if (slug && trackedProblems[slug]) {
          completedCount++;
        }
      });
      const isCompleted =
        track.problems.length > 0 && completedCount === track.problems.length;
      if (isCompleted) {
        acc.completed.push(track);
      } else {
        acc.incomplete.push(track);
      }
      return acc;
    },
    { incomplete: [] as any[], completed: [] as any[] },
  );

  const { incomplete: incompleteTracks, completed: completedTracks } =
    categorizedTracks;

  return (
    <div className="space-y-6">
      {totalProblems > 0 && (
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="h-48 w-full md:w-[280px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  style={{ outline: "none" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ outline: "none" }}
                      className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => [`${value} problems`, "Count"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    padding: "6px 10px",
                  }}
                  itemStyle={{ color: "#1f2937", fontWeight: 600, padding: 0 }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-neutral-800">
              Overall Progress
            </h3>
            <p className="text-neutral-500 text-sm mt-1">
              You have completed{" "}
              <strong className="text-emerald-600"><AnimatedNumber value={totalSolved} /></strong> out of{" "}
              <strong className="text-neutral-800"><AnimatedNumber value={totalProblems} /></strong>{" "}
              track problems.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                  Solved
                </p>
                <p className="text-xl font-extrabold text-emerald-700">
                  <AnimatedNumber value={totalSolved} />
                </p>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  Remaining
                </p>
                <p className="text-xl font-extrabold text-neutral-700">
                  <AnimatedNumber value={totalProblems - totalSolved} />
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {incompleteTracks.map((track) => (
          <TrackCard
            key={track._id}
            track={track}
            trackedProblems={trackedProblems}
            onUpdate={fetchTracksAndProgress}
          />
        ))}
        {incompleteTracks.length === 0 && completedTracks.length === 0 && (
          <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl">
            <p className="text-neutral-500 font-medium">
              No roadmap tracks available.
            </p>
          </div>
        )}
      </div>

      {completedTracks.length > 0 && (
        <div className="mt-12 bg-emerald-50/50 border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
          <div
            className="p-5 cursor-pointer hover:bg-emerald-50 transition-colors flex justify-between items-center"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-lg font-bold text-emerald-900">
                  Completed Tracks
                </h3>
                <p className="text-sm text-emerald-600/80 mt-0.5 font-medium">
                  <AnimatedNumber value={completedTracks.length} />{" "}
                  {completedTracks.length === 1 ? "track" : "tracks"} fully
                  mastered
                </p>
              </div>
            </div>
            <div className="text-emerald-500 bg-emerald-100 p-2 rounded-xl">
              {showCompleted ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {showCompleted && (
            <div className="border-t border-emerald-100 p-6 pt-2">
              <div className="grid gap-6 mt-4 opacity-80 hover:opacity-100 transition-opacity duration-300">
                {completedTracks.map((track) => (
                  <TrackCard
                    key={track._id}
                    track={track}
                    trackedProblems={trackedProblems}
                    onUpdate={fetchTracksAndProgress}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
