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
      const timer = setTimeout(() => setAnalysisState("ready"), 1000);
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
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase">Desafio liberado</p>
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-bold text-foreground">
            Você vs Inteligência Artificial
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Quem entende mais do jogo: sua intuição ou os algoritmos?
          </p>
          <p className="text-sm text-primary">
            Escolha 15 números com a sua cabeça. Se fizer mais pontos que a IA, você ganha 3 giros na Roleta de Prêmios — com bônus de até R$500.
          </p>
          <div className={`text-lg sm:text-2xl font-bold slot-highlight inline-flex items-center justify-center px-6 py-2 ${shake ? "shake" : ""}`}>
            {selectedNumbers.length}/15 selecionados — {remaining > 0 ? `faltam ${remaining}` : "pronto para comparar"}
          </div>
          <p className="text-sm text-muted-foreground">
            Muita gente subestima a intuição... até ela acertar mais que a IA. Vamos ver de que lado você está?
          </p>
        </div>

        <Card className="p-5 sm:p-8 space-y-6 border-2 border-border">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {numbers.map((num) => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className={`number-chip ${isSelected ? "number-chip--active" : ""}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedNumbers.length !== 15 || submitting}
          size="lg"
          className="w-full text-base sm:text-xl py-5 sm:py-6 bg-primary hover:bg-primary-glow text-primary-foreground font-bold disabled:opacity-50"
        >
          {selectedNumbers.length === 15
            ? submitting
              ? "Analisando seu jogo..."
              : "Ver meu resultado"
            : `Selecione mais ${remaining} números`}
        </Button>

        {analysisState !== "idle" && (
          <p className="text-center text-sm text-muted-foreground animate-fade-in">
            {analysisState === "analyzing"
              ? "Seu palpite foi registrado. Preparando comparação..."
              : "Seu jogo foi salvo. Agora é hora de ver quem joga melhor: você ou a Inteligência Artificial."}
          </p>
        )}
        </Card>
      </div>
    </div>
  );
};


