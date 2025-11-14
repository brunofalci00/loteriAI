import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackPixelEvent } from "@/lib/analytics";

interface IntuitionGameSlideProps {
  onNext: () => void;
  onComplete?: (selection: number[]) => void;
}

export const IntuitionGameSlide = ({ onNext, onComplete }: IntuitionGameSlideProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [analysisState, setAnalysisState] = useState<"idle" | "analyzing" | "ready">("idle");
  const [submitting, setSubmitting] = useState(false);
  const selectSoundRef = useRef<HTMLAudioElement | null>(null);

  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);

  useEffect(() => {
    selectSoundRef.current = new Audio("/sounds/select-number.mp3");
    return () => {
      selectSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (selectedNumbers.length === 15) {
      setAnalysisState("analyzing");
      const timer = setTimeout(() => setAnalysisState("ready"), 2400);
      return () => clearTimeout(timer);
    }
    setAnalysisState("idle");
  }, [selectedNumbers]);

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
      return;
    }

    if (selectedNumbers.length >= 15) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (selectSoundRef.current) {
      selectSoundRef.current.currentTime = 0;
      selectSoundRef.current.play().catch(() => undefined);
    }
    setSelectedNumbers([...selectedNumbers, num]);
  };

  const remaining = 15 - selectedNumbers.length;

  const handleSubmit = () => {
    if (selectedNumbers.length !== 15 || submitting) return;
    setSubmitting(true);
    onComplete?.(selectedNumbers);
    trackPixelEvent("IntuitionSubmit");
    setTimeout(() => {
      setSubmitting(false);
      onNext();
    }, 3200);
  };

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <p className="meta-label text-primary flex items-center justify-center gap-2">🎲 Desafio liberado</p>
          <h1 className="heading-1">Monte seu jogo do seu jeito</h1>
          <p className="body-lead max-w-2xl mx-auto">
            Escolha 15 números do jeito que você costuma apostar. Depois mostramos o jogo que a IA montou para o mesmo sorteio.
          </p>
          <div className={`text-lg sm:text-2xl font-bold slot-highlight inline-flex items-center justify-center px-6 py-2 ${shake ? "shake" : ""}`}>
            {selectedNumbers.length}/15 escolhidos {remaining > 0 ? `— selecione mais ${remaining}` : "— pronto para comparar"}
          </div>
          <p className="text-sm text-muted-foreground">Toque uma vez para ligar ou desligar cada número. Dá para revisar antes de enviar.</p>
        </div>

        <Card className="p-5 sm:p-6 space-y-6 border border-border">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
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
            disabled={selectedNumbers.length !== 15 || submitting || analysisState !== "ready"}
            size="lg"
            className="w-full text-base sm:text-xl py-5 bg-primary hover:bg-primary-glow text-primary-foreground font-bold disabled:opacity-50"
          >
            {selectedNumbers.length === 15
              ? submitting
                ? "IA conferindo seu jogo..."
                : analysisState === "ready"
                ? "Ver meu resultado"
                : "Calibrando comparação..."
              : `Selecione mais ${remaining} números`}
          </Button>

          {analysisState !== "idle" && (
            <p className="text-center text-sm text-muted-foreground animate-fade-in">
              {analysisState === "analyzing"
                ? "Seu palpite foi registrado. Preparando comparação..."
                : "Tudo pronto. A IA já está posicionada para analisar o seu jogo."}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
