import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { TrackedProblem } from "../types";
import AttemptProblemModal from "./AttemptProblemModal";

interface TrackCardProps {
  track: any;
  trackedProblems: Record<string, TrackedProblem>;
  onUpdate: () => void;
}

export default function TrackCard({ track, trackedProblems, onUpdate }: TrackCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const completedCount = track.problems.filter((p: any) => !!trackedProblems[p.url]).length;
  const progressPercent = Math.round((completedCount / track.problems.length) * 100) || 0;

  const handleProblemClick = (problem: any) => {
    setSelectedProblem(problem);
    setShowAttemptModal(true);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      <div 
        className="p-5 cursor-pointer hover:bg-neutral-50 transition-colors flex justify-between items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 pr-6">
          <h3 className="text-lg font-bold text-neutral-900">{track.title}</h3>
          <p className="text-sm text-neutral-500 mt-1 font-medium">{track.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 max-w-sm h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-neutral-600">
              {completedCount} / {track.problems.length} ({progressPercent}%)
            </span>
          </div>
        </div>
        <div className="text-neutral-400 bg-neutral-100 p-2 rounded-xl">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100">
          <div className="divide-y divide-neutral-100 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200">
            {track.problems.map((problem: any, idx: number) => {
              const tracked = trackedProblems[problem.url];
              const isSolved = !!tracked;
              
              return (
                <div 
                  key={idx} 
                  className="p-4 hover:bg-neutral-50 flex items-center justify-between cursor-pointer group transition-colors"
                  onClick={() => handleProblemClick(problem)}
                >
                  <div className="flex items-center gap-4">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-bold ${isSolved ? 'text-neutral-500 line-through decoration-neutral-300' : 'text-neutral-800 group-hover:text-indigo-700 transition-colors'}`}>
                        {problem.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {problem.difficulty}
                        </span>
                        {tracked && (
                          <span className="text-[10px] text-neutral-400 font-bold bg-neutral-100 px-1.5 py-0.5 rounded">
                            Attempts: {tracked.attemptCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAttemptModal && selectedProblem && (
        <AttemptProblemModal 
          isOpen={showAttemptModal}
          onClose={() => {
            setShowAttemptModal(false);
            setSelectedProblem(null);
          }}
          problem={selectedProblem}
          trackedProblem={trackedProblems[selectedProblem.url]}
          onUpdated={onUpdate}
        />
      )}
    </div>
  );
}
