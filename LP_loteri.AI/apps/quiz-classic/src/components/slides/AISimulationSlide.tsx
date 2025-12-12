import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trackPixelEvent } from "@/lib/analytics";

interface AISimulationSlideProps {
  onNext: () => void;
  userScore: number;
  aiScore: number;
  userNumbers: number[];
  aiNumbers: number[];
  drawnNumbers: number[];
  userSpins: number;
  aiSpins: number;
}

type Phase = "scan" | "selection" | "verdict";

export const AISimulationSlide = ({
  onNext,
  userScore,
  aiScore,
  userNumbers,
  aiNumbers,
  drawnNumbers,
  userSpins,
  aiSpins,
}: AISimulationSlideProps) => {
  const [phase, setPhase] = useState<Phase>("scan");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [verdictReady, setVerdictReady] = useState(false);
  const [showSpinReveal, setShowSpinReveal] = useState(false);
  const [tensionLine, setTensionLine] = useState<string | null>(null);
  const processingRef = useRef<HTMLAudioElement | null>(null);
  const aiSelectSoundRef = useRef<HTMLAudioElement | null>(null);
  const aiResultSoundRef = useRef<HTMLAudioElement | null>(null);
  const loadingSteps = useRef<number[]>([0, 0, 0]);
  const selectedNumbersRef = useRef<number[]>([]);

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
    const timers = [setTimeout(() => setPhase("selection"), selectionDelay), setTimeout(() => setPhase("verdict"), verdictDelay)];
    return () => timers.forEach(clearTimeout);
  }, [aiNumbers.length]);

  useEffect(() => {
    if (phase !== "selection") return;
    selectedNumbersRef.current = [];
    setSelectedNumbers([]);
    let index = 0;
    const timer = setInterval(() => {
      // Accumulate in ref
      selectedNumbersRef.current = [...selectedNumbersRef.current, aiNumbers[index]];
      // Update state in batches of 3 to reduce re-renders from 15 to 5
      if (index % 3 === 0 || index === aiNumbers.length - 1) {
        setSelectedNumbers([...selectedNumbersRef.current]);
      }
      if (aiSelectSoundRef.current) {
        aiSelectSoundRef.current.currentTime = 0;
        aiSelectSoundRef.current.play().catch(() => undefined);
      }
      index += 1;
      if (index >= aiNumbers.length) {
        clearInterval(timer);
        // Final update to ensure all numbers are shown
        setSelectedNumbers([...selectedNumbersRef.current]);
      }
    }, 320);
    return () => clearInterval(timer);
  }, [aiNumbers, phase]);

  useEffect(() => {
    if (phase !== "verdict") return;
    processingRef.current?.pause();
    processingRef.current = null;
    setVerdictReady(false);
    setTensionLine("Você chegou longe... mas a IA foi além.");
    const suspenseTimer = setTimeout(() => setTensionLine("Ela viu acertos que você não viu."), 900);
    const timer = setTimeout(() => setVerdictReady(true), 2200);
    return () => {
      clearTimeout(timer);
      clearTimeout(suspenseTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (!verdictReady) return;
    aiResultSoundRef.current?.play().catch(() => undefined);
    trackPixelEvent("AISimulationVerdict", { userScore, aiScore });
    const timer = setTimeout(() => setShowSpinReveal(true), 600);
    return () => clearTimeout(timer);
  }, [verdictReady, userScore, aiScore]);

  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

  useEffect(() => {
    const stepDuration = 1400;
    const tick = 120;
    let activeStep = 0;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += tick;
      const pct = Math.min(100, Math.round((elapsed / stepDuration) * 100));
      loadingSteps.current = loadingSteps.current.map((value, index) => {
        if (index < activeStep) return 100;
        if (index === activeStep) return pct;
        return value;
      });
      forceRender((v) => v + 1);
      if (pct >= 100) {
        activeStep += 1;
        elapsed = 0;
        if (activeStep >= loadingSteps.current.length) {
          clearInterval(interval);
        }
      }
    }, tick);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slide-shell relative">
      <div className="casino-grid" />
      <div className="slide-frame space-y-6 relative z-10">
        <Card className="p-5 border border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="meta-label text-primary">IA em ação</p>
              <p className="text-muted-foreground">
                {phase === "scan" ? "Auditando sua decisão." : phase === "selection" ? "Escolhendo 15 números." : "Placar final pronto."}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">Painel protegido em tempo real</div>
          </div>
        </Card>

        {phase === "scan" && (
          <Card className="p-8 flex flex-col items-center gap-4 border border-border">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-center text-sm text-muted-foreground">IA auditando 2.500 sorteios e calculando probabilidades...</p>
            <div className="w-full space-y-3">
              {["Conferindo sorteios", "Processando IA", "Preparando o duelo"].map((label, index) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{label}</span>
                    <span>{loadingSteps.current[index]}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${loadingSteps.current[index]}%`, transition: "width 0.2s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {phase === "selection" && (
          <Card className="p-6 space-y-4 border border-border">
            <p className="text-center text-sm text-muted-foreground">IA escolhendo 15 números com maior chance agora.</p>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {allNumbers.map((num) => (
                <div key={num} className={`number-cell ${selectedNumbers.includes(num) ? "number-cell--active soft-pulse" : ""}`}>
                  {num}
                </div>
              ))}
            </div>
          </Card>
        )}

        {phase === "verdict" && (
          <Card className="p-6 space-y-6 border border-border">
            <div className="space-y-2 text-center">
              <p className="meta-label">Comparativo final</p>
              <p className="heading-3">A IA está jogando por você agora.</p>
            </div>
            {verdictReady ? (
              <>
                <div className="scoreboard">
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">Você</p>
                    <p className="scoreboard__value scoreboard__value--fail">{userScore}</p>
                  </div>
                  <div className="scoreboard__separator" />
                  <div className="scoreboard__side">
                    <p className="text-xs text-muted-foreground uppercase">IA</p>
                    <p className="scoreboard__value scoreboard__value--win">{aiScore}</p>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <div className="bg-secondary/50 rounded-2xl p-4">
                    <p className="text-base sm:text-lg text-foreground font-semibold">
                      A IA acertou {aiScore} números. Você acertou {userScore}.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Ela viu padrões que não aparecem no olho nu.</p>
                </div>
                {showSpinReveal && (
                  <div className="bg-secondary rounded-2xl p-4 border border-primary/20 text-sm text-left sm:text-center space-y-1">
                    <p className="font-semibold text-primary">Bônus reservado</p>
                    <p>Ela usou {aiSpins} giros e guardou 1 pra você.</p>
                    <p className="text-muted-foreground">Esse giro libera até R$500 em desconto.</p>
                  </div>
                )}
                <Button onClick={onNext} size="lg" className="w-full text-base sm:text-xl py-5 flex items-center justify-center gap-2 tap-intent">
                  <span role="img" aria-hidden="true">
                    🎰
                  </span>
                  Seguir para o giro
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground text-center">
                  IA consolidando os pontos e auditando o painel para liberar seu relatório final...
                </p>
                {tensionLine && <p className="text-sm text-primary text-center micro-toast">{tensionLine}</p>}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
