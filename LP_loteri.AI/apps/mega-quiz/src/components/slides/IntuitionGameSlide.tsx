import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackPixelEvent } from "@/lib/analytics";
import { megaQuizConfig } from "@/config/mega";

interface IntuitionGameSlideProps {
  onNext: () => void;
  onComplete?: (selection: number[]) => void;
}

const { manualMaxNumbers: MAX_NUMBERS, totalNumbers: TOTAL_NUMBERS } = megaQuizConfig;

export const IntuitionGameSlide = ({ onNext, onComplete }: IntuitionGameSlideProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [analysisState, setAnalysisState] = useState<"idle" | "analyzing" | "ready">("idle");
  const [submitting, setSubmitting] = useState(false);
  const selectSoundRef = useRef<HTMLAudioElement | null>(null);

  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);

  useEffect(() => {
    selectSoundRef.current = new Audio("/sounds/select-number.mp3");
    return () => {
      selectSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (selectedNumbers.length === MAX_NUMBERS) {
      setAnalysisState("analyzing");
      const timer = window.setTimeout(() => setAnalysisState("ready"), 2400);
      return () => window.clearTimeout(timer);
    }
    setAnalysisState("idle");
  }, [selectedNumbers]);

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
      return;
    }

    if (selectedNumbers.length >= MAX_NUMBERS) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      return;
    }

    if (selectSoundRef.current) {
      selectSoundRef.current.currentTime = 0;
      selectSoundRef.current.play().catch(() => undefined);
    }
    setSelectedNumbers([...selectedNumbers, num]);
  };

  const remaining = MAX_NUMBERS - selectedNumbers.length;

  const handleSubmit = () => {
    if (selectedNumbers.length !== MAX_NUMBERS || submitting) return;
    setSubmitting(true);
    onComplete?.(selectedNumbers);
    trackPixelEvent("IntuitionSubmit");
    window.setTimeout(() => {
      setSubmitting(false);
      onNext();
    }, 3200);
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <p className="meta-label text-primary">Etapa 2</p>
          <h1 className="heading-1">Desafio contra o Sistema LOTER.IA</h1>
          <p className="body-lead max-w-2xl mx-auto">Escolha 6 dezenas como você costuma apostar.</p>
          <div className={`text-lg sm:text-2xl font-bold slot-highlight inline-flex items-center justify-center px-6 py-2 ${shake ? "shake" : ""}`}>
            {selectedNumbers.length}/{MAX_NUMBERS} escolhidos{" "}
            {remaining > 0 ? `— selecione mais ${remaining}` : "— pronto para comparar"}
          </div>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-border">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
            {numbers.map((num) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button key={num} onClick={() => handleNumberClick(num)} className={`number-chip ${isSelected ? "number-chip--active" : ""}`}>
                  {num}
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedNumbers.length !== MAX_NUMBERS || submitting || analysisState !== "ready"}
            size="lg"
            className="w-full text-base sm:text-xl py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold disabled:opacity-50"
          >
            {selectedNumbers.length === MAX_NUMBERS
              ? submitting
                ? "IA conferindo seu jogo..."
                : analysisState === "ready"
                ? "Ver meu resultado"
                : "Calibrando comparação..."
              : `Escolha mais ${remaining} dezenas`}
          </Button>

          {analysisState !== "idle" && (
            <p className="text-center text-sm text-muted-foreground animate-fade-in">
              {analysisState === "analyzing"
                ? "Preparando comparação..."
                : "Tudo pronto."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
