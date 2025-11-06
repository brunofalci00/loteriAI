/**
 * Component: WelcomeGuideModal
 *
 * Modal de boas-vindas tipo onboarding para novos usuários
 * - Modal centrado com backdrop blur
 * - Ilustrações/ícones grandes para cada etapa
 * - Indicadores visuais de progresso (dots)
 * - Navegação simples: Anterior/Próximo/Pular
 * - Animações suaves entre etapas
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ListTodo,
  Grid3x3,
  BarChart3,
  Shuffle,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

interface WelcomeGuideModalProps {
  open: boolean;
  steps: GuideStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function WelcomeGuideModal({
  open,
  steps,
  onComplete,
  onSkip
}: WelcomeGuideModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent
        className="sm:max-w-[600px] p-0 gap-0 overflow-hidden"
        hideCloseButton
      >
        {/* Header com Progress Bar */}
        <div className="relative h-2 bg-muted">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Icon & Badge */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/20">
                {currentStep.icon}
              </div>
            </div>

            {currentStep.badge && (
              <Badge variant="secondary" className="text-xs">
                {currentStep.badge}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-3 text-center">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {currentStep.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-md mx-auto">
              {currentStep.description}
            </p>
          </div>

          {/* Step Indicators (Dots) */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStepIndex(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  index === currentStepIndex
                    ? "w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir para etapa ${index + 1}`}
              />
            ))}
          </div>

          {/* Step Counter */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              Etapa {currentStepIndex + 1} de {steps.length}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <Button
            onClick={handlePrev}
            variant="ghost"
            size="sm"
            disabled={isFirstStep}
            className="min-w-[80px]"
          >
            Anterior
          </Button>

          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Pular Tutorial
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className="min-w-[80px] gap-2"
          >
            {isLastStep ? (
              <>
                <Trophy className="h-4 w-4" />
                Começar
              </>
            ) : (
              "Próximo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
