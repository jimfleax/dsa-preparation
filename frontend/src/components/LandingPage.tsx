import { motion } from "framer-motion";
import { LogIn, GraduationCap, Code2, Map, BookOpen, ArrowRight, Github, CodeSquare } from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 p-3 bg-white/50 backdrop-blur-sm border border-neutral-200 rounded-2xl shadow-sm inline-flex items-center justify-center text-indigo-600"
        >
          <GraduationCap className="w-10 h-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-neutral-900 tracking-tight leading-tight max-w-4xl mb-6"
        >
          Master Data Structures <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            & Algorithms
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-neutral-500 mb-10 max-w-2xl leading-relaxed"
        >
          Track your problem-solving journey, organize study materials, follow structured roadmaps, and auto-sync your LeetCode progress — all in one unified workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onSignIn}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xl shadow-indigo-200 w-full sm:w-auto group"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-base font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
          >
            <Github className="w-5 h-5" />
            View Source
          </a>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <FeatureCard 
            icon={<CodeSquare className="w-6 h-6 text-indigo-600" />}
            title="LeetCode Auto-Sync"
            description="Seamlessly synchronize your solved problems directly from LeetCode. Never manually log a completion again."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Map className="w-6 h-6 text-blue-600" />}
            title="Curated Roadmaps"
            description="Follow expertly designed tracks and subtracks to master DSA topics progressively and efficiently."
            delay={0.2}
          />
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            title="Interactive Notes"
            description="Write, organize, and search your study materials using a powerful Markdown editor with syntax highlighting."
            delay={0.3}
          />
        </motion.div>
      </section>

      {/* Footer minimal */}
      <footer className="w-full mt-auto py-8 text-center text-sm text-neutral-400 border-t border-neutral-100 z-10 relative">
        <p>© {new Date().getFullYear()} DSA Preparation. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-neutral-100 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 flex flex-col items-start text-left"
    >
      <div className="p-3 bg-neutral-50 rounded-xl mb-5 border border-neutral-100">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-500 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}
