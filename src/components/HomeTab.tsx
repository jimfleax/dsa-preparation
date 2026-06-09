import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Code2,
  Map,
  Sparkles,
  MoveRight,
  Layers,
} from "lucide-react";
import { extractTitleSlug } from "../lib/slugUtils";

interface HomeTabProps {
  totalDocuments: number;
  onNavigate: (tab: "learn" | "tracker" | "tracks") => void;
}

export default function HomeTab({ totalDocuments, onNavigate }: HomeTabProps) {
  const [totalSolved, setTotalSolved] = useState<number | null>(null);
  const [trackProgress, setTrackProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [greeting, setGreeting] = useState<string>("Hello");
  const { getToken } = useAuth();

  const apiBase =
    (import.meta as any).env.VITE_API_URL ||
    "https://dsa-preparation-788547842951.asia-south1.run.app";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        // Fetch tracks and tracker in parallel
        const [trackerRes, tracksRes] = await Promise.all([
          fetch(`${apiBase}/api/tracker`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiBase}/api/tracks`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const trackerData = await trackerRes.json();
        const tracksData = await tracksRes.json();

        let solvedSlugs = new Set<string>();
        let solvedCount = 0;

        if (trackerData.success) {
          solvedCount = trackerData.problems.length;
          setTotalSolved(solvedCount);
          trackerData.problems.forEach((p: any) => {
            if (p.titleSlug) solvedSlugs.add(p.titleSlug);
          });
        }

        if (tracksData.success) {
          let totalTrackProblems = 0;
          let completedTrackProblems = 0;

          tracksData.tracks.forEach((track: any) => {
            track.problems.forEach((problem: any) => {
              totalTrackProblems++;
              const slug = extractTitleSlug(problem.url);
              if (slug && solvedSlugs.has(slug)) {
                completedTrackProblems++;
              }
            });
          });

          setTrackProgress({
            completed: completedTrackProblems,
            total: totalTrackProblems,
          });
        }
      } catch (error) {
        console.error("Failed to fetch home stats:", error);
      }
    };

    fetchStats();
  }, [getToken, apiBase]);

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-8">
      {/* Header Section */}
      <div className="max-w-2xl">
        <h1
          className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight leading-tight mb-4 drop-shadow-[0_5px_15px_rgba(139,92,246,0.4)]"
          style={{ fontFamily: "'SN Pro', sans-serif" }}
        >
          {greeting}
        </h1>
      </div>

      {/* Sleek Metrics Section */}
      <div className="mt-8 md:mt-12 w-full flex justify-end">
        <div
          className="text-right text-base md:text-lg font-light italic text-neutral-500 leading-relaxed tracking-wider"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          <p>
            we have a total of{" "}
            <span className="font-semibold text-indigo-500 not-italic mx-1">
              {totalDocuments}
            </span>{" "}
            learning resources
          </p>
          <p>
            you have solved{" "}
            <span className="font-semibold text-emerald-500 not-italic mx-1">
              {totalSolved !== null ? totalSolved : "..."}
            </span>{" "}
            problems so far
          </p>
          <p>
            progressed through{" "}
            <span className="font-semibold text-purple-500 not-italic mx-1">
              {trackProgress ? trackProgress.completed : "..."}
            </span>{" "}
            out of{" "}
            <span className="font-semibold text-rose-500 not-italic mx-1">
              {trackProgress ? trackProgress.total : "..."}
            </span>{" "}
            tracks
          </p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="mt-auto pt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <button
          onClick={() => onNavigate("learn")}
          className="group relative flex items-center p-5 bg-white border border-neutral-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 group-hover:text-indigo-700 transition-colors">
                  Study Theory
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Explore docs & guides
                </p>
              </div>
            </div>
            <MoveRight className="w-5 h-5 text-neutral-300 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("tracker")}
          className="group relative flex items-center p-5 bg-white border border-neutral-200 rounded-2xl hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                  Problem Tracker
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Log new solutions
                </p>
              </div>
            </div>
            <MoveRight className="w-5 h-5 text-neutral-300 group-hover:text-emerald-500 transition-colors group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate("tracks")}
          className="group relative flex items-center p-5 bg-white border border-neutral-200 rounded-2xl hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
                  Roadmap Tracks
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Follow curated paths
                </p>
              </div>
            </div>
            <MoveRight className="w-5 h-5 text-neutral-300 group-hover:text-purple-500 transition-colors group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
}
