import { BookOpen, Layers, Terminal } from "lucide-react";
import { DocumentMetadata } from "../types";

interface StatsGridProps {
  documents: DocumentMetadata[];
}

export default function StatsGrid({ documents }: StatsGridProps) {
  const theoryCount = documents.filter(d => d.type === 'theory').length;
  const problemsheetsCount = documents.filter(d => d.type === 'problemsheets').length;

  return (
    <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div id="stat-theory" className="bg-white border border-indigo-100/20 p-4 rounded-2xl shadow-3xs flex items-center gap-4 hover:border-indigo-100 transition-colors">
        <div id="icon-theory" className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 animate-pulse-subtle">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <p id="label-theory" className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Theory Modules</p>
          <p id="val-theory" className="text-2xl font-extrabold text-neutral-850">{theoryCount}</p>
        </div>
      </div>

      <div id="stat-problemsheets" className="bg-white border border-indigo-100/20 p-4 rounded-2xl shadow-3xs flex items-center gap-4 hover:border-indigo-100 transition-colors">
        <div id="icon-problemsheets" className="bg-indigo-50 p-2.5 rounded-xl text-indigo-700">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <p id="label-problemsheets" className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Problem Sheets</p>
          <p id="val-problemsheets" className="text-2xl font-extrabold text-neutral-850">{problemsheetsCount}</p>
        </div>
      </div>

      <div id="stat-categories" className="bg-white border border-indigo-100/20 p-4 rounded-2xl shadow-3xs flex items-center gap-4 hover:border-indigo-100 transition-colors">
        <div id="icon-categories" className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p id="label-categories" className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Categories</p>
          <p id="val-categories" className="text-2xl font-extrabold text-neutral-850">
            {new Set(documents.map(d => d.category)).size}
          </p>
        </div>
      </div>
    </div>
  );
}
