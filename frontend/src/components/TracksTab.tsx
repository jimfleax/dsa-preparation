import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TrackCard from "./TrackCard";
import { TrackedProblem, Track } from "../types";
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
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import TracksSkeleton from "./skeletons/TracksSkeleton";

export default function TracksTab() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackedProblems, setTrackedProblems] = useState<
    Record<string, TrackedProblem>
  >({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [totalTrackCount, setTotalTrackCount] = useState<number>(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    localStorage.getItem("activeTrackId")
  );
  const [activePartIndex, setActivePartIndex] = useState<number | null>(
    localStorage.getItem("activePartIndex") ? parseInt(localStorage.getItem("activePartIndex")!) : null
  );
  const { getToken } = useAuth();

  const handleTrackActive = (id: string, partIndex?: number) => {
    localStorage.setItem("activeTrackId", id);
    setActiveTrackId(id);
    if (partIndex !== undefined) {
      localStorage.setItem("activePartIndex", partIndex.toString());
      setActivePartIndex(partIndex);
    } else {
      localStorage.removeItem("activePartIndex");
      setActivePartIndex(null);
    }
  };

  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    fetchTracksAndProgress(1);
  }, []);

  const fetchTracksAndProgress = async (pageNum: number = 1) => {
    if (pageNum > 1) {
      setIsFetchingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const token = await getToken();
      
      const tracksPromise = fetch(`${apiBase}/api/tracks?page=${pageNum}&limit=6`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let tracksRes;
      let progressRes;

      if (pageNum === 1) {
        // Fetch tracks and progress map together on initial load
        const progressPromise = fetch(`${apiBase}/api/tracker`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        [tracksRes, progressRes] = await Promise.all([tracksPromise, progressPromise]);
      } else {
        // Just fetch more tracks
        tracksRes = await tracksPromise;
      }

      const tracksData = await tracksRes.json();
      
      if (tracksData.success) {
        if (pageNum === 1) {
          setTracks(tracksData.tracks);
        } else {
          setTracks(prev => [...prev, ...tracksData.tracks]);
        }
        
        if (tracksData.pagination) {
          setTotalTrackCount(tracksData.pagination.total);
          setHasMore(pageNum < tracksData.pagination.pages);
        } else {
          setTotalTrackCount(tracksData.tracks.length);
          setHasMore(false);
        }
        setPage(pageNum);
      }

      if (pageNum === 1 && progressRes) {
        const progressData = await progressRes.json();
        if (progressData.success) {
          const progressMap: Record<string, TrackedProblem> = {};
          progressData.problems.forEach((p: TrackedProblem) => {
            if (p.titleSlug) {
              progressMap[p.titleSlug] = p;
            }
          });
          setTrackedProblems(progressMap);
        }
      }

      // Refresh active track from localStorage when data is updated
      const savedActiveId = localStorage.getItem("activeTrackId");
      if (savedActiveId !== activeTrackId) {
        setActiveTrackId(savedActiveId);
      }
      const savedActivePartIndexStr = localStorage.getItem("activePartIndex");
      const savedActivePartIndex = savedActivePartIndexStr ? parseInt(savedActivePartIndexStr) : null;
      if (savedActivePartIndex !== activePartIndex) {
        setActivePartIndex(savedActivePartIndex);
      }
    } catch (err) {
      console.error("Error fetching tracks", err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      if (!isFetchingMore && hasMore) {
        fetchTracksAndProgress(page + 1);
      }
    },
    hasMore,
    isLoading: loading || isFetchingMore,
  });

  if (loading && tracks.length === 0) {
    return <TracksSkeleton />;
  }

  // Calculate overall metrics
  let totalProblems = 0;
  let totalSolved = 0;

  tracks.forEach((track) => {
    const allProblems = [
      ...(track.problems || []),
      ...(track.parts?.flatMap((p) => p.problems) || []),
    ];

    allProblems.forEach((problem) => {
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
      const allProblems = [
        ...(track.problems || []),
        ...(track.parts?.flatMap((p) => p.problems) || []),
      ];

      let completedCount = 0;
      allProblems.forEach((problem) => {
        const slug = extractTitleSlug(problem.url);
        if (slug && trackedProblems[slug]) {
          completedCount++;
        }
      });
      const isCompleted =
        allProblems.length > 0 && completedCount === allProblems.length;
      
      const isActive = track._id === activeTrackId;
      if (isActive) {
        acc.isActiveCompleted = isCompleted;
      }

      // If active, it stays in the main list even if completed, so it shows at the top
      if (isCompleted && !isActive) {
        acc.completed.push(track);
      } else {
        acc.incomplete.push(track);
      }
      return acc;
    },
    { isActiveCompleted: false, incomplete: [] as Track[], completed: [] as Track[] },
  );

  const { isActiveCompleted, incomplete: incompleteTracks, completed: completedTracks } =
    categorizedTracks;

  const sortedIncompleteTracks = [...incompleteTracks].sort((a, b) => {
    if (a._id === activeTrackId) return -1;
    if (b._id === activeTrackId) return 1;
    return (a.order || 0) - (b.order || 0);
  });

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
              track problems, mastering{" "}
              <strong className="text-purple-600"><AnimatedNumber value={completedTracks.length + (isActiveCompleted ? 1 : 0)} /></strong> out of{" "}
              <strong className="text-neutral-800"><AnimatedNumber value={tracks.length} /></strong> tracks.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-wider">
                    Problems Solved
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700">
                    <AnimatedNumber value={totalSolved} />
                  </p>
                </div>
                <div className="w-px h-8 bg-emerald-200 mx-2"></div>
                <div>
                  <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-wider">
                    Tracks Mastered
                  </p>
                  <p className="text-xl font-extrabold text-emerald-700">
                    <AnimatedNumber value={completedTracks.length + (isActiveCompleted ? 1 : 0)} />
                  </p>
                </div>
              </div>
              <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-neutral-500/80 font-bold uppercase tracking-wider">
                    Problems Left
                  </p>
                  <p className="text-xl font-extrabold text-neutral-700">
                    <AnimatedNumber value={totalProblems - totalSolved} />
                  </p>
                </div>
                <div className="w-px h-8 bg-neutral-200 mx-2"></div>
                <div>
                  <p className="text-[10px] text-neutral-500/80 font-bold uppercase tracking-wider">
                    Tracks Left
                  </p>
                  <p className="text-xl font-extrabold text-neutral-700">
                    <AnimatedNumber value={incompleteTracks.length} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {sortedIncompleteTracks.map((track) => (
          <TrackCard
            key={track._id}
            track={track}
            isActive={track._id === activeTrackId}
            activeTrackId={activeTrackId}
            activePartIndex={activePartIndex}
            onTrackActive={handleTrackActive}
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

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4 flex justify-center items-center h-16">
          {isFetchingMore && (
            <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading more tracks...
            </div>
          )}
        </div>
      )}

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
                    activeTrackId={activeTrackId}
                    activePartIndex={activePartIndex}
                    onTrackActive={handleTrackActive}
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
