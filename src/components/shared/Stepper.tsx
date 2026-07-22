import { CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex w-full items-start">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = stepNumber === steps.length;

        return (
          <div key={label} className={clsx("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCompleted &&
                    "border-primary bg-primary text-white",
                  isActive &&
                    "border-primary bg-primary/10 text-primary",
                  !isCompleted &&
                    !isActive &&
                    "dark:border-dark-450 border-gray-300 bg-transparent text-gray-400",
                )}
              >
                {isCompleted ? <CheckIcon className="size-5" /> : stepNumber}
              </div>
              <span
                className={clsx(
                  "mt-2 max-w-[90px] text-center text-xs font-medium",
                  (isActive || isCompleted)
                    ? "text-primary"
                    : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={clsx(
                  "mx-2 mt-[-20px] h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "dark:bg-dark-450 bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}