import { useState, useEffect } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { TrackedProblem, Track, TrackProblem } from "../types";
import AttemptProblemModal from "./AttemptProblemModal";
import { extractTitleSlug } from "../lib/slugUtils";
import { AnimatedNumber } from "./AnimatedNumber";

interface TrackCardProps {
  track: Track;
  trackedProblems: Record<string, TrackedProblem>;
  onUpdate: () => void;
  activeTrackId?: string | null;
  activePartIndex?: number | null;
  onTrackActive?: (trackId: string, partIndex?: number) => void;
  isActive?: boolean;
}

export default function TrackCard({
  track,
  trackedProblems,
  onUpdate,
  activeTrackId,
  activePartIndex,
  onTrackActive,
  isActive,
}: TrackCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const getDefaultExpandedParts = () => {
    if (!track.parts || track.parts.length === 0) return {};
    const initial: Record<number, boolean> = {};
    const hasActivePart = track._id === activeTrackId && activePartIndex !== undefined && activePartIndex !== null;
    let firstIncompleteFound = false;

    track.parts.forEach((part, idx) => {
      initial[idx] = false;
    });

    if (hasActivePart && activePartIndex !== undefined && activePartIndex !== null) {
      const activePart = track.parts[activePartIndex];
      const partSolved = activePart.problems.filter((p) => {
        const slug = extractTitleSlug(p.url);
        return slug && !!trackedProblems[slug];
      }).length;
      const isPartCompleted = activePart.problems.length > 0 && partSolved === activePart.problems.length;
      
      if (!isPartCompleted) {
        initial[activePartIndex] = true;
        firstIncompleteFound = true;
      }
    }

    if (!firstIncompleteFound) {
      track.parts.forEach((part, idx) => {
        if (firstIncompleteFound) return;
        const partSolved = part.problems.filter((p) => {
          const slug = extractTitleSlug(p.url);
          return slug && !!trackedProblems[slug];
        }).length;
        const isPartCompleted = part.problems.length > 0 && partSolved === part.problems.length;
        if (!isPartCompleted) {
          initial[idx] = true;
          firstIncompleteFound = true;
        }
      });
    }

    return initial;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (track._id === activeTrackId) {
      setExpanded(true);
      if (activePartIndex !== undefined && activePartIndex !== null) {
        setExpandedParts(prev => {
          const next = getDefaultExpandedParts();
          
          // Check if it's the same to prevent unnecessary renders
          const isSame = Object.keys(prev).every(k => prev[Number(k)] === next[Number(k)]) && 
                         Object.keys(next).every(k => prev[Number(k)] === next[Number(k)]);
          return isSame ? prev : next;
        });
      }
    }
  }, [activeTrackId, track._id, activePartIndex]);

  const allProblems = [
    ...(track.problems || []),
    ...(track.parts?.flatMap((p) => p.problems) || []),
  ];
  const totalProblems = allProblems.length;
  const completedCount = allProblems.filter((p) => {
    const slug = extractTitleSlug(p.url);
    return slug && !!trackedProblems[slug];
  }).length;
  const progressPercent =
    Math.round((completedCount / totalProblems) * 100) || 0;
  const isCompleted =
    totalProblems > 0 && completedCount === totalProblems;

  const [expandedParts, setExpandedParts] = useState<Record<number, boolean>>(() => getDefaultExpandedParts());

  const togglePart = (idx: number) => {
    setExpandedParts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleProblemClick = (problem: any, partIndex?: number) => {
    setSelectedProblem(problem);
    setSelectedPartIndex(partIndex ?? null);
    setShowAttemptModal(true);
    setExpanded(true);
  };

  const renderProblem = (problem: TrackProblem, key: string | number, partIndex?: number) => {
    const slug = extractTitleSlug(problem.url);
    const tracked = slug ? trackedProblems[slug] : undefined;
    const isSolved = !!tracked;

    return (
      <div
        key={key}
        className="p-4 hover:bg-neutral-50 flex items-center justify-between cursor-pointer group transition-colors"
        onClick={() => handleProblemClick(problem, partIndex)}
      >
        <div className="flex items-center gap-4">
          {isSolved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-neutral-300 group-hover:text-indigo-400 transition-colors shrink-0" />
          )}
          <div>
            <p
              className={`text-sm font-bold ${isSolved ? "text-neutral-500 line-through decoration-neutral-300" : "text-neutral-800 group-hover:text-indigo-700 transition-colors"}`}
            >
              {problem.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  problem.difficulty === "Easy"
                    ? "bg-emerald-100 text-emerald-700"
                    : problem.difficulty === "Medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                }`}
              >
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
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      <div
        className={`p-5 cursor-pointer transition-colors flex justify-between items-center ${isCompleted ? "hover:bg-emerald-50/50" : "hover:bg-neutral-50"}`}
        onClick={() => {
          if (!expanded) {
            setExpandedParts(getDefaultExpandedParts());
          }
          setExpanded(!expanded);
        }}
      >
        <div className="flex-1 pr-6 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-neutral-900 truncate max-w-full">
              {track.title}
            </h3>
            {isActive && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                Current Track
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
          <p className={`text-sm text-neutral-500 mt-1 font-medium ${expanded ? "" : "line-clamp-2"}`}>
            {track.description}
          </p>
          <div className="mt-4 flex items-center gap-4">
            {track.parts && track.parts.length > 0 ? (
              <div className="flex-1 max-w-sm flex gap-1.5 h-2 bg-transparent rounded-full">
                {track.parts.map((part, idx) => {
                  const partSolved = part.problems.filter((p) => {
                    const slug = extractTitleSlug(p.url);
                    return slug && !!trackedProblems[slug];
                  }).length;
                  const partPercent = Math.round((partSolved / part.problems.length) * 100) || 0;
                  const isPartFull = partSolved === part.problems.length;
                  return (
                    <div key={idx} className="flex-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isPartFull ? "bg-emerald-500" : "bg-indigo-500"}`}
                        style={{ width: `${partPercent}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 max-w-sm h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            )}
            <span
              className={`text-xs font-bold ${isCompleted ? "text-emerald-600" : "text-neutral-600"}`}
            >
              <AnimatedNumber value={completedCount} /> / <AnimatedNumber value={totalProblems} /> (<AnimatedNumber value={progressPercent} />%)
            </span>
          </div>
        </div>
        <div
          className={`p-2 rounded-xl transition-all duration-300 ${isCompleted ? "text-emerald-500 bg-emerald-100" : "text-neutral-400 bg-neutral-100"}`}
        >
          <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <div className={`grid transition-all duration-500 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden border-t border-neutral-100">
          {track.parts && track.parts.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {track.problems && track.problems.length > 0 && (
                <div className="bg-neutral-50/30 divide-y divide-neutral-100">
                  {track.problems.map((problem, idx) => renderProblem(problem, `flat-${idx}`))}
                </div>
              )}
              {track.parts.map((part, pIdx) => {
                const partSolved = part.problems.filter((p) => {
                  const slug = extractTitleSlug(p.url);
                  return slug && !!trackedProblems[slug];
                }).length;
                const isPartCompleted = partSolved === part.problems.length;
                const isPartExpanded = expandedParts[pIdx];

                return (
                  <div key={pIdx} className="bg-white">
                    <div
                      className={`relative overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/50 transition-colors ${isPartExpanded ? 'border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                      onClick={() => togglePart(pIdx)}
                    >
                      {/* Subtle Progress Fill */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-500 ease-out ${isPartCompleted ? 'bg-emerald-50/60' : 'bg-neutral-100/70'}`}
                        style={{ width: `${Math.round((partSolved / part.problems.length) * 100) || 0}%` }}
                      />
                      <div className="relative z-10 flex items-center gap-3">
                        {isPartCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-300 shrink-0" />
                        )}
                        <div>
                          <h4 className={`text-sm font-bold ${isPartExpanded ? 'text-indigo-900' : 'text-neutral-800'}`}>{part.title}</h4>
                          {part.description && (
                            <p className="text-[11px] text-neutral-500 font-medium">{part.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-3">
                        <span className="text-[10px] font-bold text-neutral-500 bg-white/60 px-2 py-0.5 rounded-full border border-neutral-200 backdrop-blur-sm">
                          {partSolved} / {part.problems.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isPartExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className={`grid transition-all duration-300 ease-in-out ${isPartExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden bg-white divide-y divide-neutral-50">
                        {part.problems.map((problem, idx) => renderProblem(problem, `part-${pIdx}-prob-${idx}`, pIdx))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {track.problems.map((problem, idx) => renderProblem(problem, idx))}
            </div>
          )}
        </div>
      </div>

      {showAttemptModal && selectedProblem && (
        <AttemptProblemModal
          isOpen={showAttemptModal}
          onClose={() => {
            setShowAttemptModal(false);
            setSelectedProblem(null);
          }}
          problem={selectedProblem}
          trackedProblem={
            extractTitleSlug(selectedProblem.url)
              ? trackedProblems[extractTitleSlug(selectedProblem.url)!]
              : undefined
          }
          onUpdated={onUpdate}
          onSolveClick={() => onTrackActive?.(track._id, selectedPartIndex ?? undefined)}
        />
      )}
    </div>
  );
}
