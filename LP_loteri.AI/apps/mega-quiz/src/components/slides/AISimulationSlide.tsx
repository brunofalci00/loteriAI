import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";
import { megaQuizConfig, currencyFormatter } from "@/config/mega";

interface AISimulationSlideProps {
  onNext: () => void;
  userScore: number;
  aiScore: number;
}

type Phase = "scan" | "selection" | "verdict";

const { aiNumbers, totalNumbers, manualPrize, iaPrize } = megaQuizConfig;

const animateToValue = (target: number, setter: (value: number) => void) => {
  const duration = 1400;
  let start: number | null = null;
  let frameId = 0;

  const step = (timestamp: number) => {
    if (start === null) {
      start = timestamp;
    }
    const progress = Math.min((timestamp - start) / duration, 1);
    setter(Number((target * progress).toFixed(2)));
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frameId);
};

export const AISimulationSlide = ({ onNext, userScore, aiScore }: AISimulationSlideProps) => {
  const [phase, setPhase] = useState<Phase>("scan");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [verdictReady, setVerdictReady] = useState(false);
  const [manualPrizeDisplay, setManualPrizeDisplay] = useState(0);
  const [iaPrizeDisplay, setIaPrizeDisplay] = useState(0);
  const processingRef = useRef<HTMLAudioElement | null>(null);
  const aiSelectSoundRef = useRef<HTMLAudioElement | null>(null);
  const aiResultSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    processingRef.current = new Audio("/sounds/processing-loop.mp3");
    processingRef.current.loop = true;
    processingRef.current.volume = 0.05;
    processingRef.current.play().catch(() => undefined);
    return () => {
      processingRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    aiSelectSoundRef.current = new Audio("/sounds/ai-select.mp3");
    aiSelectSoundRef.current.volume = 0.2;
    aiResultSoundRef.current = new Audio("/sounds/ai-result.mp3");
    aiResultSoundRef.current.volume = 0.3;
    return () => {
      aiSelectSoundRef.current = null;
      aiResultSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const selectionDelay = 3200;
    const verdictDelay = selectionDelay + aiNumbers.length * 320 + 2400;
    const timers = [
      window.setTimeout(() => setPhase("selection"), selectionDelay),
      window.setTimeout(() => setPhase("verdict"), verdictDelay),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "selection") return;
    setSelectedNumbers([]);
    let index = 0;
    const timer = window.setInterval(() => {
      setSelectedNumbers((prev) => [...prev, aiNumbers[index]]);
      if (aiSelectSoundRef.current) {
        aiSelectSoundRef.current.currentTime = 0;
        aiSelectSoundRef.current.play().catch(() => undefined);
      }
      index += 1;
      if (index >= aiNumbers.length) {
        window.clearInterval(timer);
      }
    }, 320);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "verdict") return;
    processingRef.current?.pause();
    processingRef.current = null;
    setVerdictReady(false);
    const timer = window.setTimeout(() => setVerdictReady(true), 2200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!verdictReady) {
      setManualPrizeDisplay(0);
      setIaPrizeDisplay(0);
      return;
    }
    aiResultSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("AISimulationVerdict", { userScore, aiScore });
    const cancelManual = animateToValue(manualPrize, setManualPrizeDisplay);
    const cancelIa = animateToValue(iaPrize, setIaPrizeDisplay);
    return () => {
      cancelManual();
      cancelIa();
    };
  }, [verdictReady, userScore, aiScore]);

  const allNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <Card className="p-5 border border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="meta-label text-primary">SISTEMA LOTER.IA</p>
              <p className="text-muted-foreground">Processando</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">Etapa 2</div>
          </div>
        </Card>

        {phase === "scan" && (
          <Card className="p-8 flex flex-col items-center gap-4 border border-border">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-center text-sm text-muted-foreground">
              Analisando...
            </p>
          </Card>
        )}

        {phase === "selection" && (
          <Card className="p-6 space-y-4 border border-border">
            <p className="text-center text-sm text-muted-foreground">Sistema LOTER.IA selecionando as dezenas.</p>
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 sm:gap-3">
              {allNumbers.map((num) => (
                <div key={num} className={`number-cell ${selectedNumbers.includes(num) ? "number-cell--active" : ""}`}>
                  {num}
                </div>
              ))}
            </div>
          </Card>
        )}

        {phase === "verdict" && (
          <Card className="p-6 space-y-6 border border-border">
            <div className="space-y-2 text-center">
              <p className="meta-label">COMPARATIVO FINAL</p>
              <p className="heading-3">Resultado do desafio</p>
            </div>
            {verdictReady ? (
              <>
                <div className="scoreboard">
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">Sua escolha</p>
                    <p className="scoreboard__value scoreboard__value--fail">{userScore}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">{userScore === 1 ? "1 ponto" : `${userScore} pontos`}</p>
                  </div>
                  <div className="scoreboard__separator" />
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">Escolha do sistema</p>
                    <p className="scoreboard__value scoreboard__value--win">{aiScore}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">{aiScore === 1 ? "1 ponto" : `${aiScore} pontos`}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-4 bg-secondary/60 border border-border/60">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Resultado estimado com intuição</p>
                    <p className="text-3xl font-bold text-muted-foreground">
                      {currencyFormatter.format(manualPrizeDisplay)}
                    </p>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-primary/10 to-gold/30 border border-primary/40">
                    <p className="text-xs uppercase text-muted-foreground mb-1">Resultado estimado com o sistema</p>
                    <p className="text-3xl font-bold text-primary text-glow">
                      {currencyFormatter.format(iaPrizeDisplay)}
                    </p>
                  </Card>
                </div>

                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  <p>O Sistema LOTER.IA venceu este desafio.</p>
                  <p>O sistema não libera o acesso automaticamente.</p>
                  <p>Mas, por mérito, você ganhou 1 chance de tentar liberar o acesso.</p>
                </div>
                <Button onClick={onNext} size="lg" className="w-full text-base sm:text-xl py-5">
                  Continuar
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground text-center">
                  Processando...
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
