import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TourStep } from "@/hooks/useTourGuide";

interface TourGuideOverlayProps {
  isActive: boolean;
  currentStep: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function TourGuideOverlay({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  isLastStep,
  onNext,
  onPrev,
  onSkip
}: TourGuideOverlayProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Find target element
    const element = document.querySelector(currentStep.target) as HTMLElement;
    setTargetElement(element);

    if (element) {
      // Calculate position for tooltip
      const rect = element.getBoundingClientRect();
      const placement = currentStep.placement || 'bottom';

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top - 200;
          left = rect.left + rect.width / 2 - 200;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - 200;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 100;
          left = rect.left - 420;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 100;
          left = rect.right + 20;
          break;
        case 'center':
        default:
          top = window.innerHeight / 2 - 100;
          left = window.innerWidth / 2 - 200;
      }

      setTooltipPosition({ top, left });

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onSkip} />

      {/* Spotlight on target element */}
      {targetElement && currentStep.placement !== 'center' && (
        <div
          className="absolute border-4 border-primary rounded-lg pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className="absolute w-[400px] p-6 shadow-2xl z-10"
        style={{
          top: tooltipPosition.top,
          left: Math.max(20, Math.min(tooltipPosition.left, window.innerWidth - 420)),
        }}
      >
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Etapa {currentStepIndex + 1} de {totalSteps}
            </div>
            <h3 className="text-xl font-bold">{currentStep.title}</h3>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStep.content}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={onPrev}
              variant="outline"
              size="sm"
              disabled={currentStepIndex === 0}
            >
              Anterior
            </Button>

            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Pular Tutorial
            </Button>

            <Button
              onClick={onNext}
              size="sm"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
