import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Database, Brain, Sparkles } from "lucide-react";

const steps = [
  { icon: Database, text: "Buscando últimos concursos da Caixa...", duration: 2000 },
  { icon: Brain, text: "Calculando frequências e padrões estatísticos...", duration: 2500 },
  { icon: TrendingUp, text: "Analisando tendências históricas...", duration: 1500 },
  { icon: Sparkles, text: "Gerando combinações inteligentes...", duration: 2000 },
];

interface LoadingAnalysisProps {
  onComplete: () => void;
  isAnalyzing?: boolean;
}

export const LoadingAnalysis = ({ onComplete, isAnalyzing = false }: LoadingAnalysisProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Se a análise já foi concluída (isAnalyzing = false), completar imediatamente
    if (!isAnalyzing && currentStep === steps.length - 1) {
      onComplete();
      return;
    }

    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    } else if (!isAnalyzing) {
      // Só completar quando a análise real terminou
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete, isAnalyzing]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-12">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-slow rounded-full gradient-primary opacity-20 blur-3xl" />
        <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
      </div>

      <div className="space-y-6 text-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 transition-all duration-500 ${
                isActive ? "scale-110 opacity-100" : isCompleted ? "opacity-50" : "opacity-30"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isActive ? "gradient-primary shadow-glow" : "bg-secondary"
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-lg font-medium">{step.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="h-2 w-64 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full gradient-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
