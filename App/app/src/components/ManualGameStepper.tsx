import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepNumber } from "@/hooks/useManualGameCreation";

interface ManualGameStepperProps {
  currentStep: StepNumber;
  onStepClick: (step: StepNumber) => void;
}

const steps = [
  { number: 1 as StepNumber, label: "Loteria" },
  { number: 2 as StepNumber, label: "Concurso" },
  { number: 3 as StepNumber, label: "Números" },
  { number: 4 as StepNumber, label: "Análise" },
];

export function ManualGameStepper({ currentStep, onStepClick }: ManualGameStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-4 sm:px-0">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = step.number <= currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle and Label Container */}
              <div className="flex flex-col items-center relative">
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-all",
                    "border-2",
                    isCompleted && "bg-green-500 border-green-500 text-white",
                    isCurrent && "bg-primary border-primary text-primary-foreground",
                    !isCompleted && !isCurrent && "bg-muted border-muted-foreground/30 text-muted-foreground",
                    isClickable && "cursor-pointer hover:scale-110",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="text-sm sm:text-base">{step.number}</span>
                  )}
                </button>

                {/* Step Label */}
                <span
                  className={cn(
                    "mt-2 text-xs sm:text-sm font-medium text-center",
                    isCurrent && "text-foreground",
                    isCompleted && "text-green-600",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line - Centralizado com o círculo */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 sm:mx-2 self-start mt-5 sm:mt-6">
                  <div
                    className={cn(
                      "h-full transition-all",
                      step.number < currentStep ? "bg-green-500" : "bg-muted"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
