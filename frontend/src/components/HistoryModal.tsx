import { History } from "lucide-react";
import BaseModal from "./BaseModal";
import { TrackedProblem } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: TrackedProblem | null;
}

export default function HistoryModal({
  isOpen,
  onClose,
  problem,
}: HistoryModalProps) {
  if (!problem) return null;

  const count = problem.attemptCount;
  const history = problem.attemptHistory || [];

  const timeline = Array.from({ length: count }, (_, i) => {
    if (history[i] && history[i].date) {
      return history[i].date;
    }
    if (i === 0) return problem.createdAt;
    if (i === count - 1) return problem.lastAttemptedDate;
    return "Unknown Date";
  });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalId="history-modal"
      title="Attempt History"
      subtitle={problem.title}
      icon={<History className="w-4 h-4" />}
      maxWidthClass="max-w-2xl"
    >
      <div className="p-6 overflow-y-auto max-h-[60vh] md:max-h-none md:overflow-visible custom-scrollbar">
        <div className="relative flex flex-col md:flex-row justify-between w-full gap-8 md:gap-0 mt-4 mb-4">
          {/* Connecting line for mobile */}
          <div className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-indigo-200 md:hidden z-0"></div>
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[19px] left-10 right-10 h-[2px] bg-indigo-200 z-0"></div>

          {timeline.map((dateStr, index) => {
            const formattedDate =
              dateStr === "Unknown Date"
                ? dateStr
                : new Date(dateStr).toLocaleDateString();

            return (
              <div
                key={index}
                className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-3 flex-1 md:w-0"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center shadow-sm shrink-0">
                  <History className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex flex-col text-left md:text-center min-w-0">
                  <span className="text-xs font-bold text-neutral-800">
                    Attempt {index + 1}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium truncate">
                    {formattedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseModal>
  );
}
