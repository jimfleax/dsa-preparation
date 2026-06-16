import { BookOpen, Layers, Terminal } from "lucide-react";
import { DocumentMetadata } from "../types";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatsGridProps {
  documents: DocumentMetadata[];
}

export default function StatsGrid({ documents }: StatsGridProps) {
  const theoryCount = documents.length;
  const uniqueTagsCount = new Set(documents.flatMap((d) => d.tags)).size;

  return (
    <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div
        id="stat-theory"
        className="bg-white border border-indigo-100/20 p-4 rounded-2xl shadow-3xs flex items-center gap-4 hover:border-indigo-100 transition-colors"
      >
        <div
          id="icon-theory"
          className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 animate-pulse-subtle"
        >
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p
            id="label-theory"
            className="text-xs text-neutral-400 font-semibold uppercase tracking-wider"
          >
            Theory Modules
          </p>
          <p
            id="val-theory"
            className="text-2xl font-extrabold text-neutral-850"
          >
            <AnimatedNumber value={theoryCount} />
          </p>
        </div>
      </div>

      <div
        id="stat-tags"
        className="bg-white border border-indigo-100/20 p-4 rounded-2xl shadow-3xs flex items-center gap-4 hover:border-indigo-100 transition-colors"
      >
        <div
          id="icon-tags"
          className="bg-indigo-50 p-2.5 rounded-xl text-indigo-700"
        >
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p
            id="label-tags"
            className="text-xs text-neutral-400 font-semibold uppercase tracking-wider"
          >
            Unique Tags
          </p>
          <p
            id="val-tags"
            className="text-2xl font-extrabold text-neutral-850"
          >
            <AnimatedNumber value={uniqueTagsCount} />
          </p>
        </div>
      </div>
    </div>
  );
}
