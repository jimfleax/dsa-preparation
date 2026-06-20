import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  // Ensure we don't go out of bounds
  const activeIndex = Math.max(0, Math.min(currentStep - 1, steps.length - 1));
  const activeLabel = steps[activeIndex];

  return (
    <div className="flex flex-col gap-2.5 w-full mt-2 mb-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="text-xs font-extrabold text-indigo-600 tracking-tight">
          {activeLabel}
        </span>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Step {currentStep} of {steps.length}
        </span>
      </div>
      <div className="flex gap-1.5 w-full">
        {steps.map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                isActive
                  ? "bg-indigo-600 flex-[2]"
                  : isCompleted
                  ? "bg-indigo-200 flex-1"
                  : "bg-neutral-200 flex-1"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
