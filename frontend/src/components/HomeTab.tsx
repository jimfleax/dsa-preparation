import { getBackendUrl } from "@/src/lib/envUtils";
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
import { AnimatedNumber } from "./AnimatedNumber";
import { Card } from "./ui/Card";
import { TrackedProblem } from "../types";
import { CalendarClock, X } from "lucide-react";

import { apiFetch } from "@/src/lib/apiFetch";

interface HomeTabProps {
  totalDocuments: number;
  onNavigate: (tab: "learn" | "tracker" | "tracks") => void;
  refreshKey?: number;
}

export default function HomeTab({
  totalDocuments,
  onNavigate,
  refreshKey,
}: HomeTabProps) {
  const [totalSolved, setTotalSolved] = useState<number | null>(null);
  const [trackProgress, setTrackProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [greeting, setGreeting] = useState<string>("Hello");
  const [dueProblems, setDueProblems] = useState<TrackedProblem[]>([]);
  const { getToken } = useAuth();

  const apiBase = getBackendUrl();

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
        // Fetch metrics and due problems in parallel
        const [dueRes, trackerMetricsRes, trackMetricsRes] = await Promise.all([
          apiFetch(`${apiBase}/api/tracker/due`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch(`${apiBase}/api/tracker/metrics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          apiFetch(`${apiBase}/api/tracks/metrics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const dueData = await dueRes.json();
        const trackerMetricsData = await trackerMetricsRes.json();
        const trackMetricsData = await trackMetricsRes.json();

        if (dueData.success) {
          setDueProblems(dueData.problems);
        }

        if (trackerMetricsData.success) {
          setTotalSolved(trackerMetricsData.metrics.totalSolved);
        }

        if (trackMetricsData.success) {
          setTrackProgress({
            completed: trackMetricsData.metrics.masteredTracks,
            total: trackMetricsData.metrics.totalTracks,
          });
        }
      } catch (error) {
        console.error("Failed to fetch home stats:", error);
      }
    };

    fetchStats();
  }, [getToken, apiBase, refreshKey]);

  return (
    <div className="flex flex-col flex-1 min-h-[500px] pt-8">
      {/* Header Section */}
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight leading-tight mb-4 drop-shadow-md font-nunito">
          {greeting}
        </h1>

        {dueProblems.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openReviewModal"))
              }
              className="flex flex-col items-start px-5 py-3 bg-white/70 backdrop-blur-xl shadow-clay-card border-2 border-white/60 hover:-translate-y-1 hover:shadow-clay-surface active:scale-[0.98] active:shadow-clay-pressed rounded-[24px] transition-all duration-300 text-left max-w-sm"
            >
              <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                <CalendarClock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Scheduled for review today
                </span>
              </div>
              <span className="text-sm font-semibold text-neutral-800 line-clamp-1 w-full">
                {dueProblems.length === 1
                  ? dueProblems[0].title
                  : "You have multiple problems to review"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Sleek Metrics Section */}
      <div className="mt-8 md:mt-12 w-full flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6">
        {/* Metric 1: Learning Resources */}
        <div className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/70 backdrop-blur-xl shadow-clay-card border-2 border-white/60 hover:-translate-y-1 hover:shadow-clay-surface transition-all duration-300">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-500 font-nunito tracking-tight">
            <AnimatedNumber value={totalDocuments} />
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[#635F69] uppercase tracking-wider mt-1 text-center leading-tight">
            Resources
          </span>
        </div>

        {/* Metric 2: Solved Problems */}
        <div className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/70 backdrop-blur-xl shadow-clay-card border-2 border-white/60 hover:-translate-y-1 hover:shadow-clay-surface transition-all duration-300">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 font-nunito tracking-tight">
            <AnimatedNumber value={totalSolved} />
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[#635F69] uppercase tracking-wider mt-1 text-center leading-tight">
            Solved
          </span>
        </div>

        {/* Metric 3: Tracks Progress */}
        <div className="flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/70 backdrop-blur-xl shadow-clay-card border-2 border-white/60 hover:-translate-y-1 hover:shadow-clay-surface transition-all duration-300">
          <span className="text-xl sm:text-2xl font-extrabold text-purple-500 font-nunito tracking-tight flex items-baseline">
            <AnimatedNumber value={trackProgress ? trackProgress.completed : null} />
            <span className="text-rose-400 text-sm sm:text-base mx-0.5">/</span>
            <span className="text-rose-500 text-lg sm:text-xl">
              <AnimatedNumber value={trackProgress ? trackProgress.total : null} />
            </span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-[#635F69] uppercase tracking-wider mt-1 text-center leading-tight">
            Track Progress
          </span>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="mt-auto pt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card
          as="button"
          onClick={() => onNavigate("learn")}
          padding="md"
          interactive
          hoverEffect="glow"
          hoverColor="indigo"
          gradientBackground
          className="group relative flex items-center overflow-hidden w-full text-left"
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-indigo-700 transition-colors">
                  Study Theory
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 font-medium mt-0.5">
                  Explore docs & guides
                </p>
              </div>
            </div>
            <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1" />
          </div>
        </Card>

        <Card
          as="button"
          onClick={() => onNavigate("tracker")}
          padding="md"
          interactive
          hoverEffect="glow"
          hoverColor="emerald"
          gradientBackground
          className="group relative flex items-center overflow-hidden w-full text-left"
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                  Problem Tracker
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 font-medium mt-0.5">
                  Log new solutions
                </p>
              </div>
            </div>
            <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 group-hover:text-emerald-500 transition-colors group-hover:translate-x-1" />
          </div>
        </Card>

        <Card
          as="button"
          onClick={() => onNavigate("tracks")}
          padding="md"
          interactive
          hoverEffect="glow"
          hoverColor="purple"
          gradientBackground
          className="group relative flex items-center overflow-hidden w-full text-left"
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Map className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
                  Roadmap Tracks
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 font-medium mt-0.5">
                  Follow curated paths
                </p>
              </div>
            </div>
            <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300 group-hover:text-purple-500 transition-colors group-hover:translate-x-1" />
          </div>
        </Card>
      </div>
    </div>
  );
}
