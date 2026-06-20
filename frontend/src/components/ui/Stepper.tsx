import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full min-w-[200px] max-w-sm mt-2 mb-2 pb-1">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step Node */}
            <div className="relative flex flex-col items-center group shrink-0">
              <div
                className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold border-2 transition-colors z-10 ${
                  isActive
                    ? "bg-white border-indigo-600 text-indigo-600"
                    : isCompleted
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-neutral-200 text-neutral-400"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={`absolute top-6 whitespace-nowrap text-[9px] font-bold transition-colors ${
                  isActive
                    ? "text-indigo-600"
                    : isCompleted
                      ? "text-neutral-500"
                      : "text-neutral-400"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors rounded-full ${
                  isCompleted ? "bg-indigo-600" : "bg-neutral-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
