import { motion } from "framer-motion";
import {
  GraduationCap,
  Map,
  ArrowRight,
  Github,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import PublicFooter from "./PublicFooter";

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start relative bg-[#F4F1FA] overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl bg-[#7C3AED]/10 -top-[10%] -left-[10%] animate-clay-float"></div>
        <div className="absolute h-[60vh] w-[60vh] rounded-full blur-3xl bg-[#DB2777]/10 -right-[10%] top-[20%] animate-clay-float-delayed"></div>
        <div className="absolute h-[50vh] w-[50vh] rounded-full blur-3xl bg-[#0EA5E9]/10 left-[20%] -bottom-[10%] animate-clay-float-slow"></div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-32 flex flex-col items-center justify-start relative z-10 gap-24">
        {/* Hero Section */}
        <section className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Text content */}
          <div className="flex-1 flex flex-col items-start text-left z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#332F3A] tracking-tight leading-[1.1] mb-6 font-nunito"
            >
              Master data structures <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#332F3A] via-[#7C3AED] to-[#DB2777]">
                & algorithms
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl font-medium text-[#635F69] mb-10 max-w-2xl leading-relaxed"
            >
              Track your problem-solving journey, organize study materials,
              follow structured roadmaps, and auto-sync your LeetCode progress —
              all in one unified, beautiful workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-8 h-14 sm:h-16 rounded-[20px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed active:scale-[0.92] hover:-translate-y-1 text-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 group font-nunito"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://github.com/jimfleax/dsa-preparation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 h-14 sm:h-16 rounded-[20px] bg-white text-[#332F3A] shadow-clay-button hover:shadow-clay-button-hover active:shadow-clay-pressed active:scale-[0.92] hover:-translate-y-1 text-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 font-nunito"
              >
                <Github className="w-6 h-6" />
                View Source
              </a>
            </motion.div>
          </div>

          {/* Right Hero Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center items-center w-full max-w-md lg:max-w-lg z-10"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clay-button animate-clay-breathe flex items-center justify-center">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent border border-white/30 backdrop-blur-sm"></div>
              <GraduationCap
                className="w-32 h-32 text-white relative z-10 drop-shadow-lg"
                strokeWidth={1.5}
              />

              {/* Floating decorative elements around the orb */}
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#DB2777] to-pink-600 shadow-clay-button animate-clay-float flex items-center justify-center">
                <CodeIcon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-emerald-600 shadow-clay-button animate-clay-float-delayed flex items-center justify-center">
                <TerminalIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="w-full flex flex-col gap-12 items-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#332F3A] mb-4 font-nunito">
              Everything you need to{" "}
              <span className="text-[#DB2777]">succeed</span>
            </h2>
            <p className="text-lg text-[#635F69] max-w-2xl mx-auto">
              Stop juggling spreadhseets and random bookmarks.
            </p>
          </motion.div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-min">
            {/* Feature 1: LeetCode Auto-Sync (Large Hero Card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 lg:row-span-2 relative overflow-hidden rounded-[40px] md:rounded-[48px] bg-white/70 p-8 md:p-12 text-[#332F3A] shadow-clay-card backdrop-blur-xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between min-h-[400px]"
            >
              <div className="relative z-10 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-blue-600 shadow-clay-button flex items-center justify-center mb-6">
                  <RefreshCcw className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold font-nunito mb-4">
                  LeetCode Auto-Sync
                </h3>
                <p className="text-lg text-[#635F69] leading-relaxed">
                  Seamlessly synchronize your solved problems directly from
                  LeetCode. Never manually log a completion again. Our system
                  fetches your recent submissions, updates your tracker, and
                  keeps everything perfectly in sync.
                </p>
              </div>

              {/* Abstract decorative element bottom right */}
              <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-br from-blue-100 to-[#7C3AED]/20 rounded-full blur-2xl opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="hidden md:flex absolute bottom-8 right-8 w-48 h-48 rounded-[32px] bg-white shadow-clay-card items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-500 group-hover:-translate-y-4">
                <RefreshCcw className="w-20 h-20 text-[#0EA5E9] animate-[spin_4s_linear_infinite]" />
              </div>
            </motion.div>

            {/* Feature 2: Curated Roadmaps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-[32px] bg-white/70 p-8 text-[#332F3A] shadow-clay-card backdrop-blur-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-amber-600 shadow-clay-button flex items-center justify-center mb-6">
                  <Map className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-nunito mb-3">
                  Curated Roadmaps
                </h3>
                <p className="text-base text-[#635F69] leading-relaxed">
                  Follow expertly designed tracks to master topics
                  progressively. Unlock new levels as you solve problems.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Smart Review Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden rounded-[32px] bg-white/70 p-8 text-[#332F3A] shadow-clay-card backdrop-blur-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-emerald-600 shadow-clay-button flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-nunito mb-3">
                  Smart Review
                </h3>
                <p className="text-base text-[#635F69] leading-relaxed">
                  Utilize spaced repetition for optimal review intervals. We
                  proactively remind you when a problem is due for review.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <div className="relative z-10 w-full mt-12 bg-[#F4F1FA] rounded-t-[48px] shadow-[0_-10px_40px_rgba(160,150,180,0.1)]">
        <PublicFooter />
      </div>
    </div>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function TerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}
