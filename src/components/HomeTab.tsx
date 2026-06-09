import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Code2, Map, Sparkles, MoveRight, Layers } from "lucide-react";

interface HomeTabProps {
  totalDocuments: number;
  onNavigate: (tab: "learn" | "tracker" | "tracks") => void;
}

export default function HomeTab({ totalDocuments, onNavigate }: HomeTabProps) {
  const [totalSolved, setTotalSolved] = useState<number | null>(null);
  const [trackProgress, setTrackProgress] = useState<{ completed: number; total: number } | null>(null);
  const [greeting, setGreeting] = useState<string>("Hello");
  const { getToken, user } = useAuth();

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
          fetch(`${apiBase}/api/tracker`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiBase}/api/tracks`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const trackerData = await trackerRes.json();
        const tracksData = await tracksRes.json();

        let solvedUrls = new Set<string>();
        let solvedCount = 0;

        if (trackerData.success) {
          solvedCount = trackerData.problems.length;
          setTotalSolved(solvedCount);
          trackerData.problems.forEach((p: any) => solvedUrls.add(p.url));
        }

        if (tracksData.success) {
          let totalTrackProblems = 0;
          let completedTrackProblems = 0;
          
          tracksData.tracks.forEach((track: any) => {
            track.problems.forEach((problem: any) => {
              totalTrackProblems++;
              if (solvedUrls.has(problem.url)) {
                completedTrackProblems++;
              }
            });
          });

          setTrackProgress({
            completed: completedTrackProblems,
            total: totalTrackProblems
          });
        }
      } catch (error) {
        console.error("Failed to fetch home stats:", error);
      }
    };

    fetchStats();
  }, [getToken, apiBase]);

  return (
    <div className="relative overflow-hidden bg-white border border-neutral-100 rounded-3xl shadow-sm min-h-[500px] flex flex-col p-8 md:p-12">
      {/* Glassy, soft colorful backdrops */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/50 via-purple-100/40 to-emerald-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-sky-100/40 via-fuchsia-50/30 to-rose-50/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-60 pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header Section */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 backdrop-blur-md mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
              Dashboard Overview
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.username || "Learner"}</span>
          </h1>
          
          <p className="text-lg text-neutral-500 font-medium leading-relaxed max-w-xl">
            Welcome back to your central hub. Let's pick up where you left off and conquer your next algorithmic challenge today.
          </p>
        </div>

        {/* Sleek Metrics Section */}
        <div className="mt-12 md:mt-16 bg-white/40 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl">
          <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed font-medium">
            You currently have access to <strong className="text-indigo-600 font-bold">{totalDocuments}</strong> learning resources. 
            So far, you have mastered <strong className="text-emerald-600 font-bold">{totalSolved !== null ? totalSolved : "..."}</strong> coding problems, 
            and progressed through <strong className="text-purple-600 font-bold">{trackProgress ? trackProgress.completed : "..."}</strong> out of <strong className="text-neutral-900 font-bold">{trackProgress ? trackProgress.total : "..."}</strong> curated track milestones.
          </p>
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
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-indigo-700 transition-colors">Study Theory</h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Explore docs & guides</p>
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
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">Problem Tracker</h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Log new solutions</p>
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
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">Roadmap Tracks</h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">Follow curated paths</p>
                </div>
              </div>
              <MoveRight className="w-5 h-5 text-neutral-300 group-hover:text-purple-500 transition-colors group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
