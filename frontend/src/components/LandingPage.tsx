import { motion } from "framer-motion";
import {
  GraduationCap,
  Map,
  ArrowRight,
  Github,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start relative bg-[#fafafa]">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-mask opacity-60"></div>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-32 flex flex-col md:flex-row items-center justify-between relative z-10 gap-12">
        {/* Left Text content */}
        <div className="flex-1 flex flex-col items-start text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-[5rem] font-medium text-neutral-900 tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <span className="italic">Master data structures</span> <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 italic">
              & algorithms
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg font-light text-neutral-500 mb-10 max-w-xl leading-relaxed"
          >
            Track your problem-solving journey, organize study materials, follow
            structured roadmaps, and auto-sync your LeetCode progress — all in one
            unified workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onSignIn}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xl shadow-indigo-200 w-full sm:w-auto group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://github.com/jimfleax/dsa-preparation"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-base font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <Github className="w-5 h-5" />
              View Source
            </a>
          </motion.div>
        </div>

        {/* Right Icon illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 flex justify-center items-center relative w-full max-w-md"
        >
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[80px] translate-x-10 translate-y-10 -z-10"></div>
          <GraduationCap
            className="w-64 h-64 md:w-80 md:h-80 text-indigo-500/80 drop-shadow-lg"
            strokeWidth={1}
          />
        </motion.div>
      </section>

      {/* Feature Sections (Full Width) */}
      <section className="w-full bg-white relative z-10 border-t border-neutral-100/50">
        <FeatureSection
          title="LeetCode Auto-Sync"
          description="Seamlessly synchronize your solved problems directly from LeetCode. Never manually log a completion again. Our system fetches your recent submissions, updates your tracker, and keeps everything perfectly in sync."
          illustration={
            <div className="relative w-full max-w-sm aspect-video sm:aspect-square bg-[#0f172a] rounded-3xl border border-neutral-800 flex flex-col overflow-hidden shadow-2xl">
              {/* Fake Mac Header */}
              <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              {/* Code Area */}
              <div className="p-6 flex flex-col gap-4 relative flex-1">
                <div className="w-3/4 h-3 bg-neutral-700/50 rounded-full"></div>
                <div className="w-1/2 h-3 bg-indigo-500/50 rounded-full ml-4"></div>
                <div className="w-5/6 h-3 bg-neutral-700/50 rounded-full ml-4"></div>
                <div className="w-2/3 h-3 bg-neutral-700/50 rounded-full ml-4"></div>
                <div className="w-1/3 h-3 bg-neutral-700/50 rounded-full"></div>
                {/* Glowing Sync Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-indigo-500/20 to-transparent">
                  <div className="bg-indigo-500/20 p-5 rounded-2xl backdrop-blur-md border border-indigo-500/30 shadow-2xl">
                    <RefreshCcw className="w-10 h-10 text-indigo-300 animate-[spin_3s_linear_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          }
          reversed={false}
        />

        <FeatureSection
          title="Curated Roadmaps"
          description="Follow expertly designed tracks and subtracks to master DSA topics progressively and efficiently. Unlock new levels as you solve problems, track your completion percentage, and never wonder what to learn next."
          illustration={
            <div className="relative w-full max-w-sm aspect-video sm:aspect-square bg-white rounded-3xl border border-neutral-200 flex items-center justify-center overflow-hidden shadow-xl shadow-blue-900/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 to-transparent"></div>
              {/* Roadmap nodes */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                 <div className="w-full flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -z-10"></div>
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-100 shadow-sm flex items-center justify-center z-10">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-indigo-600 border-4 border-indigo-100 shadow-md flex items-center justify-center z-10 scale-110">
                      <Map className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white border-4 border-neutral-100 shadow-sm flex items-center justify-center z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-300"></div>
                    </div>
                 </div>
              </div>
            </div>
          }
          reversed={true}
          bgColor="bg-neutral-50/50"
        />

        <FeatureSection
          title="Smart Review Tracker"
          description="Log your attempts, utilize spaced repetition for optimal review intervals, and attach detailed notes to every problem. Our system will proactively remind you when a problem is due for review so you never forget what you've learned."
          illustration={
            <div className="relative w-full max-w-sm aspect-video sm:aspect-square bg-white rounded-3xl border border-neutral-200 flex flex-col overflow-hidden shadow-xl shadow-purple-900/5 p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent pointer-events-none"></div>
              <div className="relative z-10 w-full flex-1 flex flex-col gap-6">
                 <div className="flex justify-between items-end mb-2">
                   <div className="w-1/3 h-4 bg-neutral-200 rounded-full"></div>
                   <div className="w-1/4 h-3 bg-purple-200 rounded-full"></div>
                 </div>
                 {/* Bar Chart representation */}
                 <div className="flex-1 flex items-end justify-between gap-3 h-full">
                   {[40, 70, 45, 90, 65, 80].map((h, i) => (
                     <div key={i} className="w-full bg-purple-50 rounded-t-lg relative group overflow-hidden" style={{ height: `${h}%` }}>
                       <div className="absolute bottom-0 w-full bg-purple-500 rounded-t-lg" style={{ height: `${h - 20}%` }}></div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          }
          reversed={false}
        />
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto py-8 bg-white border-t border-neutral-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>&copy; 2026 DSA Preparation. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="/privacy-policy.html"
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service.html"
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureSection({
  title,
  description,
  illustration,
  reversed,
  bgColor = "bg-white",
}: {
  title: string;
  description: string;
  illustration: React.ReactNode;
  reversed: boolean;
  bgColor?: string;
}) {
  return (
    <div className={`w-full py-24 border-b border-neutral-100/50 ${bgColor}`}>
      <div
        className={`max-w-6xl mx-auto px-6 flex flex-col gap-12 items-center ${
          reversed ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center md:text-left"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-base font-light text-neutral-500 leading-relaxed max-w-xl mx-auto md:mx-0">
            {description}
          </p>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex justify-center items-center w-full"
        >
          {illustration}
        </motion.div>
      </div>
    </div>
  );
}
